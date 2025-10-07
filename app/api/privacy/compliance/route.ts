import { NextRequest, NextResponse } from "next/server";
import { privacyComplianceService } from "@/shared/privacy-compliance-service";
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

    const complianceStatus =
      await privacyComplianceService.checkComplianceStatus(decoded.userId);

    return NextResponse.json(complianceStatus);
  } catch (error) {
    console.error("Error checking compliance status:", error);
    return NextResponse.json(
      { error: "Failed to check compliance status" },
      { status: 500 }
    );
  }
}
