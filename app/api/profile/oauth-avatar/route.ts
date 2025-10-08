import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/shared/auth";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { downloadAndStoreOAuthAvatar } from "@/shared/server-oauth-avatar";
import { auth } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try JWT token first (for manual login users)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // If no JWT token or invalid, try NextAuth session (for OAuth users)
    if (!userId) {
      try {
        const session = await auth();
        if (session?.user?.email) {
          // Find user by email for NextAuth sessions
          const user = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

          if (user.length > 0) {
            userId = user[0].id;
          }
        }
      } catch (error) {
        console.error("Error getting NextAuth session:", error);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarUrl, provider } = body;

    if (!avatarUrl || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate avatar URL
    try {
      new URL(avatarUrl);
      if (!["http:", "https:"].includes(new URL(avatarUrl).protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid avatar URL" },
        { status: 400 }
      );
    }

    // Download and store the OAuth avatar
    const avatarData = await downloadAndStoreOAuthAvatar(
      avatarUrl,
      userId,
      provider as "google" | "github" | "facebook" | "twitter"
    );

    // Update user record with avatar data
    await db
      .update(users)
      .set({
        profilePicture: avatarData.profilePicture,
        profilePictureProvider: avatarData.profilePictureProvider,
        oauthAvatarUrl: avatarData.oauthAvatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "OAuth avatar downloaded and stored successfully",
      data: avatarData,
    });
  } catch (error) {
    console.error("OAuth avatar download error:", error);
    return NextResponse.json(
      { error: "Failed to download OAuth avatar" },
      { status: 500 }
    );
  }
}
