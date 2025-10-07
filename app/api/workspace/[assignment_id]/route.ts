import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";

async function getHandler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const assignment_id = request.nextUrl.pathname.split("/").slice(-1)[0];

    // Get workspace data from database
    const workspace = await getWorkspace(assignment_id, userId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        assignmentId: workspace.assignmentId,
        files: workspace.files,
        settings: workspace.settings,
        collaborators: workspace.collaborators,
        versions: workspace.versions,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get Workspace Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function putHandler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const assignment_id = request.nextUrl.pathname.split("/").slice(-1)[0];
    const body = await request.json();
    const { files, settings, version } = body;

    // Update workspace
    const updatedWorkspace = await updateWorkspace(assignment_id, userId, {
      files,
      settings,
      version,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAPIMiddleware(getHandler, {
  requireAuth: true,
  cors: true,
  security: true,
});

export const PUT = withAPIMiddleware(putHandler, {
  requireAuth: true,
  cors: true,
  security: true,
});

async function getWorkspace(assignmentId: string, userId: string) {
  // This would typically query the database
  // For now, return mock data
  return {
    id: `workspace_${assignmentId}`,
    assignmentId,
    files: [
      {
        id: "file_1",
        name: "main.py",
        type: "file",
        content: 'print("Hello, World!")',
        language: "python",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "folder_1",
        name: "src",
        type: "folder",
        children: [
          {
            id: "file_2",
            name: "utils.py",
            type: "file",
            content: "def helper():\n    pass",
            language: "python",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    settings: {
      theme: "vs-dark",
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
    },
    collaborators: [
      {
        id: userId,
        name: "Current User",
        email: "user@example.com",
        role: "owner",
        isOnline: true,
      },
    ],
    versions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function updateWorkspace(
  assignmentId: string,
  userId: string,
  data: any
) {
  // This would typically update the database
  // For now, return the updated data
  return {
    id: `workspace_${assignmentId}`,
    assignmentId,
    ...data,
  };
}
