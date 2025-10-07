import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  pathwayCheckpoints,
  checkpointAttempts,
  competencyAssessments,
  pathwayProgress,
} from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { competencyAssessmentService } from "@/shared/competency-assessment";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, responses, timeSpent } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get checkpoint details
    const checkpoint = await db
      .select()
      .from(pathwayCheckpoints)
      .where(eq(pathwayCheckpoints.id, params.id))
      .limit(1);

    if (checkpoint.length === 0) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Get user's previous attempts
    const previousAttempts = await db
      .select()
      .from(checkpointAttempts)
      .where(
        and(
          eq(checkpointAttempts.checkpointId, params.id),
          eq(checkpointAttempts.userId, userId)
        )
      )
      .orderBy(desc(checkpointAttempts.attemptNumber));

    const attemptNumber = previousAttempts.length + 1;

    // Check if checkpoint exists
    if (checkpoint.length === 0) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    const checkpointData = checkpoint[0];
    if (!checkpointData) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Check if user has exceeded max attempts
    if (attemptNumber > (checkpointData.maxAttempts || 3)) {
      return NextResponse.json(
        { error: "Maximum attempts exceeded" },
        { status: 400 }
      );
    }

    // Evaluate the assessment based on type
    let assessmentResult;

    if (checkpointData.type === "concept-explanation") {
      assessmentResult =
        await competencyAssessmentService.evaluateConceptExplanation({
          type: "concept-explanation",
          prompt: (checkpointData.content as any).prompt,
          studentResponse: responses.explanation,
          expectedConcepts: (checkpointData.content as any).expectedConcepts,
          difficulty: (checkpointData.content as any).difficulty,
        });
    } else if (checkpointData.type === "skill-assessment") {
      assessmentResult =
        await competencyAssessmentService.evaluateSkillAssessment({
          type: "skill-assessment",
          questions: (checkpointData.content as any).questions,
          studentResponses: responses,
          timeLimit: checkpointData.timeLimit || 30,
        });
    } else if (checkpointData.type === "code-review") {
      assessmentResult = await competencyAssessmentService.evaluateCodeReview({
        type: "code-review",
        codeSnippet: (checkpointData.content as any).codeSnippet,
        issues: (checkpointData.content as any).issues,
        studentAnalysis: responses.analysis,
        expectedIssues: (checkpointData.content as any).expectedIssues,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid assessment type" },
        { status: 400 }
      );
    }

    // Calculate points earned
    const pointsEarned = assessmentResult.isPassed ? checkpointData.points : 0;

    // Create attempt record
    const attempt = await db
      .insert(checkpointAttempts)
      .values({
        checkpointId: params.id,
        userId,
        attemptNumber,
        responses,
        score: assessmentResult.score,
        pointsEarned,
        timeSpent: timeSpent || 0,
        feedback: assessmentResult.feedback,
        status: assessmentResult.isPassed ? "completed" : "failed",
        completedAt: new Date(),
      })
      .returning();

    // Create competency assessment record
    await db.insert(competencyAssessments).values({
      checkpointId: params.id,
      userId,
      assessmentType: checkpointData.type,
      content: responses,
      aiAnalysis: assessmentResult.detailedAnalysis,
      comprehensionScore: assessmentResult.comprehensionScore,
      accuracyScore: assessmentResult.accuracyScore,
      overallScore: assessmentResult.score,
      feedback: assessmentResult.feedback,
      isPassed: assessmentResult.isPassed,
      evaluatedAt: new Date(),
    });

    // Update pathway progress if assessment passed
    if (assessmentResult.isPassed) {
      await updatePathwayProgress(
        checkpointData.pathwayId,
        userId,
        pointsEarned
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        attempt: attempt[0],
        assessmentResult,
        pointsEarned,
        isPassed: assessmentResult.isPassed,
        feedback: assessmentResult.feedback,
        strengths: assessmentResult.strengths,
        weaknesses: assessmentResult.weaknesses,
        recommendations: assessmentResult.recommendations,
      },
    });
  } catch (error) {
    console.error("Checkpoint attempt error:", error);
    return NextResponse.json(
      { error: "Failed to process checkpoint attempt" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get checkpoint details
    const checkpoint = await db
      .select()
      .from(pathwayCheckpoints)
      .where(eq(pathwayCheckpoints.id, params.id))
      .limit(1);

    if (checkpoint.length === 0) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Get user's attempts
    const attempts = await db
      .select()
      .from(checkpointAttempts)
      .where(
        and(
          eq(checkpointAttempts.checkpointId, params.id),
          eq(checkpointAttempts.userId, userId)
        )
      )
      .orderBy(desc(checkpointAttempts.attemptNumber));

    // Get competency assessments
    const assessments = await db
      .select()
      .from(competencyAssessments)
      .where(
        and(
          eq(competencyAssessments.checkpointId, params.id),
          eq(competencyAssessments.userId, userId)
        )
      )
      .orderBy(desc(competencyAssessments.submittedAt));

    return NextResponse.json({
      success: true,
      data: {
        checkpoint: checkpoint[0],
        attempts,
        assessments,
        totalAttempts: attempts.length,
        maxAttempts: checkpoint[0]?.maxAttempts || 3,
        isCompleted: assessments.length > 0 && assessments[0]?.isPassed,
        canRetry: attempts.length < (checkpoint[0]?.maxAttempts || 3),
      },
    });
  } catch (error) {
    console.error("Checkpoint fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkpoint data" },
      { status: 500 }
    );
  }
}

async function updatePathwayProgress(
  pathwayId: string,
  userId: string,
  pointsEarned: number
) {
  try {
    // Get current progress
    const progress = await db
      .select()
      .from(pathwayProgress)
      .where(
        and(
          eq(pathwayProgress.pathwayId, pathwayId),
          eq(pathwayProgress.userId, userId)
        )
      )
      .limit(1);

    if (progress.length > 0 && progress[0]) {
      const progressEntry = progress[0];
      // Update existing progress
      await db
        .update(pathwayProgress)
        .set({
          totalPoints: (progressEntry.totalPoints || 0) + pointsEarned,
          completedCheckpoints: (progressEntry.completedCheckpoints || 0) + 1,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pathwayProgress.id, progressEntry.id));
    } else {
      // Create new progress record
      await db.insert(pathwayProgress).values({
        pathwayId,
        userId,
        status: "in-progress",
        totalPoints: pointsEarned,
        completedCheckpoints: 1,
        totalCheckpoints: 0, // Will be updated when checkpoints are loaded
        timeSpent: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Pathway progress update error:", error);
  }
}
