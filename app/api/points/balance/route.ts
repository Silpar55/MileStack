import { NextRequest, NextResponse } from "next/server";
import {
  withNextAuth,
  withCORS,
  withSecurityHeaders,
} from "@/shared/middleware";
import { pointsService } from "@/shared/points-service";

async function handler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const balance = await pointsService.getPointsBalance(userId);

    if (!balance) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Points balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch points balance" },
      { status: 500 }
    );
  }
}

export const GET = withSecurityHeaders(withCORS(withNextAuth(handler)));
