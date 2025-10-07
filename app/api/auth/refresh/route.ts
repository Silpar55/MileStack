import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users, userSessions } from "@/shared/schema";
import { eq, and, gte } from "drizzle-orm";
import { generateAccessToken, logAuditEvent } from "@/shared/auth";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Find the session
    const session = await db
      .select({
        id: userSessions.id,
        userId: userSessions.userId,
        expiresAt: userSessions.expiresAt,
        isActive: userSessions.isActive,
      })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.refreshToken, refreshToken),
          eq(userSessions.isActive, true),
          gte(userSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    const sessionRecord = session[0];

    // Get user information
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.id, sessionRecord.userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = user[0];

    // Generate new access token
    const newAccessToken = generateAccessToken(userRecord.id, userRecord.email);

    // Update session last used time
    await db
      .update(userSessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(userSessions.id, sessionRecord.id));

    // Log token refresh
    await logAuditEvent(
      userRecord.id,
      "token_refresh",
      "session",
      sessionRecord.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isEmailVerified: userRecord.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: false,
  cors: true,
  security: true,
});
