import { NextRequest, NextResponse } from "next/server";
import { academicIntegrityService } from "@/shared/academic-integrity-service";
import { verifyAccessToken } from "@/shared/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { assignment_id: string } }
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

    const transparencyReport =
      await academicIntegrityService.generateTransparencyReport(
        decoded.userId,
        params.assignment_id
      );

    return NextResponse.json(transparencyReport);
  } catch (error) {
    console.error("Error generating transparency report:", error);
    return NextResponse.json(
      { error: "Failed to generate transparency report" },
      { status: 500 }
    );
  }
}
