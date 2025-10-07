import { NextRequest, NextResponse } from "next/server";
import { adminAnalyticsService } from "@/shared/admin-analytics-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const analytics = await adminAnalyticsService.getAnalyticsOverview();
    const integrityData = analytics.integrityMonitoring;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      integrity: integrityData,
    });
  } catch (error) {
    console.error("Error fetching integrity analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrity analytics" },
      { status: 500 }
    );
  }
}
