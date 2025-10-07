import { NextRequest, NextResponse } from "next/server";
import { academicIntegrityService } from "@/shared/academic-integrity-service";
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

    // Get current privacy settings
    const settings = await academicIntegrityService.updatePrivacySettings(
      decoded.userId,
      {}
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error getting privacy settings:", error);
    return NextResponse.json(
      { error: "Failed to get privacy settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const updatedSettings =
      await academicIntegrityService.updatePrivacySettings(
        decoded.userId,
        body
      );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}
