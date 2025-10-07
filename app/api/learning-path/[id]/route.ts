import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  learningPathways,
  pathwayCheckpoints,
  pathwayProgress,
  checkpointAttempts,
  competencyAssessments,
} from "@/shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

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

    // Get pathway details
    const pathway = await db
      .select()
      .from(learningPathways)
      .where(eq(learningPathways.id, params.id))
      .limit(1);

    if (pathway.length === 0) {
      return NextResponse.json(
        { error: "Learning pathway not found" },
        { status: 404 }
      );
    }

    // Get checkpoints for this pathway
    const checkpoints = await db
      .select()
      .from(pathwayCheckpoints)
      .where(
        and(
          eq(pathwayCheckpoints.pathwayId, params.id),
          eq(pathwayCheckpoints.isActive, true)
        )
      )
      .orderBy(asc(pathwayCheckpoints.order));

    // Get user's progress on this pathway
    const progress = await db
      .select()
      .from(pathwayProgress)
      .where(
        and(
          eq(pathwayProgress.pathwayId, params.id),
          eq(pathwayProgress.userId, userId)
        )
      )
      .limit(1);

    // Get user's attempts for each checkpoint
    const userCheckpointAttempts = await db
      .select()
      .from(checkpointAttempts)
      .where(eq(checkpointAttempts.userId, userId));

    // Get competency assessments
    const assessments = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId));

    // Calculate progress statistics
    const totalCheckpoints = checkpoints.length;
    const completedCheckpoints =
      progress.length > 0 ? progress[0].completedCheckpoints : 0;
    const totalPoints = progress.length > 0 ? progress[0].totalPoints : 0;
    const timeSpent = progress.length > 0 ? progress[0].timeSpent : 0;

    // Determine current checkpoint
    let currentCheckpoint = null;
    if (progress.length > 0 && progress[0].currentCheckpoint) {
      currentCheckpoint = checkpoints.find(
        (c) => c.id === progress[0].currentCheckpoint
      );
    } else if (checkpoints.length > 0) {
      currentCheckpoint = checkpoints[0];
    }

    // Check if pathway is locked (prerequisites not met)
    const isLocked = await checkPrerequisites(pathway[0], userId);

    const response = {
      pathway: {
        ...pathway[0],
        totalCheckpoints,
        estimatedDuration: pathway[0].estimatedDuration,
      },
      checkpoints: checkpoints.map((checkpoint) => {
        const attempts = userCheckpointAttempts.filter(
          (attempt) => attempt.checkpointId === checkpoint.id
        );
        const assessment = assessments.find(
          (a) => a.checkpointId === checkpoint.id
        );

        return {
          ...checkpoint,
          attempts: attempts.length,
          lastAttempt:
            attempts.length > 0 ? attempts[attempts.length - 1] : null,
          assessment: assessment || null,
          isCompleted: assessment?.isPassed || false,
          isLocked:
            checkpoint.prerequisites &&
            Array.isArray(checkpoint.prerequisites) &&
            (checkpoint.prerequisites as any[]).length > 0,
        };
      }),
      progress: {
        status: progress.length > 0 ? progress[0].status : "not-started",
        currentCheckpoint: currentCheckpoint?.id || null,
        completedCheckpoints,
        totalCheckpoints,
        totalPoints,
        timeSpent,
        startedAt: progress.length > 0 ? progress[0].startedAt : null,
        completedAt: progress.length > 0 ? progress[0].completedAt : null,
        lastAccessedAt: progress.length > 0 ? progress[0].lastAccessedAt : null,
      },
      isLocked,
      canProceed:
        !isLocked &&
        (completedCheckpoints === totalCheckpoints ||
          currentCheckpoint !== null),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Learning pathway fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning pathway" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      userId,
      status,
      currentCheckpoint,
      totalPoints,
      completedCheckpoints,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update or create progress record
    const existingProgress = await db
      .select()
      .from(pathwayProgress)
      .where(
        and(
          eq(pathwayProgress.pathwayId, params.id),
          eq(pathwayProgress.userId, userId)
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing progress
      await db
        .update(pathwayProgress)
        .set({
          status,
          currentCheckpoint,
          totalPoints: totalPoints || existingProgress[0].totalPoints,
          completedCheckpoints:
            completedCheckpoints || existingProgress[0].completedCheckpoints,
          timeSpent: (existingProgress[0].timeSpent || 0) + 1, // Increment by 1 minute
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pathwayProgress.id, existingProgress[0].id));
    } else {
      // Create new progress record
      await db.insert(pathwayProgress).values({
        pathwayId: params.id,
        userId,
        status: status || "in-progress",
        currentCheckpoint,
        totalPoints: totalPoints || 0,
        completedCheckpoints: completedCheckpoints || 0,
        totalCheckpoints: 0, // Will be updated when checkpoints are loaded
        timeSpent: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pathway progress updated successfully",
    });
  } catch (error) {
    console.error("Pathway progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update pathway progress" },
      { status: 500 }
    );
  }
}

async function checkPrerequisites(
  pathway: any,
  userId: string
): Promise<boolean> {
  if (!pathway.prerequisites || pathway.prerequisites.length === 0) {
    return false;
  }

  // Check if user has completed prerequisite pathways
  for (const prerequisiteId of pathway.prerequisites) {
    const prerequisiteProgress = await db
      .select()
      .from(pathwayProgress)
      .where(
        and(
          eq(pathwayProgress.pathwayId, prerequisiteId),
          eq(pathwayProgress.userId, userId),
          eq(pathwayProgress.status, "completed")
        )
      )
      .limit(1);

    if (prerequisiteProgress.length === 0) {
      return true; // Pathway is locked
    }
  }

  return false; // All prerequisites met
}
