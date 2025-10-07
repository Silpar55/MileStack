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

    const body = await request.json();
    const { assignmentId, institution } = body;

    // Get client information
    const userAgent = request.headers.get("user-agent") || "";
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const honorCodeSignature = await academicIntegrityService.signHonorCode(
      decoded.userId,
      assignmentId || null,
      userAgent,
      ipAddress,
      institution
    );

    return NextResponse.json({
      success: true,
      signature: honorCodeSignature,
      message: "Honor code signed successfully",
    });
  } catch (error) {
    console.error("Error signing honor code:", error);
    return NextResponse.json(
      { error: "Failed to sign honor code" },
      { status: 500 }
    );
  }
}
