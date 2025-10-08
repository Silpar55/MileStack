import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { users, userPoints } from "@/shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { verifyAccessToken } from "@/shared/auth";
import { auth } from "../../../../auth";

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try JWT token first (for manual login users)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // If no JWT token or invalid, try NextAuth session (for OAuth users)
    if (!userId) {
      try {
        const session = await auth();
        if (session?.user?.email) {
          // Find user by email for NextAuth sessions
          const user = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

          if (user.length > 0) {
            userId = user[0].id;
          }
        }
      } catch (error) {
        console.error("Error getting NextAuth session:", error);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user points data
    const pointsData = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    // Get user's global rank based on total earned points
    // First, get all users ordered by total earned points
    const allUsersRanked = await db
      .select({
        userId: userPoints.userId,
        totalEarned: userPoints.totalEarned,
      })
      .from(userPoints)
      .orderBy(desc(userPoints.totalEarned));

    // Find the current user's rank
    const userRank =
      allUsersRanked.findIndex((user) => user.userId === userId) + 1;
    const globalRank = userRank > 0 ? userRank : allUsersRanked.length + 1;

    // Calculate level based on total earned points (simple formula: level = floor(points/1000) + 1)
    const totalEarned = pointsData.length > 0 ? pointsData[0].totalEarned : 0;
    const level = Math.floor(totalEarned / 1000) + 1;

    // Get user's join date
    const userData = await db
      .select({
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const joinDate = userData.length > 0 ? userData[0].createdAt : new Date();

    // Calculate days since joining (for streak simulation)
    const daysSinceJoining = Math.floor(
      (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // For now, we'll use mock data for assignments, challenges, and AI sessions
    // These would need separate tables in a real implementation
    const stats = {
      totalPoints: pointsData.length > 0 ? pointsData[0].currentBalance : 0,
      level: level,
      streak: Math.min(daysSinceJoining, 30), // Simulate streak based on join date, max 30 days
      assignmentsCompleted: 0, // TODO: Connect to assignments table when available
      challengesSolved: 0, // TODO: Connect to challenges table when available
      globalRank: globalRank,
      aiSessionsUsed: 0, // TODO: Connect to AI sessions table when available
      totalEarned: pointsData.length > 0 ? pointsData[0].totalEarned : 0,
      totalSpent: pointsData.length > 0 ? pointsData[0].totalSpent : 0,
      dailyEarned: pointsData.length > 0 ? pointsData[0].dailyEarned : 0,
    };

    return NextResponse.json({
      success: true,
      stats,
      user: {
        joinDate: joinDate,
        daysSinceJoining: daysSinceJoining,
      },
    });
  } catch (error) {
    console.error("Profile stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
