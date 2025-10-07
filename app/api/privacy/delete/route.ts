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
    const { reason, dataCategories } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Deletion reason is required" },
        { status: 400 }
      );
    }

    const deletionRequest = await privacyComplianceService.requestDataDeletion(
      decoded.userId,
      reason,
      dataCategories || ["all"]
    );

    return NextResponse.json(deletionRequest);
  } catch (error) {
    console.error("Error requesting data deletion:", error);
    return NextResponse.json(
      { error: "Failed to request data deletion" },
      { status: 500 }
    );
  }
}
