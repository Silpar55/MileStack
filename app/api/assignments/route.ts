import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalysis,
  learningMilestones,
} from "@/shared/schema-assignments";
import { eq, desc } from "drizzle-orm";
import { auth } from "../../../auth";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all assignments for the current user
    const userAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .orderBy(desc(assignments.uploadTimestamp));

    // Get analysis data for assignments that have been analyzed
    const assignmentsWithAnalysis = await Promise.all(
      userAssignments.map(async (assignment) => {
        if (assignment.analysisStatus === "complete") {
          // Get analysis data
          const analysis = await db
            .select()
            .from(assignmentAnalysis)
            .where(eq(assignmentAnalysis.assignmentId, assignment.id))
            .limit(1);

          // Get milestones
          const milestones = await db
            .select()
            .from(learningMilestones)
            .where(eq(learningMilestones.assignmentId, assignment.id))
            .orderBy(learningMilestones.milestoneOrder);

          return {
            ...assignment,
            analysis: analysis[0] || null,
            milestones: milestones,
          };
        }

        return {
          ...assignment,
          analysis: null,
          milestones: [],
        };
      })
    );

    // Transform the data to match the frontend interface
    const transformedAssignments = assignmentsWithAnalysis.map((assignment) => {
      // Calculate progress based on completed milestones
      let progress = 0;
      if (assignment.milestones.length > 0) {
        const completedMilestones = assignment.milestones.filter(
          (milestone) => milestone.status === "completed"
        ).length;
        progress = Math.round(
          (completedMilestones / assignment.milestones.length) * 100
        );
      }

      // Determine status based on progress and analysis status
      let status: "completed" | "in-progress" | "not-started";
      if (progress === 100) {
        status = "completed";
      } else if (progress > 0 || assignment.analysisStatus === "complete") {
        status = "in-progress";
      } else {
        status = "not-started";
      }

      // Calculate total points from milestones
      const totalPoints = assignment.milestones.reduce(
        (sum, milestone) => sum + milestone.pointsReward,
        0
      );

      return {
        id: assignment.id,
        title: assignment.title,
        course: assignment.courseName || "Unknown Course",
        dueDate: assignment.dueDate
          ? new Date(assignment.dueDate).toLocaleDateString()
          : "No due date",
        progress,
        status,
        points: totalPoints || 0,
        analysisStatus: assignment.analysisStatus,
        originalFilename: assignment.originalFilename,
        uploadTimestamp: assignment.uploadTimestamp,
        milestones: assignment.milestones.map((milestone) => ({
          id: milestone.id,
          title: milestone.title,
          completed: milestone.status === "completed",
          locked: milestone.status === "locked",
          points: milestone.pointsReward,
          description: milestone.description,
        })),
      };
    });

    return NextResponse.json({
      assignments: transformedAssignments,
      total: transformedAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
