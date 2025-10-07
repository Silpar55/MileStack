import { NextRequest, NextResponse } from "next/server";
import { pointsService } from "@/shared/points-service";

export async function GET(request: NextRequest) {
  try {
    const analytics = await pointsService.getPointsAnalytics();

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
    console.error("Points analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch points analytics" },
      { status: 500 }
    );
  }
}
