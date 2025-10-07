import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq, and, gte } from "drizzle-orm";
import { hashPassword, logAuditEvent, checkRateLimit } from "@/shared/auth";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request.ip || "unknown",
      "reset_password",
      3,
      1
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Find user with valid reset token
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpires: users.passwordResetExpires,
      })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gte(users.passwordResetExpires, new Date())
        )
      )
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const userRecord = user[0];

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(users.id, userRecord.id));

    // Log password reset
    await logAuditEvent(
      userRecord.id,
      "password_reset",
      "user",
      userRecord.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: false,
  rateLimit: { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  cors: true,
  security: true,
});
