import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import {
  generateSecureToken,
  logAuditEvent,
  checkRateLimit,
} from "@/shared/auth";
import { sendPasswordResetEmail } from "@/shared/email";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request.ip || "unknown",
      "forgot_password",
      3,
      1
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Find user
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (user.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const userRecord = user[0];

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .where(eq(users.id, userRecord.id));

    // Send reset email
    try {
      await sendPasswordResetEmail(
        userRecord.email,
        `${userRecord.firstName} ${userRecord.lastName}`,
        resetToken
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    // Log password reset request
    await logAuditEvent(
      userRecord.id,
      "password_reset_requested",
      "user",
      userRecord.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
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
