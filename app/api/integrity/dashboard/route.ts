import { NextRequest, NextResponse } from "next/server";
import { academicIntegrityService } from "@/shared/academic-integrity-service";
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

    const dashboard = await academicIntegrityService.getIntegrityDashboard(
      decoded.userId
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error getting integrity dashboard:", error);
    return NextResponse.json(
      { error: "Failed to get integrity dashboard" },
      { status: 500 }
    );
  }
}
