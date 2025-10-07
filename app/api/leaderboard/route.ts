import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { leaderboards, users } from "@/shared/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "overall";
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "points";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate category
    const validCategories = [
      "overall",
      "data-structures",
      "algorithms",
      "web-dev",
      "database",
      "system-design",
      "machine-learning",
      "security",
      "mobile-dev",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "challengesSolved":
        orderBy =
          sortOrder === "asc"
            ? asc(leaderboards.challengesSolved)
            : desc(leaderboards.challengesSolved);
        break;
      case "averageTime":
        orderBy =
          sortOrder === "asc"
            ? asc(leaderboards.averageTime)
            : desc(leaderboards.averageTime);
        break;
      case "streak":
        orderBy =
          sortOrder === "asc"
            ? asc(leaderboards.streak)
            : desc(leaderboards.streak);
        break;
      case "longestStreak":
        orderBy =
          sortOrder === "asc"
            ? asc(leaderboards.longestStreak)
            : desc(leaderboards.longestStreak);
        break;
      default:
        orderBy =
          sortOrder === "asc"
            ? asc(leaderboards.points)
            : desc(leaderboards.points);
    }

    // Get leaderboard data
    const leaderboardData = await db
      .select({
        id: leaderboards.id,
        userId: leaderboards.userId,
        points: leaderboards.points,
        rank: leaderboards.rank,
        challengesSolved: leaderboards.challengesSolved,
        averageTime: leaderboards.averageTime,
        streak: leaderboards.streak,
        longestStreak: leaderboards.longestStreak,
        lastSolvedAt: leaderboards.lastSolvedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(eq(leaderboards.category, category))
      .orderBy(orderBy)
      .limit(limit);

    // Calculate ranks
    const rankedData = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Get category statistics
    const categoryStats = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        totalPoints: sql<number>`sum(${leaderboards.points})`,
        averagePoints: sql<number>`avg(${leaderboards.points})`,
        totalChallengesSolved: sql<number>`sum(${leaderboards.challengesSolved})`,
        averageChallengesSolved: sql<number>`avg(${leaderboards.challengesSolved})`,
      })
      .from(leaderboards)
      .where(eq(leaderboards.category, category));

    // Get top performers by different metrics
    const topByPoints = await db
      .select({
        userId: leaderboards.userId,
        points: leaderboards.points,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(eq(leaderboards.category, category))
      .orderBy(desc(leaderboards.points))
      .limit(3);

    const topByChallenges = await db
      .select({
        userId: leaderboards.userId,
        challengesSolved: leaderboards.challengesSolved,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(eq(leaderboards.category, category))
      .orderBy(desc(leaderboards.challengesSolved))
      .limit(3);

    const topByStreak = await db
      .select({
        userId: leaderboards.userId,
        longestStreak: leaderboards.longestStreak,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(leaderboards)
      .leftJoin(users, eq(leaderboards.userId, users.id))
      .where(eq(leaderboards.category, category))
      .orderBy(desc(leaderboards.longestStreak))
      .limit(3);

    return NextResponse.json({
      category,
      leaderboard: rankedData,
      stats: categoryStats[0] || {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        totalChallengesSolved: 0,
        averageChallengesSolved: 0,
      },
      topPerformers: {
        byPoints: topByPoints,
        byChallenges: topByChallenges,
        byStreak: topByStreak,
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
    const body = await request.json();
    const { userId, category, points, challengesSolved } = body;

    // Validate required fields
    if (!userId || !category || points === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "overall",
      "data-structures",
      "algorithms",
      "web-dev",
      "database",
      "system-design",
      "machine-learning",
      "security",
      "mobile-dev",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Check if user already has a leaderboard entry for this category
    const existingEntry = await db
      .select()
      .from(leaderboards)
      .where(
        and(
          eq(leaderboards.userId, userId),
          eq(leaderboards.category, category)
        )
      )
      .limit(1);

    let leaderboardEntry;
    if (existingEntry.length > 0) {
      // Update existing entry
      leaderboardEntry = await db
        .update(leaderboards)
        .set({
          points: existingEntry[0].points + points,
          challengesSolved:
            challengesSolved || existingEntry[0].challengesSolved,
          lastSolvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(leaderboards.id, existingEntry[0].id))
        .returning();
    } else {
      // Create new entry
      leaderboardEntry = await db
        .insert(leaderboards)
        .values({
          userId,
          category,
          points,
          challengesSolved: challengesSolved || 0,
          lastSolvedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      leaderboardEntry: leaderboardEntry[0],
      message: "Leaderboard updated successfully",
    });
  } catch (error) {
    console.error("Leaderboard update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
