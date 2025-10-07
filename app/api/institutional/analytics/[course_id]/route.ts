import { NextRequest, NextResponse } from "next/server";
import { institutionalIntegrationService } from "@/shared/institutional-integration-service";
import { verifyAccessToken } from "@/shared/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { course_id: string } }
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

    const analytics =
      await institutionalIntegrationService.getClassroomAnalytics(
        params.course_id,
        decoded.userId
      );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error getting classroom analytics:", error);
    return NextResponse.json(
      { error: "Failed to get classroom analytics" },
      { status: 500 }
    );
  }
}
