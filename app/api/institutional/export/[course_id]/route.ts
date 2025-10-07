import { NextRequest, NextResponse } from "next/server";
import { institutionalIntegrationService } from "@/shared/institutional-integration-service";
import { verifyAccessToken } from "@/shared/auth";

export async function POST(
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

    const body = await request.json();
    const { format } = body;

    if (!format || !["csv", "json", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be csv, json, or pdf" },
        { status: 400 }
      );
    }

    const exportResult =
      await institutionalIntegrationService.bulkExportClassroomData(
        params.course_id,
        decoded.userId,
        format
      );

    return NextResponse.json(exportResult);
  } catch (error) {
    console.error("Error exporting classroom data:", error);
    return NextResponse.json(
      { error: "Failed to export classroom data" },
      { status: 500 }
    );
  }
}
