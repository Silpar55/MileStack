import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { db } from "@/shared/db";
import { users, userProfiles } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/shared/auth";
import { auth } from "../../../../auth";

export async function GET(request: NextRequest) {
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

    // Check if user exists and get profile completion status
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = user[0];

    // Check if user has a profile record
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const hasProfile = profile.length > 0;
    const hasVisitedProfileSetup = userRecord.isProfileComplete || hasProfile;

    return NextResponse.json({
      hasVisitedProfileSetup,
      isProfileComplete: userRecord.isProfileComplete,
      hasProfile: hasProfile,
      userId: userId,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isEmailVerified: userRecord.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Profile status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
