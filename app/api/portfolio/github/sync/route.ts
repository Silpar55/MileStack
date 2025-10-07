import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/shared/portfolio-service";
import { verifyAccessToken } from "@/shared/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, githubToken } = body;

    if (!projectId || !githubToken) {
      return NextResponse.json(
        { error: "Project ID and GitHub token are required" },
        { status: 400 }
      );
    }

    const result = await portfolioService.syncToGitHub(
      decoded.userId,
      projectId,
      githubToken
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing to GitHub:", error);
    return NextResponse.json(
      { error: "Failed to sync to GitHub" },
      { status: 500 }
    );
  }
}
