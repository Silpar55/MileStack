import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { pointsService } from "@/shared/points-service";

async function handler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    console.log("Points balance handler called with:", {
      userId,
      hasAuthHeader: !!request.headers.get("authorization"),
      authHeader:
        request.headers.get("authorization")?.substring(0, 20) + "...",
    });

    if (!userId) {
      console.log("No userId provided, returning 401");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    console.log("Fetching points balance for userId:", userId);
    const balance = await pointsService.getPointsBalance(userId);

    if (!balance) {
      console.log("No balance found for userId:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Successfully fetched balance:", balance);
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

export const GET = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
