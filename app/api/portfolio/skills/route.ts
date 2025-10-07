import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/shared/portfolio-service";
import { verifyAccessToken } from "@/shared/auth";

export async function GET(request: NextRequest) {
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

    const skillsMatrix = await portfolioService.getSkillsMatrix(decoded.userId);

    return NextResponse.json(skillsMatrix);
  } catch (error) {
    console.error("Error getting skills matrix:", error);
    return NextResponse.json(
      { error: "Failed to get skills matrix" },
      { status: 500 }
    );
  }
}
