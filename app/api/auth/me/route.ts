import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/shared/auth";

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify the token
    const tokenData = verifyAccessToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isEmailVerified: users.isEmailVerified,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        profilePicture: users.profilePicture,
        profilePictureProvider: users.profilePictureProvider,
        oauthAvatarUrl: users.oauthAvatarUrl,
      })
      .from(users)
      .where(eq(users.id, tokenData.userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user[0].id,
      email: user[0].email,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      isEmailVerified: user[0].isEmailVerified,
      createdAt: user[0].createdAt,
      lastLoginAt: user[0].lastLoginAt,
      profilePicture: user[0].profilePicture,
      profilePictureProvider: user[0].profilePictureProvider,
      oauthAvatarUrl: user[0].oauthAvatarUrl,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
