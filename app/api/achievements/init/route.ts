import { NextRequest, NextResponse } from "next/server";
import { achievementsService } from "@/shared/achievements-service";

export async function POST(request: NextRequest) {
  try {
    await achievementsService.initializeAchievementTemplates();

    return NextResponse.json({
      success: true,
      message: "Achievement templates initialized successfully",
    });
  } catch (error) {
    console.error("Achievement templates initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize achievement templates" },
      { status: 500 }
    );
  }
}
