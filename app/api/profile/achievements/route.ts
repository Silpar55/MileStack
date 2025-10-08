import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { achievements, users } from "@/shared/schema";
import { eq } from "drizzle-orm";
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

    // Get user achievements
    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.unlockedAt);

    // Transform the data to match the frontend format
    const transformedAchievements = userAchievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon || "🏆",
      earned: achievement.isUnlocked,
      unlockedAt: achievement.unlockedAt,
      points: achievement.points,
      category: achievement.category,
      progress: achievement.progress,
    }));

    // If user has no achievements, return empty array
    // In a real app, you might want to show available achievements they haven't earned yet
    const availableAchievements = [
      {
        id: "1",
        name: "Early Bird",
        description: "Complete 5 assignments before due date",
        icon: "🌅",
        earned: false,
        points: 100,
        category: "productivity",
      },
      {
        id: "2",
        name: "Consistent Learner",
        description: "7-day learning streak",
        icon: "🔥",
        earned: false,
        points: 150,
        category: "streak",
      },
      {
        id: "3",
        name: "Problem Solver",
        description: "Solve 100 coding challenges",
        icon: "🧩",
        earned: false,
        points: 200,
        category: "mastery",
      },
      {
        id: "4",
        name: "AI Collaborator",
        description: "Use AI assistance 25 times",
        icon: "🤖",
        earned: false,
        points: 75,
        category: "collaboration",
      },
      {
        id: "5",
        name: "Top Performer",
        description: "Rank in top 500 globally",
        icon: "🏆",
        earned: false,
        points: 300,
        category: "ranking",
      },
      {
        id: "6",
        name: "Knowledge Seeker",
        description: "Complete 50 learning modules",
        icon: "📚",
        earned: false,
        points: 250,
        category: "learning",
      },
    ];

    // Merge user achievements with available achievements
    const allAchievements = availableAchievements.map((available) => {
      const userAchievement = transformedAchievements.find(
        (user) => user.name === available.name
      );
      return userAchievement || available;
    });

    return NextResponse.json({
      success: true,
      achievements: allAchievements,
      totalEarned: transformedAchievements.filter((a) => a.earned).length,
      totalAvailable: availableAchievements.length,
    });
  } catch (error) {
    console.error("Profile achievements fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
