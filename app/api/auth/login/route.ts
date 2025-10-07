import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users, userSessions, auditLogs } from "@/shared/schema";
import { eq, and } from "drizzle-orm";
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  createUserSession,
  logAuditEvent,
  isAccountLocked,
  checkRateLimit,
} from "@/shared/auth";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request.ip || "unknown",
      "login",
      5,
      1
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Check if account is locked
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      await logAuditEvent(
        null,
        "login_failed",
        "user",
        null,
        request.ip || "unknown",
        request.headers.get("user-agent") || "",
        { email, reason: "user_not_found" }
      );
      return NextResponse.json(
        {
          error: "No account exists with this email address",
          code: "USER_NOT_FOUND",
        },
        { status: 401 }
      );
    }

    const userRecord = user[0];

    // Check if account is locked
    if (await isAccountLocked(userRecord.id)) {
      await logAuditEvent(
        userRecord.id,
        "login_failed",
        "user",
        userRecord.id,
        request.ip || "unknown",
        request.headers.get("user-agent") || "",
        { reason: "account_locked" }
      );
      return NextResponse.json(
        { error: "Account is temporarily locked. Please try again later." },
        { status: 423 }
      );
    }

    // Verify password
    if (
      !userRecord.password ||
      !(await verifyPassword(password, userRecord.password))
    ) {
      await logAuditEvent(
        userRecord.id,
        "login_failed",
        "user",
        userRecord.id,
        request.ip || "unknown",
        request.headers.get("user-agent") || "",
        { reason: "invalid_password" }
      );
      return NextResponse.json(
        {
          error: "The password you entered is incorrect",
          code: "WRONG_PASSWORD",
        },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!userRecord.isEmailVerified) {
      await logAuditEvent(
        userRecord.id,
        "login_failed",
        "user",
        userRecord.id,
        request.ip || "unknown",
        request.headers.get("user-agent") || "",
        { reason: "email_not_verified" }
      );
      return NextResponse.json(
        {
          error: "Please verify your email address before logging in",
          code: "EMAIL_NOT_VERIFIED",
          user: {
            id: userRecord.id,
            email: userRecord.email,
            firstName: userRecord.firstName,
            lastName: userRecord.lastName,
            isEmailVerified: userRecord.isEmailVerified,
          },
        },
        { status: 403 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(userRecord.id, userRecord.email);
    const refreshToken = generateRefreshToken();

    // Create session
    await createUserSession(
      userRecord.id,
      request.headers.get("user-agent") || "",
      request.ip || "unknown"
    );

    // Log successful login
    await logAuditEvent(
      userRecord.id,
      "login",
      "user",
      userRecord.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    // Update last login
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(users.id, userRecord.id));

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isEmailVerified: userRecord.isEmailVerified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: false,
  rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  cors: true,
  security: true,
});
