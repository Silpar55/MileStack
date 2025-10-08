import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { db } from "../../../../../shared/db";
import {
  assignments,
  assignmentAnalysis,
  learningMilestones,
} from "../../../../../shared/schema-assignments";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const titleConfirmation = searchParams.get("title");

    if (!titleConfirmation) {
      return NextResponse.json(
        { error: "Assignment title confirmation is required" },
        { status: 400 }
      );
    }

    // Get the assignment to verify ownership and title
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, params.id))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignmentData = assignment[0];

    // Verify ownership
    if (assignmentData.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify title confirmation matches exactly (case-sensitive for security)
    if (assignmentData.title !== titleConfirmation) {
      return NextResponse.json(
        {
          error:
            "Assignment title does not match. Please enter the exact title.",
        },
        { status: 400 }
      );
    }

    // Delete in correct order (due to foreign key constraints)
    // 1. Delete learning milestones
    await db
      .delete(learningMilestones)
      .where(eq(learningMilestones.assignmentId, params.id));

    // 2. Delete assignment analysis
    await db
      .delete(assignmentAnalysis)
      .where(eq(assignmentAnalysis.assignmentId, params.id));

    // 3. Delete assignment
    await db.delete(assignments).where(eq(assignments.id, params.id));

    return NextResponse.json({
      message: "Assignment deleted successfully",
      deletedAssignment: {
        id: assignmentData.id,
        title: assignmentData.title,
      },
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
