import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { pointsService } from "@/shared/points-service";
import { achievementsService } from "@/shared/achievements-service";

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
    const {
      category,
      amount,
      reason,
      sourceId,
      sourceType,
      qualityScore,
      metadata,
    } = body;

    // Validate required fields
    if (!category || !amount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "concept-explanation",
      "mini-challenge",
      "code-review",
      "peer-help",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Award points
    const result = await pointsService.awardPoints({
      userId,
      category,
      amount,
      reason,
      sourceId,
      sourceType,
      qualityScore,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Check for new achievements
    const newAchievements = await achievementsService.checkAchievements(userId);

    return NextResponse.json({
      success: true,
      data: {
        pointsAwarded: result.pointsAwarded,
        message: result.message,
        fraudDetected: result.fraudDetected,
        newAchievements: newAchievements.map((a) => ({
          achievementId: a.achievementId,
          pointsAwarded: a.pointsAwarded,
          message: a.message,
        })),
      },
    });
  } catch (error) {
    console.error("Points earn error:", error);
    return NextResponse.json(
      { error: "Failed to award points" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
