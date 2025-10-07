import { NextRequest, NextResponse } from "next/server";
import { adminAnalyticsService } from "@/shared/admin-analytics-service";

export async function GET(request: NextRequest) {
  try {
    const analytics = await adminAnalyticsService.getAnalyticsOverview();

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
