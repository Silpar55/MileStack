import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq, and, gt } from "drizzle-orm";
import {
  generateSecureToken,
  checkRateLimit,
  logAuditEvent,
} from "@/shared/auth";
import { sendVerificationEmail } from "@/shared/email";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request.ip || "unknown",
      "resend_verification",
      3, // Max 3 resend attempts
      5 // Per 5 minutes
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many resend attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (user.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a verification email has been sent.",
      });
    }

    const userRecord = user[0];

    // Check if email is already verified
    if (userRecord.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified.",
      });
    }

    // Check if there's already a valid verification token
    const now = new Date();
    if (
      userRecord.emailVerificationToken &&
      userRecord.emailVerificationExpires &&
      userRecord.emailVerificationExpires > now
    ) {
      // Token is still valid, don't generate a new one
      // Just send the existing token
      try {
        await sendVerificationEmail(
          userRecord.email,
          `${userRecord.firstName} ${userRecord.lastName}`,
          userRecord.emailVerificationToken
        );

        await logAuditEvent(
          userRecord.id,
          "resend_verification",
          "user",
          userRecord.id,
          request.ip || "unknown",
          request.headers.get("user-agent") || ""
        );

        return NextResponse.json({
          success: true,
          message: "Verification email sent successfully.",
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        );
      }
    }

    // Generate new verification token
    const verificationToken = generateSecureToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .where(eq(users.id, userRecord.id));

    // Send verification email
    try {
      await sendVerificationEmail(
        userRecord.email,
        `${userRecord.firstName} ${userRecord.lastName}`,
        verificationToken
      );

      await logAuditEvent(
        userRecord.id,
        "resend_verification",
        "user",
        userRecord.id,
        request.ip || "unknown",
        request.headers.get("user-agent") || ""
      );

      return NextResponse.json({
        success: true,
        message: "Verification email sent successfully.",
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: false,
  rateLimit: { maxRequests: 3, windowMs: 5 * 60 * 1000 }, // 3 requests per 5 minutes
  cors: true,
  security: true,
});
