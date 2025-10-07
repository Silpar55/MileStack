import { NextRequest, NextResponse } from "next/server";
import { adminAnalyticsService } from "@/shared/admin-analytics-service";

export async function POST(request: NextRequest) {
  try {
    const { challengeId, approvedBy, action, reason } = await request.json();

    if (!challengeId || !approvedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let result;
    if (action === "approve") {
      result = await adminAnalyticsService.approveChallenge(
        challengeId,
        approvedBy
      );
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      result = await adminAnalyticsService.rejectChallenge(
        challengeId,
        approvedBy,
        reason
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Challenge ${action}d successfully`,
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} challenge` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing challenge approval:", error);
    return NextResponse.json(
      { error: "Failed to process challenge approval" },
      { status: 500 }
    );
  }
}
