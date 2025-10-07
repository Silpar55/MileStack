import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
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

    const achievements = await achievementsService.getUserAchievements(userId);

    return NextResponse.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export const GET = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
