import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { users } from "@/shared/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Leaderboard functionality has been removed from the core system
    // This endpoint now returns a placeholder response
    return NextResponse.json({
      message:
        "Leaderboard functionality has been removed from the core system. Points are still tracked through the points system for gamification.",
      leaderboard: [],
      stats: {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        totalChallengesSolved: 0,
        averageChallengesSolved: 0,
      },
      topPerformers: {
        byPoints: [],
        byChallenges: [],
        byStreak: [],
      },
    });
  } catch (error) {
    console.error("Leaderboard retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Leaderboard functionality has been removed from the core system
    return NextResponse.json({
      message:
        "Leaderboard functionality has been removed from the core system. Points are still tracked through the points system for gamification.",
      success: false,
    });
  } catch (error) {
    console.error("Leaderboard update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
