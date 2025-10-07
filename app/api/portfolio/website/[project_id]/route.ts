import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/shared/portfolio-service";
import { verifyAccessToken } from "@/shared/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { project_id: string } }
) {
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

    const website = await portfolioService.generatePortfolioWebsite(
      decoded.userId,
      params.project_id
    );

    return NextResponse.json(website);
  } catch (error) {
    console.error("Error generating portfolio website:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio website" },
      { status: 500 }
    );
  }
}
