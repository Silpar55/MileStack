import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  challenges,
  challengeSubmissions,
  userProgress,
  leaderboards,
} from "@/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { codeExecutionService } from "@/shared/code-execution";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, userId, code, language } = body;

    // Validate required fields
    if (!challengeId || !userId || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate language
    const supportedLanguages = [
      "javascript",
      "python",
      "java",
      "cpp",
      "c",
      "csharp",
      "go",
      "rust",
      "php",
      "ruby",
      "swift",
      "kotlin",
    ];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { error: "Unsupported programming language" },
        { status: 400 }
      );
    }

    // Get challenge details
    const challenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const challengeData = challenge[0];

    // Check if challenge is active
    if (!challengeData.isActive || !challengeData.isPublic) {
      return NextResponse.json(
        { error: "Challenge is not available" },
        { status: 403 }
      );
    }

    // Execute code
    const executionResult = await codeExecutionService.executeCode(
      code,
      language,
      challengeData.testCases as any[],
      challengeData.timeLimit || 5000,
      challengeData.memoryLimit || 128
    );

    // Calculate points earned
    const passedTests = executionResult.testResults.filter(
      (result) => result.passed
    ).length;
    const totalTests = executionResult.testResults.length;
    const pointsEarned = Math.floor(
      (challengeData.points * passedTests) / totalTests
    );

    // Check if this is the first solve
    const existingSubmission = await db
      .select()
      .from(challengeSubmissions)
      .where(
        and(
          eq(challengeSubmissions.challengeId, challengeId),
          eq(challengeSubmissions.userId, userId),
          eq(challengeSubmissions.status, "passed")
        )
      )
      .limit(1);

    const isFirstSolve =
      existingSubmission.length === 0 && executionResult.status === "passed";

    // Create submission record
    const submission = await db
      .insert(challengeSubmissions)
      .values({
        challengeId,
        userId,
        code,
        language,
        status: executionResult.status,
        executionTime: executionResult.executionTime,
        memoryUsed: executionResult.memoryUsed,
        testResults: executionResult.testResults,
        errorMessage: executionResult.errorMessage,
        pointsEarned,
        isFirstSolve,
      })
      .returning();

    // Update user progress
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.challengeId, challengeId)
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      const progress = existingProgress[0];
      if (progress) {
        // Update existing progress
        await db
          .update(userProgress)
          .set({
            attempts: (progress.attempts || 0) + 1,
            bestScore: Math.max(progress.bestScore || 0, pointsEarned),
            timeSpent:
              (progress.timeSpent || 0) +
              Math.floor(executionResult.executionTime / 60000), // Convert to minutes
            status:
              executionResult.status === "passed" ? "completed" : "in-progress",
            completedAt:
              executionResult.status === "passed" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(userProgress.id, progress.id));
      }
    } else {
      // Create new progress record
      await db.insert(userProgress).values({
        userId,
        challengeId,
        status:
          executionResult.status === "passed" ? "completed" : "in-progress",
        attempts: 1,
        bestScore: pointsEarned,
        timeSpent: Math.floor(executionResult.executionTime / 60000),
        startedAt: new Date(),
        completedAt: executionResult.status === "passed" ? new Date() : null,
      });
    }

    // Update challenge statistics
    await db
      .update(challenges)
      .set({
        submissionCount: (challengeData.submissionCount || 0) + 1,
        solvedCount:
          executionResult.status === "passed" && isFirstSolve
            ? (challengeData.solvedCount || 0) + 1
            : challengeData.solvedCount || 0,
        updatedAt: new Date(),
      })
      .where(eq(challenges.id, challengeId));

    // Update leaderboard if submission passed
    if (executionResult.status === "passed") {
      // Update overall leaderboard
      const overallLeaderboard = await db
        .select()
        .from(leaderboards)
        .where(
          and(
            eq(leaderboards.userId, userId),
            eq(leaderboards.category, "overall")
          )
        )
        .limit(1);

      if (overallLeaderboard.length > 0 && overallLeaderboard[0]) {
        const leaderboard = overallLeaderboard[0];
        await db
          .update(leaderboards)
          .set({
            points: (leaderboard.points || 0) + pointsEarned,
            challengesSolved:
              (leaderboard.challengesSolved || 0) + (isFirstSolve ? 1 : 0),
            lastSolvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(leaderboards.id, leaderboard.id));
      } else {
        await db.insert(leaderboards).values({
          userId,
          category: "overall",
          points: pointsEarned,
          challengesSolved: 1,
          lastSolvedAt: new Date(),
        });
      }

      // Update category leaderboard
      const categoryLeaderboard = await db
        .select()
        .from(leaderboards)
        .where(
          and(
            eq(leaderboards.userId, userId),
            eq(leaderboards.category, challengeData.category)
          )
        )
        .limit(1);

      if (categoryLeaderboard.length > 0 && categoryLeaderboard[0]) {
        const categoryLeaderboardEntry = categoryLeaderboard[0];
        await db
          .update(leaderboards)
          .set({
            points: (categoryLeaderboardEntry.points || 0) + pointsEarned,
            challengesSolved:
              (categoryLeaderboardEntry.challengesSolved || 0) +
              (isFirstSolve ? 1 : 0),
            lastSolvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(leaderboards.id, categoryLeaderboardEntry.id));
      } else {
        await db.insert(leaderboards).values({
          userId,
          category: challengeData.category,
          points: pointsEarned,
          challengesSolved: 1,
          lastSolvedAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      submission: submission[0],
      executionResult,
      pointsEarned,
      isFirstSolve,
      message:
        executionResult.status === "passed"
          ? "Congratulations! Your solution passed all test cases."
          : "Your solution didn't pass all test cases. Try again!",
    });
  } catch (error) {
    console.error("Challenge submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
