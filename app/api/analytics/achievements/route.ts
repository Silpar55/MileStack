import { NextRequest, NextResponse } from "next/server";
import { achievementsService } from "@/shared/achievements-service";

export async function GET(request: NextRequest) {
  try {
    const analytics = await achievementsService.getAchievementAnalytics();

    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Achievements analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements analytics" },
      { status: 500 }
    );
  }
}
