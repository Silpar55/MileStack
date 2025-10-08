import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/shared/middleware";

export const GET = withAuth(async (request: NextRequest, userId?: string) => {
  try {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignment_id = request.nextUrl.pathname.split("/").slice(-1)[0];
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get version history
    const history = await getVersionHistory(
      assignment_id,
      userId,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      history,
      pagination: {
        limit,
        offset,
        total: history.length,
        hasMore: history.length === limit,
      },
    });
  } catch (error) {
    console.error("Get Version History Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, userId?: string) => {
  try {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignment_id = request.nextUrl.pathname.split("/").slice(-1)[0];
    const body = await request.json();
    const { message, isCheckpoint = false, files } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Version message is required" },
        { status: 400 }
      );
    }

    // Create new version
    const version = await createVersion(assignment_id, userId, {
      message,
      isCheckpoint,
      files,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      version,
      message: isCheckpoint
        ? "Checkpoint created successfully"
        : "Version saved successfully",
    });
  } catch (error) {
    console.error("Create Version Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function getVersionHistory(
  assignmentId: string,
  userId: string,
  limit: number,
  offset: number
) {
  // This would typically query the database for version history
  // For now, return mock data
  return [
    {
      id: "version_1",
      message: "Initial commit",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      author: "Current User",
      files: ["main.py", "utils.py"],
      isCheckpoint: true,
      changes: {
        added: 2,
        modified: 0,
        deleted: 0,
      },
    },
    {
      id: "version_2",
      message: "Added error handling",
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
      author: "Current User",
      files: ["main.py"],
      isCheckpoint: false,
      changes: {
        added: 0,
        modified: 1,
        deleted: 0,
      },
    },
    {
      id: "version_3",
      message: "Refactored utility functions",
      timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      author: "Current User",
      files: ["utils.py"],
      isCheckpoint: false,
      changes: {
        added: 0,
        modified: 1,
        deleted: 0,
      },
    },
  ];
}

async function createVersion(assignmentId: string, userId: string, data: any) {
  // This would typically save to the database
  // For now, return the created version
  return {
    id: `version_${Date.now()}`,
    assignmentId,
    userId,
    ...data,
  };
}
