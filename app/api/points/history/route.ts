import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await pointsService.getTransactionHistory(
      userId,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Points history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch points history" },
      { status: 500 }
    );
  }
}

export const GET = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
