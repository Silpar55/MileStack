import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  challenges,
  challengeSubmissions,
  challengeRatings,
  userProgress,
  users,
} from "@/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Get challenge details
    const challenge = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
        subcategory: challenges.subcategory,
        points: challenges.points,
        timeLimit: challenges.timeLimit,
        memoryLimit: challenges.memoryLimit,
        prerequisites: challenges.prerequisites,
        tags: challenges.tags,
        starterCode: challenges.starterCode,
        testCases: challenges.testCases,
        expectedOutput: challenges.expectedOutput,
        hints: challenges.hints,
        solution: challenges.solution,
        rating: challenges.rating,
        ratingCount: challenges.ratingCount,
        submissionCount: challenges.submissionCount,
        solvedCount: challenges.solvedCount,
        createdAt: challenges.createdAt,
        updatedAt: challenges.updatedAt,
        creator: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(challenges)
      .leftJoin(users, eq(challenges.createdBy, users.id))
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const challengeData = challenge[0];

    // Get user progress if userId provided
    let userProgressData = null;
    if (userId) {
      const progress = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.challengeId, challengeId)
          )
        )
        .limit(1);

      if (progress.length > 0) {
        userProgressData = progress[0];
      }
    }

    // Get recent submissions for this challenge (if user is authenticated)
    let recentSubmissions: any[] = [];
    if (userId) {
      recentSubmissions = await db
        .select({
          id: challengeSubmissions.id,
          status: challengeSubmissions.status,
          language: challengeSubmissions.language,
          executionTime: challengeSubmissions.executionTime,
          pointsEarned: challengeSubmissions.pointsEarned,
          submittedAt: challengeSubmissions.submittedAt,
        })
        .from(challengeSubmissions)
        .where(
          and(
            eq(challengeSubmissions.challengeId, challengeId),
            eq(challengeSubmissions.userId, userId)
          )
        )
        .orderBy(desc(challengeSubmissions.submittedAt))
        .limit(5);
    }

    // Get challenge statistics
    const stats = await db
      .select({
        totalSubmissions: sql<number>`count(*)`,
        passedSubmissions: sql<number>`count(*) filter (where ${challengeSubmissions.status} = 'passed')`,
        averageExecutionTime: sql<number>`avg(${challengeSubmissions.executionTime})`,
        languages: sql<
          string[]
        >`array_agg(distinct ${challengeSubmissions.language})`,
      })
      .from(challengeSubmissions)
      .where(eq(challengeSubmissions.challengeId, challengeId));

    // Get related challenges (same category, different difficulty)
    const relatedChallenges = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        difficulty: challenges.difficulty,
        points: challenges.points,
        solvedCount: challenges.solvedCount,
      })
      .from(challenges)
      .where(
        and(
          eq(challenges.category, challengeData.category),
          eq(challenges.isActive, true),
          eq(challenges.isPublic, true),
          sql`${challenges.id} != ${challengeId}`
        )
      )
      .orderBy(desc(challenges.solvedCount))
      .limit(5);

    return NextResponse.json({
      challenge: challengeData,
      userProgress: userProgressData,
      recentSubmissions,
      stats: stats[0] || {
        totalSubmissions: 0,
        passedSubmissions: 0,
        averageExecutionTime: 0,
        languages: [],
      },
      relatedChallenges,
    });
  } catch (error) {
    console.error("Challenge retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      category,
      subcategory,
      points,
      timeLimit,
      memoryLimit,
      prerequisites,
      tags,
      starterCode,
      testCases,
      expectedOutput,
      hints,
      solution,
    } = body;

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Update challenge
    const updatedChallenge = await db
      .update(challenges)
      .set({
        title,
        description,
        difficulty,
        category,
        subcategory,
        points,
        timeLimit,
        memoryLimit,
        prerequisites,
        tags,
        starterCode,
        testCases,
        expectedOutput,
        hints,
        solution,
        updatedAt: new Date(),
      })
      .where(eq(challenges.id, challengeId))
      .returning();

    return NextResponse.json({
      success: true,
      challenge: updatedChallenge[0],
      message: "Challenge updated successfully",
    });
  } catch (error) {
    console.error("Challenge update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const existingChallenge = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (existingChallenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await db
      .update(challenges)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(challenges.id, challengeId));

    return NextResponse.json({
      success: true,
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    console.error("Challenge deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
