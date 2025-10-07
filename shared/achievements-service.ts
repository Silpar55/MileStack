import { db } from "./db";
import {
  achievements,
  achievementTemplates,
  userPoints,
  pointTransactions,
  users,
} from "./schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export interface AchievementCriteria {
  type:
    | "streak"
    | "points"
    | "activities"
    | "collaboration"
    | "mastery"
    | "integrity";
  target: number;
  timeframe?: string; // "daily", "weekly", "monthly", "all-time"
  category?: string; // For mastery achievements
  conditions?: Record<string, any>;
}

export interface AchievementProgress {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  criteria: AchievementCriteria;
  progress: Record<string, any>;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercentage: number;
}

export interface AchievementUnlockResult {
  success: boolean;
  achievementId: string;
  pointsAwarded: number;
  message: string;
}

export class AchievementsService {
  private static instance: AchievementsService;

  public static getInstance(): AchievementsService {
    if (!AchievementsService.instance) {
      AchievementsService.instance = new AchievementsService();
    }
    return AchievementsService.instance;
  }

  /**
   * Initialize achievement templates
   */
  async initializeAchievementTemplates() {
    const templates = [
      // Learning Streaks
      {
        id: "streak_7_days",
        name: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        category: "streak",
        icon: "🔥",
        points: 50,
        criteria: {
          type: "streak",
          target: 7,
          timeframe: "daily",
        },
      },
      {
        id: "streak_30_days",
        name: "Monthly Master",
        description: "Maintain a 30-day learning streak",
        category: "streak",
        icon: "🏆",
        points: 200,
        criteria: {
          type: "streak",
          target: 30,
          timeframe: "daily",
        },
      },
      {
        id: "streak_90_days",
        name: "Quarter Champion",
        description: "Maintain a 90-day learning streak",
        category: "streak",
        icon: "👑",
        points: 500,
        criteria: {
          type: "streak",
          target: 90,
          timeframe: "daily",
        },
      },

      // Concept Mastery
      {
        id: "mastery_algorithms",
        name: "Algorithm Architect",
        description: "Master 10 algorithm concepts",
        category: "mastery",
        icon: "🧮",
        points: 100,
        criteria: {
          type: "mastery",
          target: 10,
          category: "algorithms",
        },
      },
      {
        id: "mastery_data_structures",
        name: "Data Structure Specialist",
        description: "Master 10 data structure concepts",
        category: "mastery",
        icon: "🏗️",
        points: 100,
        criteria: {
          type: "mastery",
          target: 10,
          category: "data-structures",
        },
      },
      {
        id: "mastery_web_dev",
        name: "Web Development Wizard",
        description: "Master 10 web development concepts",
        category: "mastery",
        icon: "🌐",
        points: 100,
        criteria: {
          type: "mastery",
          target: 10,
          category: "web-dev",
        },
      },

      // Collaboration
      {
        id: "helper_10_peers",
        name: "Peer Mentor",
        description: "Help 10 fellow students",
        category: "collaboration",
        icon: "🤝",
        points: 150,
        criteria: {
          type: "collaboration",
          target: 10,
        },
      },
      {
        id: "helper_50_peers",
        name: "Community Champion",
        description: "Help 50 fellow students",
        category: "collaboration",
        icon: "🌟",
        points: 500,
        criteria: {
          type: "collaboration",
          target: 50,
        },
      },

      // Academic Integrity
      {
        id: "integrity_transparent",
        name: "Transparency Advocate",
        description: "Maintain transparent AI usage for 30 days",
        category: "integrity",
        icon: "🔍",
        points: 100,
        criteria: {
          type: "integrity",
          target: 30,
          timeframe: "daily",
        },
      },
      {
        id: "integrity_ethical",
        name: "Ethical Learner",
        description: "Complete 100 assessments without fraud flags",
        category: "integrity",
        icon: "⚖️",
        points: 200,
        criteria: {
          type: "integrity",
          target: 100,
        },
      },

      // Points Milestones
      {
        id: "points_1000",
        name: "Point Collector",
        description: "Earn 1,000 total points",
        category: "points",
        icon: "💰",
        points: 50,
        criteria: {
          type: "points",
          target: 1000,
        },
      },
      {
        id: "points_5000",
        name: "Point Accumulator",
        description: "Earn 5,000 total points",
        category: "points",
        icon: "💎",
        points: 100,
        criteria: {
          type: "points",
          target: 5000,
        },
      },
      {
        id: "points_10000",
        name: "Point Master",
        description: "Earn 10,000 total points",
        category: "points",
        icon: "💍",
        points: 200,
        criteria: {
          type: "points",
          target: 10000,
        },
      },
    ];

    for (const template of templates) {
      await db
        .insert(achievementTemplates)
        .values(template)
        .onConflictDoNothing();
    }
  }

