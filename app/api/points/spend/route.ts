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

    const body = await request.json();
    const { category, amount, reason, sourceId, metadata } = body;

    // Validate required fields
    if (!category || !amount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "conceptual-hints",
      "pseudocode-guidance",
      "code-review-session",
      "ai-copilot",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Spend points
    const result = await pointsService.spendPoints({
      userId,
      category,
      amount,
      reason,
      sourceId,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        pointsSpent: result.pointsSpent,
        message: result.message,
        remainingBalance: result.remainingBalance,
      },
    });
  } catch (error) {
    console.error("Points spend error:", error);
    return NextResponse.json(
      { error: "Failed to spend points" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
