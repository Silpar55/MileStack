import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  pathwayProgress,
  learningPathways,
  pathwayCheckpoints,
} from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";

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

    // Get user's pathway progress
    const userProgress = await db
      .select()
      .from(pathwayProgress)
      .where(eq(pathwayProgress.userId, userId))
      .orderBy(desc(pathwayProgress.lastAccessedAt));

    // Get pathway details and checkpoints for each progress record
    const pathwayProgressData = [];

    for (const progress of userProgress) {
      const pathway = await db
        .select()
        .from(learningPathways)
        .where(eq(learningPathways.id, progress.pathwayId))
        .limit(1);

      if (pathway.length > 0) {
        const checkpoints = await db
          .select()
          .from(pathwayCheckpoints)
          .where(
            and(
              eq(pathwayCheckpoints.pathwayId, progress.pathwayId),
              eq(pathwayCheckpoints.isActive, true)
            )
          )
          .orderBy(pathwayCheckpoints.order);

        const progressPercentage = Math.round(
          ((progress.completedCheckpoints || 0) /
            (progress.totalCheckpoints || 1)) *
            100
        );

        pathwayProgressData.push({
          id: progress.pathwayId,
          title: pathway[0].title,
          category: pathway[0].category,
          difficulty: pathway[0].difficulty,
          progress: progressPercentage,
          status: progress.status,
          pointsEarned: progress.totalPoints || 0,
          timeSpent: progress.timeSpent || 0,
          lastAccessed: progress.lastAccessedAt,
          checkpoints: checkpoints.map((c) => ({
            id: c.id,
            title: c.title,
            type: c.type,
            points: c.points,
            isCompleted: false, // This would need to be calculated based on user's attempts
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: pathwayProgressData,
    });
  } catch (error) {
    console.error("Dashboard progress fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard progress" },
      { status: 500 }
    );
  }
}