  /**
   * Check and unlock achievements for a user
   */
  async checkAchievements(userId: string): Promise<AchievementUnlockResult[]> {
    const unlockedAchievements: AchievementUnlockResult[] = [];

    try {
      // Get all achievement templates
      const templates = await db
        .select()
        .from(achievementTemplates)
        .where(eq(achievementTemplates.isActive, true));

      // Get user's current achievements
      const userAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, userId));

      const unlockedIds = new Set(
        userAchievements.filter((a) => a.isUnlocked).map((a) => a.achievementId)
      );

      for (const template of templates) {
        if (unlockedIds.has(template.id)) continue;

        const progress = await this.calculateProgress(
          userId,
          template.criteria as AchievementCriteria
        );
        const isUnlocked = this.checkUnlockCondition(
          progress,
          template.criteria as AchievementCriteria
        );

        if (isUnlocked) {
          const result = await this.unlockAchievement(userId, template);
          unlockedAchievements.push(result);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }

  /**
   * Get user's achievement progress
   */
  async getUserAchievements(userId: string): Promise<AchievementProgress[]> {
    try {
      const userAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, userId));

      const progressList: AchievementProgress[] = [];

      for (const achievement of userAchievements) {
        const template = await db
          .select()
          .from(achievementTemplates)
          .where(eq(achievementTemplates.id, achievement.achievementId))
          .limit(1);

        if (template.length > 0) {
          const currentProgress = await this.calculateProgress(
            userId,
            template[0].criteria as AchievementCriteria
          );
          const progressPercentage = this.calculateProgressPercentage(
            currentProgress,
            template[0].criteria as AchievementCriteria
          );

          progressList.push({
            achievementId: achievement.achievementId,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            icon: achievement.icon || "",
            points: achievement.points,
            criteria: template[0].criteria as AchievementCriteria,
            progress: currentProgress,
            isUnlocked: achievement.isUnlocked,
            unlockedAt: achievement.unlockedAt?.toISOString() || null,
            progressPercentage,
          });
        }
      }

      return progressList;
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return [];
    }
  }

  /**
   * Calculate progress towards an achievement
   */
  private async calculateProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    switch (criteria.type) {
      case "streak":
        return await this.calculateStreakProgress(userId, criteria);
      case "points":
        return await this.calculatePointsProgress(userId, criteria);
      case "activities":
        return await this.calculateActivitiesProgress(userId, criteria);
      case "collaboration":
        return await this.calculateCollaborationProgress(userId, criteria);
      case "mastery":
        return await this.calculateMasteryProgress(userId, criteria);
      case "integrity":
        return await this.calculateIntegrityProgress(userId, criteria);
      default:
        return {};
    }
  }

  private async calculateStreakProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    // This would need to be implemented based on your learning activity tracking
    // For now, return a placeholder
    return {
      current: 0,
      target: criteria.target,
      timeframe: criteria.timeframe,
    };
  }

  private async calculatePointsProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    const userPointsRecord = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    const totalEarned = userPointsRecord[0]?.totalEarned || 0;

    return {
      current: totalEarned,
      target: criteria.target,
    };
  }

  private async calculateActivitiesProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    const timeframe = criteria.timeframe || "all-time";
    let startDate: Date;

    switch (timeframe) {
      case "daily":
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const activities = await db
      .select()
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.type, "earned"),
          gte(pointTransactions.createdAt, startDate)
        )
      );

    return {
      current: activities.length,
      target: criteria.target,
      timeframe,
    };
  }

  private async calculateCollaborationProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    const peerHelpActivities = await db
      .select()
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.type, "earned"),
          eq(pointTransactions.category, "peer-help")
        )
      );

    return {
      current: peerHelpActivities.length,
      target: criteria.target,
    };
  }

  private async calculateMasteryProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    // This would need to be implemented based on your concept mastery tracking
    // For now, return a placeholder
    return {
      current: 0,
      target: criteria.target,
      category: criteria.category,
    };
  }

  private async calculateIntegrityProgress(
    userId: string,
    criteria: AchievementCriteria
  ): Promise<Record<string, any>> {
    // This would need to be implemented based on your integrity tracking
    // For now, return a placeholder
    return {
      current: 0,
      target: criteria.target,
    };
  }

  /**
   * Check if achievement should be unlocked
   */
  private checkUnlockCondition(
    progress: Record<string, any>,
    criteria: AchievementCriteria
  ): boolean {
    switch (criteria.type) {
      case "streak":
      case "points":
      case "activities":
      case "collaboration":
      case "mastery":
      case "integrity":
        return progress.current >= criteria.target;
      default:
        return false;
    }
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgressPercentage(
    progress: Record<string, any>,
    criteria: AchievementCriteria
  ): number {
    const current = progress.current || 0;
    const target = criteria.target;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  /**
   * Unlock an achievement for a user
   */
  private async unlockAchievement(
    userId: string,
    template: any
  ): Promise<AchievementUnlockResult> {
    try {
      // Check if already unlocked
      const existing = await db
        .select()
        .from(achievements)
        .where(
          and(
            eq(achievements.userId, userId),
            eq(achievements.achievementId, template.id)
          )
        )
        .limit(1);

      if (existing.length > 0 && existing[0].isUnlocked) {
        return {
          success: false,
          achievementId: template.id,
          pointsAwarded: 0,
          message: "Achievement already unlocked",
        };
      }

      // Award achievement points
      const pointsResult = await db
        .insert(pointTransactions)
        .values({
          userId,
          amount: template.points,
          type: "earned",
          category: "achievement",
          reason: `Achievement unlocked: ${template.name}`,
          sourceType: "achievement",
        })
        .returning();

      // Update user points
      await db
        .update(userPoints)
        .set({
          currentBalance: sql`${userPoints.currentBalance} + ${template.points}`,
          totalEarned: sql`${userPoints.totalEarned} + ${template.points}`,
        })
        .where(eq(userPoints.userId, userId));

      // Create or update achievement record
      if (existing.length > 0) {
        await db
          .update(achievements)
          .set({
            isUnlocked: true,
            unlockedAt: new Date(),
          })
          .where(eq(achievements.id, existing[0].id));
      } else {
        await db.insert(achievements).values({
          userId,
          achievementId: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          icon: template.icon,
          points: template.points,
          criteria: template.criteria,
          progress: {},
          isUnlocked: true,
          unlockedAt: new Date(),
        });
      }

      return {
        success: true,
        achievementId: template.id,
        pointsAwarded: template.points,
        message: `Achievement unlocked: ${template.name}`,
      };
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      return {
        success: false,
        achievementId: template.id,
        pointsAwarded: 0,
        message: "Failed to unlock achievement",
      };
    }
  }

  /**
   * Get achievement analytics for admin dashboard
   */
  async getAchievementAnalytics() {
    try {
      const totalAchievements = await db.select().from(achievements);
      const unlockedAchievements = totalAchievements.filter(
        (a) => a.isUnlocked
      );

      const categoryStats = unlockedAchievements.reduce((acc, achievement) => {
        acc[achievement.category] = (acc[achievement.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAchievements: totalAchievements.length,
        unlockedAchievements: unlockedAchievements.length,
        unlockRate:
          totalAchievements.length > 0
            ? (unlockedAchievements.length / totalAchievements.length) * 100
            : 0,
        categoryStats,
      };
    } catch (error) {
      console.error("Error getting achievement analytics:", error);
      return null;
    }
  }
}

// Export singleton instance
export const achievementsService = AchievementsService.getInstance();
