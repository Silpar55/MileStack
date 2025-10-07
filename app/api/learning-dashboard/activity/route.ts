import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  pathwayProgress,
  checkpointAttempts,
  competencyAssessments,
  learningPathways,
  pathwayCheckpoints,
} from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get recent pathway progress changes
    const pathwayProgressChanges = await db
      .select()
      .from(pathwayProgress)
      .where(eq(pathwayProgress.userId, userId))
      .orderBy(desc(pathwayProgress.updatedAt))
      .limit(10);

    // Get recent checkpoint attempts
    const recentCheckpointAttempts = await db
      .select()
      .from(checkpointAttempts)
      .where(eq(checkpointAttempts.userId, userId))
      .orderBy(desc(checkpointAttempts.completedAt))
      .limit(10);

    // Get recent competency assessments
    const assessments = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId))
      .orderBy(desc(competencyAssessments.submittedAt))
      .limit(10);

    // Combine and format activities
    const activities = [];

    // Add pathway progress activities
    for (const progress of pathwayProgressChanges) {
      const pathway = await db
        .select()
        .from(learningPathways)
        .where(eq(learningPathways.id, progress.pathwayId))
        .limit(1);

      if (pathway.length > 0) {
        activities.push({
          id: `pathway-${progress.id}`,
          type:
            progress.status === "completed"
              ? "pathway_completed"
              : "pathway_started",
          title: pathway[0].title,
          description:
            progress.status === "completed"
              ? "Completed learning pathway"
              : "Started learning pathway",
          points: progress.totalPoints || 0,
          timestamp: progress.updatedAt,
          pathwayId: progress.pathwayId,
        });
      }
    }

    // Add checkpoint attempt activities
    for (const attempt of recentCheckpointAttempts) {
      const checkpoint = await db
        .select()
        .from(pathwayCheckpoints)
        .where(eq(pathwayCheckpoints.id, attempt.checkpointId))
        .limit(1);

      if (checkpoint.length > 0) {
        const pathway = await db
          .select()
          .from(learningPathways)
          .where(eq(learningPathways.id, checkpoint[0].pathwayId))
          .limit(1);

        if (pathway.length > 0) {
          activities.push({
            id: `attempt-${attempt.id}`,
            type:
              attempt.status === "completed"
                ? "checkpoint_completed"
                : "assessment_passed",
            title: checkpoint[0].title,
            description:
              attempt.status === "completed"
                ? "Completed checkpoint assessment"
                : "Attempted checkpoint assessment",
            points: attempt.pointsEarned || 0,
            timestamp: attempt.completedAt || attempt.startedAt,
            pathwayId: pathway[0].id,
            checkpointId: checkpoint[0].id,
          });
        }
      }
    }

    // Add competency assessment activities
    for (const assessment of assessments) {
      const checkpoint = await db
        .select()
        .from(pathwayCheckpoints)
        .where(eq(pathwayCheckpoints.id, assessment.checkpointId))
        .limit(1);

      if (checkpoint.length > 0) {
        const pathway = await db
          .select()
          .from(learningPathways)
          .where(eq(learningPathways.id, checkpoint[0].pathwayId))
          .limit(1);

        if (pathway.length > 0) {
          activities.push({
            id: `assessment-${assessment.id}`,
            type: assessment.isPassed
              ? "assessment_passed"
              : "assessment_passed",
            title: checkpoint[0].title,
            description: assessment.isPassed
              ? "Passed competency assessment"
              : "Completed competency assessment",
            points: assessment.isPassed ? checkpoint[0].points : 0,
            timestamp: assessment.submittedAt,
            pathwayId: pathway[0].id,
            checkpointId: checkpoint[0].id,
          });
        }
      }
    }

    // Sort activities by timestamp and limit
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedActivities,
    });
  } catch (error) {
    console.error("Dashboard activity fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard activity" },
      { status: 500 }
    );
  }
}
