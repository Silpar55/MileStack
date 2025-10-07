import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  logAuditEvent,
  checkRateLimit,
  generateSecureToken,
} from "@/shared/auth";
import { sendVerificationEmail } from "@/shared/email";
import { validateSignupForm } from "@/shared/validation";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      termsAccepted,
      privacyPolicyAccepted,
      gdprConsent,
      ferpaConsent,
    } = await request.json();

    // Server-side validation using our validation utility
    const validation = validateSignupForm({
      email,
      password,
      firstName,
      lastName,
      termsAccepted,
      privacyPolicyAccepted,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request.ip || "unknown",
      "signup",
      3,
      1
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Check if user already exists (case-insensitive email check)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      // Check if this is an OAuth user trying to sign up manually
      const user = existingUser[0];
      if (!user.password) {
        // This is an OAuth user, suggest they use OAuth login instead
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please sign in with Google or GitHub instead.",
            code: "OAUTH_ACCOUNT_EXISTS",
          },
          { status: 409 }
        );
      } else {
        // This is a manual account, standard error
        return NextResponse.json(
          {
            error: "An account with this email address already exists",
            code: "EMAIL_ALREADY_REGISTERED",
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateSecureToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(), // Normalize email
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        termsAccepted,
        termsAcceptedAt: new Date(),
        privacyPolicyAccepted,
        privacyPolicyAcceptedAt: new Date(),
        gdprConsent: gdprConsent || {},
        ferpaConsent: ferpaConsent || false,
        ferpaConsentAt: ferpaConsent ? new Date() : null,
      })
      .returning();

    const user = newUser[0];

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        verificationToken
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail signup if email fails
    }

    // Log signup event
    await logAuditEvent(
      user.id,
      "signup",
      "user",
      user.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. Please check your email for verification.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
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
