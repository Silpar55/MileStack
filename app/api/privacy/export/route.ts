import { NextRequest, NextResponse } from "next/server";
import { privacyComplianceService } from "@/shared/privacy-compliance-service";
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
    const { format, dataCategories } = body;

    if (!format || !["json", "csv", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be json, csv, or pdf" },
        { status: 400 }
      );
    }

    const exportRequest = await privacyComplianceService.requestDataExport(
      decoded.userId,
      format,
      dataCategories || ["all"]
    );

    return NextResponse.json(exportRequest);
  } catch (error) {
    console.error("Error requesting data export:", error);
    return NextResponse.json(
      { error: "Failed to request data export" },
      { status: 500 }
    );
  }
}
