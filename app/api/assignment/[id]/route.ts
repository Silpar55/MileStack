import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalyses,
  learningPathways,
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
      .from(assignmentAnalyses)
      .where(eq(assignmentAnalyses.assignmentId, assignmentId))
      .limit(1);

    // Get learning pathway if available
    const pathway = await db
      .select()
      .from(learningPathways)
      .where(eq(learningPathways.assignmentId, assignmentId))
      .limit(1);

    let milestones: any[] = [];
    if (pathway.length > 0) {
      milestones = await db
        .select()
        .from(learningMilestones)
        .where(eq(learningMilestones.pathwayId, pathway[0].id))
        .orderBy(learningMilestones.order);
    }

    const response = {
      assignment: {
        id: assignmentData.id,
        title: assignmentData.title,
        description: assignmentData.description,
        fileName: assignmentData.originalFileName,
        fileSize: assignmentData.fileSize,
        mimeType: assignmentData.mimeType,
        status: assignmentData.status,
        createdAt: assignmentData.createdAt,
        updatedAt: assignmentData.updatedAt,
      },
      analysis:
        analysis.length > 0
          ? {
              id: analysis[0].id,
              concepts: analysis[0].concepts,
              skills: analysis[0].skills,
              difficultyLevel: analysis[0].difficultyLevel,
              estimatedTimeHours: analysis[0].estimatedTimeHours,
              prerequisites: analysis[0].prerequisites,
              learningGaps: analysis[0].learningGaps,
              createdAt: analysis[0].createdAt,
            }
          : null,
      pathway:
        pathway.length > 0
          ? {
              id: pathway[0].id,
              title: pathway[0].title,
              description: pathway[0].description,
              totalPoints: pathway[0].totalPoints,
              estimatedDuration: pathway[0].estimatedDuration,
              difficultyLevel: pathway[0].difficultyLevel,
              isActive: pathway[0].isActive,
              milestones: milestones.map((milestone) => ({
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                points: milestone.points,
                order: milestone.order,
                competencyRequirements: milestone.competencyRequirements,
                resources: milestone.resources,
                isCompleted: milestone.isCompleted,
                completedAt: milestone.completedAt,
              })),
              createdAt: pathway[0].createdAt,
              updatedAt: pathway[0].updatedAt,
            }
          : null,
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

    // Delete associated data (cascade delete would be better in production)
    await db
      .delete(assignmentAnalyses)
      .where(eq(assignmentAnalyses.assignmentId, assignmentId));

    // Delete learning pathway and milestones
    const pathway = await db
      .select()
      .from(learningPathways)
      .where(eq(learningPathways.assignmentId, assignmentId))
      .limit(1);

    if (pathway.length > 0) {
      await db
        .delete(learningMilestones)
        .where(eq(learningMilestones.pathwayId, pathway[0].id));

      await db
        .delete(learningPathways)
        .where(eq(learningPathways.id, pathway[0].id));
    }

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
