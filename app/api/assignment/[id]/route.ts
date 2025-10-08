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

    // Get analysis results if available
    const analysis = await db
      .select()
      .from(assignmentAnalysis)
      .where(eq(assignmentAnalysis.assignmentId, assignmentId))
      .limit(1);

    // Get learning milestones if available
    const milestones = await db
      .select()
      .from(learningMilestones)
      .where(eq(learningMilestones.assignmentId, assignmentId))
      .orderBy(learningMilestones.milestoneOrder);

    const response = {
      assignment: {
        id: assignmentData.id,
        title: assignmentData.title,
        originalFilename: assignmentData.originalFilename,
        extractedText: assignmentData.extractedText,
        analysisStatus: assignmentData.analysisStatus,
        estimatedDifficulty: assignmentData.estimatedDifficulty,
        dueDate: assignmentData.dueDate,
        courseName: assignmentData.courseName,
        uploadTimestamp: assignmentData.uploadTimestamp,
      },
      analysis:
        analysis.length > 0
          ? {
              assignmentId: analysis[0].assignmentId,
              concepts: analysis[0].concepts,
              languages: analysis[0].languages,
              difficultyScore: analysis[0].difficultyScore,
              prerequisites: analysis[0].prerequisites,
              estimatedTimeHours: analysis[0].estimatedTimeHours,
              analysisTimestamp: analysis[0].analysisTimestamp,
            }
          : null,
      milestones: milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        milestoneOrder: milestone.milestoneOrder,
        competencyRequirement: milestone.competencyRequirement,
        pointsReward: milestone.pointsReward,
        status: milestone.status,
        createdAt: milestone.createdAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Assignment retrieval error:", error);
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
    const assignmentId = params.id;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Check if assignment exists
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

    // Delete associated data (cascade delete will handle most of this)
    // Delete assignment analysis
    await db
      .delete(assignmentAnalysis)
      .where(eq(assignmentAnalysis.assignmentId, assignmentId));

    // Delete learning milestones (cascade delete will handle this)
    // Delete assignment
    await db.delete(assignments).where(eq(assignments.id, assignmentId));

    // TODO: Delete physical file from filesystem
    // const filePath = assignment[0].filePath;
    // await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Assignment deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
