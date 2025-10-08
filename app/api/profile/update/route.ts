import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { users, userProfiles } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/shared/auth";
import { auth } from "../../../../auth";

export async function PUT(request: NextRequest) {
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

    // Validate required fields
    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Optional validation - only validate if data is provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const profileData = {
      userId: userId,
      fullName: body.fullName.trim(),
      email: body.email?.toLowerCase().trim() || existingUser[0].email,
      university: body.university || "",
      major: body.major?.trim() || "",
      year: body.year || "",
      programmingLanguages: body.programmingLanguages || {},
      experienceLevel: body.experienceLevel || "beginner",
      learningGoals: body.learningGoals || [],
      institutionId: body.institutionId || null,
      institutionName: body.institutionName || "",
      dataUsageConsent: body.dataUsageConsent ?? existingUser[0].termsAccepted,
      marketingConsent: body.marketingConsent ?? false,
      researchParticipation: body.researchParticipation ?? false,
      updatedAt: now,
    };

    // Update profile in database
    await db
      .insert(userProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          fullName: profileData.fullName,
          email: profileData.email,
          university: profileData.university,
          major: profileData.major,
          year: profileData.year,
          programmingLanguages: profileData.programmingLanguages,
          experienceLevel: profileData.experienceLevel,
          learningGoals: profileData.learningGoals,
          institutionId: profileData.institutionId,
          institutionName: profileData.institutionName,
          dataUsageConsent: profileData.dataUsageConsent,
          marketingConsent: profileData.marketingConsent,
          researchParticipation: profileData.researchParticipation,
          updatedAt: now,
        },
      });

    // Update user record with new name if provided
    const nameParts = body.fullName.trim().split(" ");
    await db
      .update(users)
      .set({
        firstName: nameParts[0] || existingUser[0].firstName,
        lastName:
          nameParts.slice(1).join(" ") || existingUser[0].lastName || "",
        email: body.email?.toLowerCase().trim() || existingUser[0].email,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        fullName: profileData.fullName,
        email: profileData.email,
        university: profileData.university,
        major: profileData.major,
        year: profileData.year,
        programmingLanguages: profileData.programmingLanguages,
        experienceLevel: profileData.experienceLevel,
        learningGoals: profileData.learningGoals,
        institutionName: profileData.institutionName,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
