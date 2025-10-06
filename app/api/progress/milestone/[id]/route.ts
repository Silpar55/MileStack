import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { userProgress, learningMilestones } from "@/shared/schema-assignments";
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

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.milestoneId, milestoneId)
        )
      )
      .limit(1);

    let progress;
    if (existingProgress.length > 0) {
      // Update existing progress
      progress = await db
        .update(userProgress)
        .set({
          status,
          progressPercentage: progressPercentage || 0,
          evidence,
          updatedAt: new Date(),
          ...(status === "completed" && { completedAt: new Date() }),
          ...(status === "in_progress" &&
            !existingProgress[0].startedAt && { startedAt: new Date() }),
        })
        .where(eq(userProgress.id, existingProgress[0].id))
        .returning();
    } else {
      // Create new progress
      progress = await db
        .insert(userProgress)
        .values({
          userId,
          milestoneId,
          status,
          progressPercentage: progressPercentage || 0,
          evidence,
          ...(status === "in_progress" && { startedAt: new Date() }),
          ...(status === "completed" && {
            startedAt: new Date(),
            completedAt: new Date(),
          }),
        })
        .returning();
    }

    // If milestone is completed, update the milestone status
    if (status === "completed") {
      await db
        .update(learningMilestones)
        .set({
          isCompleted: true,
          completedAt: new Date(),
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

    // Get user progress for this milestone
    const progress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.milestoneId, milestoneId)
        )
      )
      .limit(1);

    if (progress.length === 0) {
      return NextResponse.json({
        milestoneId,
        userId,
        status: "not_started",
        progressPercentage: 0,
        startedAt: null,
        completedAt: null,
        evidence: null,
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
