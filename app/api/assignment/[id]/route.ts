import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalysis,
  learningMilestones,
} from "@/shared/schema-assignments";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get assignment details
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignmentData = assignment[0];

    // Get analysis if it exists
    let analysis = null;
    let pathway = null;

    if (assignmentData.analysisStatus === "complete") {
      const analysisResult = await db
        .select()
        .from(assignmentAnalysis)
        .where(eq(assignmentAnalysis.assignmentId, assignmentId))
        .limit(1);

      if (analysisResult.length > 0) {
        analysis = {
          concepts: analysisResult[0].concepts,
          languages: analysisResult[0].languages,
          difficulty: analysisResult[0].difficultyScore,
          estimated_hours: parseFloat(
            analysisResult[0].estimatedTimeHours || "0"
          ),
          prerequisites: analysisResult[0].prerequisites,
        };

        // Get milestones
        const milestones = await db
          .select()
          .from(learningMilestones)
          .where(eq(learningMilestones.assignmentId, assignmentId))
          .orderBy(learningMilestones.milestoneOrder);

        const totalPoints = milestones.reduce(
          (sum, m) => sum + m.pointsReward,
          0
        );

        pathway = {
          id: assignmentId,
          totalPoints,
          milestones: milestones.map((m) => ({
            title: m.title,
            description: m.description,
            points: m.pointsReward,
            competencyRequirements: m.competencyRequirement,
          })),
        };
      }
    }

    return NextResponse.json({
      id: assignmentData.id,
      title: assignmentData.title,
      originalFilename: assignmentData.originalFilename,
      analysisStatus: assignmentData.analysisStatus,
      analysis,
      pathway,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
