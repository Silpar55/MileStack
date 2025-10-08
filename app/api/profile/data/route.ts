import { NextRequest, NextResponse } from "next/server";
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

    // Get user profile data
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    // Get user basic info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = user[0];
    const profileData = profile.length > 0 ? profile[0] : null;

    // Return combined profile data
    return NextResponse.json({
      // Basic user info
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      isEmailVerified: userRecord.isEmailVerified,
      createdAt: userRecord.createdAt,
      profilePicture: userRecord.profilePicture,
      profilePictureProvider: userRecord.profilePictureProvider,
      oauthAvatarUrl: userRecord.oauthAvatarUrl,

      // Extended profile data (if exists)
      fullName:
        profileData?.fullName ||
        `${userRecord.firstName || ""} ${userRecord.lastName || ""}`.trim(),
      university: profileData?.university || "",
      major: profileData?.major || "",
      year: profileData?.year || "",
      programmingLanguages: profileData?.programmingLanguages || {},
      experienceLevel: profileData?.experienceLevel || "",
      learningGoals: profileData?.learningGoals || [],
      institutionId: profileData?.institutionId || "",
      institutionName: profileData?.institutionName || "",
      dataUsageConsent: profileData?.dataUsageConsent || false,
      marketingConsent: profileData?.marketingConsent || false,
      researchParticipation: profileData?.researchParticipation || false,
      isProfileComplete: profileData?.isProfileComplete || false,
      profileCompletedAt: profileData?.profileCompletedAt,
      updatedAt: profileData?.updatedAt || userRecord.updatedAt,

      // Metadata
      hasProfile: !!profileData,
      profileSetupCompleted: userRecord.isProfileComplete,
    });
  } catch (error) {
    console.error("Profile data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
