import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/shared/middleware";

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { assignmentId, files, version, isAutoSave = false } = body;

    if (!assignmentId || !files) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save workspace data
    const savedWorkspace = await saveWorkspace(assignmentId, userId, {
      files,
      version,
      isAutoSave,
      savedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      workspace: savedWorkspace,
      message: isAutoSave ? "Auto-saved successfully" : "Saved successfully",
    });
  } catch (error) {
    console.error("Save Workspace Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function saveWorkspace(assignmentId: string, userId: string, data: any) {
  // This would typically save to the database
  // For now, return the saved data
  return {
    id: `workspace_${assignmentId}`,
    assignmentId,
    ...data,
  };
}
