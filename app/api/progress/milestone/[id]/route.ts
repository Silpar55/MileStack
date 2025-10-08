import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignmentUserProgress,
  learningMilestones,
} from "@/shared/schema-assignments";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestoneId = params.id;
    const body = await request.json();
    const { userId, status, progressPercentage, evidence } = body;

    if (!milestoneId || !userId) {
      return NextResponse.json(
        { error: "Milestone ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if milestone exists
    const milestone = await db
      .select()
      .from(learningMilestones)
      .where(eq(learningMilestones.id, milestoneId))
      .limit(1);

    if (milestone.length === 0) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Get the assignment ID from the milestone
    const milestoneData = milestone[0];
    const assignmentId = milestoneData.assignmentId;

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(assignmentUserProgress)
      .where(
        and(
          eq(assignmentUserProgress.userId, userId),
          eq(assignmentUserProgress.assignmentId, assignmentId)
        )
      )
      .limit(1);

    let progress;
    if (existingProgress.length > 0) {
      // Update existing progress
      const currentProgress = existingProgress[0];
      const newPointsEarned =
        status === "completed" ? milestoneData.pointsReward : 0;
      const newCheckpointsPassed = status === "completed" ? 1 : 0;

      progress = await db
        .update(assignmentUserProgress)
        .set({
          currentMilestoneId: status === "completed" ? null : milestoneId,
          pointsEarned: currentProgress.pointsEarned + newPointsEarned,
          totalCheckpointsPassed:
            currentProgress.totalCheckpointsPassed + newCheckpointsPassed,
          progressPercentage:
            progressPercentage || currentProgress.progressPercentage,
          lastActivity: new Date(),
        })
        .where(eq(assignmentUserProgress.userId, userId))
        .returning();
    } else {
      // Create new progress
      const newPointsEarned =
        status === "completed" ? milestoneData.pointsReward : 0;
      const newCheckpointsPassed = status === "completed" ? 1 : 0;

      progress = await db
        .insert(assignmentUserProgress)
        .values({
          userId,
          assignmentId,
          currentMilestoneId: status === "completed" ? null : milestoneId,
          pointsEarned: newPointsEarned,
          totalCheckpointsPassed: newCheckpointsPassed,
          progressPercentage: progressPercentage || 0,
          lastActivity: new Date(),
        })
        .returning();
    }

    // If milestone is completed, update the milestone status
    if (status === "completed") {
      await db
        .update(learningMilestones)
        .set({
          status: "completed",
        })
        .where(eq(learningMilestones.id, milestoneId));
    }

    return NextResponse.json({
      success: true,
      progress: progress[0],
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestoneId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!milestoneId || !userId) {
      return NextResponse.json(
        { error: "Milestone ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get milestone details first to get assignment ID
    const milestone = await db
      .select()
      .from(learningMilestones)
      .where(eq(learningMilestones.id, milestoneId))
      .limit(1);

    if (milestone.length === 0) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const assignmentId = milestone[0].assignmentId;

    // Get user progress for this assignment
    const progress = await db
      .select()
      .from(assignmentUserProgress)
      .where(
        and(
          eq(assignmentUserProgress.userId, userId),
          eq(assignmentUserProgress.assignmentId, assignmentId)
        )
      )
      .limit(1);

    if (progress.length === 0) {
      return NextResponse.json({
        assignmentId,
        userId,
        currentMilestoneId: null,
        pointsEarned: 0,
        totalCheckpointsPassed: 0,
        progressPercentage: 0,
        lastActivity: null,
      });
    }

    return NextResponse.json(progress[0]);
  } catch (error) {
    console.error("Progress retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
