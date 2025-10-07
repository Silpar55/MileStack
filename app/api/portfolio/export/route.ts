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
    const { format } = body;

    if (!format || !["pdf", "web", "github"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be pdf, web, or github" },
        { status: 400 }
      );
    }

    const portfolioExport = await portfolioService.generatePortfolioExport(
      decoded.userId,
      format
    );

    return NextResponse.json(portfolioExport);
  } catch (error) {
    console.error("Error generating portfolio export:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio export" },
      { status: 500 }
    );
  }
}
