import { NextRequest, NextResponse } from "next/server";
import { downloadService } from "@/shared/download-service";
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

    const qualification = await downloadService.checkDownloadEligibility(
      decoded.userId,
      params.assignment_id
    );

    return NextResponse.json(qualification);
  } catch (error) {
    console.error("Error checking download qualification:", error);
    return NextResponse.json(
      { error: "Failed to check download qualification" },
      { status: 500 }
    );
  }
}
