import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  pathwayProgress,
  checkpointAttempts,
  competencyAssessments,
  learningPathways,
} from "@/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get total pathways
    const totalPathways = await db
      .select({ count: learningPathways.id })
      .from(learningPathways)
      .where(
        and(
          eq(learningPathways.isActive, true),
          eq(learningPathways.isPublic, true)
        )
      );

    // Get user's pathway progress
    const userProgress = await db
      .select()
      .from(pathwayProgress)
      .where(eq(pathwayProgress.userId, userId));

    // Get completed pathways
    const completedPathways = userProgress.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgressPathways = userProgress.filter(
      (p) => p.status === "in-progress"
    ).length;

    // Get total points earned
    const totalPoints = userProgress.reduce(
      (sum, p) => sum + (p.totalPoints || 0),
      0
    );

    // Get total time spent
    const totalTimeSpent = userProgress.reduce(
      (sum, p) => sum + (p.timeSpent || 0),
      0
    );

    // Get competency assessments
    const assessments = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId));

    // Calculate average score
    const averageScore =
      assessments.length > 0
        ? Math.round(
            assessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) /
              assessments.length
          )
        : 0;

    // Calculate learning streak (simplified - would need more complex logic in production)
    const currentStreak = await calculateLearningStreak(userId);
    const longestStreak = await calculateLongestStreak(userId);

    const stats = {
      totalPathways: totalPathways.length,
      completedPathways,
      inProgressPathways,
      totalPoints,
      totalTimeSpent,
      averageScore,
      currentStreak,
      longestStreak,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

async function calculateLearningStreak(userId: string): Promise<number> {
  try {
    // This is a simplified calculation
    // In production, you'd want to track daily learning activity
    const recentActivity = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId))
      .orderBy(desc(competencyAssessments.submittedAt))
      .limit(30);

    let streak = 0;
    let currentDate = new Date();

    for (const activity of recentActivity) {
      const activityDate = new Date(activity.submittedAt);
      const daysDiff = Math.floor(
        (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        streak++;
        currentDate = activityDate;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Learning streak calculation error:", error);
    return 0;
  }
}

async function calculateLongestStreak(userId: string): Promise<number> {
  try {
    // This is a simplified calculation
    // In production, you'd want to track daily learning activity
    const allActivity = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId))
      .orderBy(desc(competencyAssessments.submittedAt));

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const activity of allActivity) {
      const activityDate = new Date(activity.submittedAt);

      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (lastDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }

      lastDate = activityDate;
    }

    return Math.max(longestStreak, currentStreak);
  } catch (error) {
    console.error("Longest streak calculation error:", error);
    return 0;
  }
}
