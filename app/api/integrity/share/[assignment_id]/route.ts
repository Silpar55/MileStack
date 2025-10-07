import { NextRequest, NextResponse } from "next/server";
import { academicIntegrityService } from "@/shared/academic-integrity-service";
import { verifyAccessToken } from "@/shared/auth";

export async function POST(
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

    const body = await request.json();
    const { instructorEmail } = body;

    if (!instructorEmail) {
      return NextResponse.json(
        { error: "Instructor email is required" },
        { status: 400 }
      );
    }

    const result = await academicIntegrityService.shareReportWithInstructor(
      decoded.userId,
      params.assignment_id,
      instructorEmail
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sharing report with instructor:", error);
    return NextResponse.json(
      { error: "Failed to share report with instructor" },
      { status: 500 }
    );
  }
}
