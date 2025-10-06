import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "major",
      "year",
      "honorCodeAccepted",
      "dataUsageConsent",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate honor code acceptance
    if (!body.honorCodeAccepted || !body.digitalSignature) {
      return NextResponse.json(
        { error: "Academic integrity honor code must be accepted and signed" },
        { status: 400 }
      );
    }

    // Validate data usage consent
    if (!body.dataUsageConsent) {
      return NextResponse.json(
        { error: "Data usage consent is required" },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Create user account
    // 4. Set up initial learning path
    // 5. Generate user ID and session

    const profileData = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: "active",
      points: 0,
      level: "beginner",
    };

    // Mock database save
    console.log("Profile created:", profileData);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Profile setup completed successfully",
      user: {
        id: profileData.id,
        name: profileData.fullName,
        email: profileData.email,
        institution: profileData.institutionName,
        skills: Object.keys(profileData.programmingLanguages).length,
        goals: profileData.learningGoals.length,
      },
      nextSteps: [
        "Complete your first assignment",
        "Explore the AI assistant",
        "Join a study group",
        "Set up your learning preferences",
      ],
    });
  } catch (error) {
    console.error("Profile setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
