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
    const { consentType, granted } = body;

    if (!consentType || typeof granted !== "boolean") {
      return NextResponse.json(
        { error: "Consent type and granted status are required" },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    const consentRecord = await privacyComplianceService.recordConsent(
      decoded.userId,
      consentType,
      granted,
      ipAddress,
      userAgent
    );

    return NextResponse.json(consentRecord);
  } catch (error) {
    console.error("Error recording consent:", error);
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { consentType } = body;

    if (!consentType) {
      return NextResponse.json(
        { error: "Consent type is required" },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    const withdrawalRecord = await privacyComplianceService.withdrawConsent(
      decoded.userId,
      consentType,
      ipAddress,
      userAgent
    );

    return NextResponse.json(withdrawalRecord);
  } catch (error) {
    console.error("Error withdrawing consent:", error);
    return NextResponse.json(
      { error: "Failed to withdraw consent" },
      { status: 500 }
    );
  }
}
