import { NextRequest, NextResponse } from "next/server";
import { withCORS, withSecurityHeaders } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users, userSessions } from "@/shared/schema";
import { eq, and, gte } from "drizzle-orm";
import {
  logAuditEvent,
  generateAccessToken,
  generateRefreshToken,
} from "@/shared/auth";

async function handler(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with valid verification token
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isEmailVerified: users.isEmailVerified,
        emailVerificationToken: users.emailVerificationToken,
        emailVerificationExpires: users.emailVerificationExpires,
        profilePicture: users.profilePicture,
        profilePictureProvider: users.profilePictureProvider,
        oauthAvatarUrl: users.oauthAvatarUrl,
      })
      .from(users)
      .where(
        and(
          eq(users.emailVerificationToken, token),
          gte(users.emailVerificationExpires, new Date())
        )
      )
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    const userRecord = user[0];

    // Check if already verified
    if (userRecord.isEmailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified.",
      });
    }

    // Mark email as verified
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, userRecord.id));

    // Generate authentication tokens for the user
    const accessToken = generateAccessToken(userRecord.id, userRecord.email);
    const refreshToken = generateRefreshToken();

    // Store refresh token in userSessions table
    await db.insert(userSessions).values({
      userId: userRecord.id,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: request.headers.get("user-agent") || "",
      ipAddress: request.ip || "unknown",
    });

    // Log email verification
    await logAuditEvent(
      userRecord.id,
      "email_verified",
      "user",
      userRecord.id,
      request.ip || "unknown",
      request.headers.get("user-agent") || ""
    );

    return NextResponse.json({
      success: true,
      message: "Email has been verified successfully.",
      accessToken,
      refreshToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isEmailVerified: true,
        profilePicture: userRecord.profilePicture,
        profilePictureProvider: userRecord.profilePictureProvider,
        oauthAvatarUrl: userRecord.oauthAvatarUrl,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withSecurityHeaders(
  withCORS(async (request: NextRequest) => {
    const token = request.nextUrl.pathname.split("/").slice(-1)[0];
    const result = await handler(request, { params: { token } });

    // If this is a successful verification, redirect to the verify-email page with success
    if (result.status === 200) {
      const data = await result.json();
      if (data.success) {
        const redirectUrl = new URL("/verify-email", request.url);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("success", "true");
        // Pass the verification data through URL parameters (encoded)
        if (data.accessToken && data.refreshToken && data.user) {
          redirectUrl.searchParams.set("accessToken", data.accessToken);
          redirectUrl.searchParams.set("refreshToken", data.refreshToken);
          redirectUrl.searchParams.set(
            "user",
            encodeURIComponent(JSON.stringify(data.user))
          );
        }
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If there's an error, redirect to verify-email page with error
    if (result.status !== 200) {
      const redirectUrl = new URL("/verify-email", request.url);
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("error", "true");
      return NextResponse.redirect(redirectUrl);
    }

    return result;
  })
);
