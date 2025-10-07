import { NextRequest, NextResponse } from "next/server";
import { academicIntegrityService } from "@/shared/academic-integrity-service";
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

    const exportResult = await academicIntegrityService.exportStudentData(
      decoded.userId
    );

    return NextResponse.json(exportResult);
  } catch (error) {
    console.error("Error exporting student data:", error);
    return NextResponse.json(
      { error: "Failed to export student data" },
      { status: 500 }
    );
  }
}
