import { NextRequest, NextResponse } from "next/server";
import { adminAnalyticsService } from "@/shared/admin-analytics-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskThreshold = parseInt(searchParams.get("riskThreshold") || "70");

    const userModeration = await adminAnalyticsService.getUserModeration();

    // Filter users by risk threshold
    const filteredUsers = userModeration.flaggedUsers.filter(
      (user) => user.riskScore >= riskThreshold
    );

    return NextResponse.json({
      flaggedUsers: filteredUsers,
      suspiciousActivity: userModeration.suspiciousActivity,
      totalFlagged: filteredUsers.length,
      highRiskUsers: filteredUsers.filter((user) => user.riskScore >= 80)
        .length,
    });
  } catch (error) {
    console.error("Error fetching flagged users:", error);
    return NextResponse.json(
      { error: "Failed to fetch flagged users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, reason, adminId } = await request.json();

    if (!userId || !action || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;
    if (action === "flag") {
      if (!reason) {
        return NextResponse.json(
          { error: "Flag reason is required" },
          { status: 400 }
        );
      }
      result = await adminAnalyticsService.flagUser(userId, reason, adminId);
    } else if (action === "unflag") {
      result = await adminAnalyticsService.unflagUser(userId, adminId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `User ${action}ed successfully`,
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} user` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing user moderation:", error);
    return NextResponse.json(
      { error: "Failed to process user moderation" },
      { status: 500 }
    );
  }
}
