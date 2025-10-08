import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { learningPathways, pathwayCheckpoints } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pathwayId = params.id;

    if (!pathwayId) {
      return NextResponse.json(
        { error: "Pathway ID is required" },
        { status: 400 }
      );
    }

    // Get pathway details
    const pathway = await db
      .select()
      .from(learningPathways)
      .where(eq(learningPathways.id, pathwayId))
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
      .where(eq(pathwayCheckpoints.pathwayId, pathwayId))
      .orderBy(pathwayCheckpoints.order);

    const response = {
      id: pathway[0].id,
      title: pathway[0].title,
      description: pathway[0].description,
      totalPoints: pathway[0].totalPoints,
      estimatedDuration: pathway[0].estimatedDuration,
      difficulty: pathway[0].difficulty,
      isActive: pathway[0].isActive,
      checkpoints: checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        title: checkpoint.title,
        description: checkpoint.description,
        type: checkpoint.type,
        order: checkpoint.order,
        points: checkpoint.points,
        timeLimit: checkpoint.timeLimit,
        maxAttempts: checkpoint.maxAttempts,
        passingScore: checkpoint.passingScore,
        content: checkpoint.content,
        isActive: checkpoint.isActive,
      })),
      createdAt: pathway[0].createdAt,
      updatedAt: pathway[0].updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Pathway retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pathwayId = params.id;
    const body = await request.json();

    if (!pathwayId) {
      return NextResponse.json(
        { error: "Pathway ID is required" },
        { status: 400 }
      );
    }

    // Update pathway
    const updatedPathway = await db
      .update(learningPathways)
      .set({
        title: body.title,
        description: body.description,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(learningPathways.id, pathwayId))
      .returning();

    if (updatedPathway.length === 0) {
      return NextResponse.json(
        { error: "Learning pathway not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pathway: updatedPathway[0],
    });
  } catch (error) {
    console.error("Pathway update error:", error);
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
    const pathwayId = params.id;

    if (!pathwayId) {
      return NextResponse.json(
        { error: "Pathway ID is required" },
        { status: 400 }
      );
    }

    // Delete checkpoints first
    await db
      .delete(pathwayCheckpoints)
      .where(eq(pathwayCheckpoints.pathwayId, pathwayId));

    // Delete pathway
    await db.delete(learningPathways).where(eq(learningPathways.id, pathwayId));

    return NextResponse.json({
      success: true,
      message: "Learning pathway deleted successfully",
    });
  } catch (error) {
    console.error("Pathway deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
