import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { userSessions } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/shared/auth";

async function handler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Revoke the specific session
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.refreshToken, refreshToken));

    // Log logout event
    await logAuditEvent(
      userId,
      "logout",
      "session",
      null,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
