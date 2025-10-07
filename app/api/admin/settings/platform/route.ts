import { NextRequest, NextResponse } from "next/server";
import { adminAnalyticsService } from "@/shared/admin-analytics-service";

export async function GET(request: NextRequest) {
  try {
    const settings = await adminAnalyticsService.getPlatformSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();

    const updatedSettings = await adminAnalyticsService.updatePlatformSettings(
      settings
    );

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Platform settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating platform settings:", error);
    return NextResponse.json(
      { error: "Failed to update platform settings" },
      { status: 500 }
    );
  }
}
