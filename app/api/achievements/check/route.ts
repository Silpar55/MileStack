import { NextRequest, NextResponse } from "next/server";
import { achievementsService } from "@/shared/achievements-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const newAchievements = await achievementsService.checkAchievements(userId);

    return NextResponse.json({
      success: true,
      data: {
        newAchievements,
        count: newAchievements.length,
      },
    });
  } catch (error) {
    console.error("Achievements check error:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
