import { db } from "./db";
import {
  userPoints,
  pointTransactions,
  fraudDetectionLogs,
  users,
} from "./schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface PointsEarnRequest {
  userId: string;
  category:
    | "concept-explanation"
    | "mini-challenge"
    | "code-review"
    | "peer-help";
  amount: number;
  reason: string;
  sourceId?: string;
  sourceType?: string;
  qualityScore?: number;
  metadata?: Record<string, any>;
}

export interface PointsSpendRequest {
  userId: string;
  category:
    | "conceptual-hints"
    | "pseudocode-guidance"
    | "code-review-session"
    | "ai-copilot";
  amount: number;
  reason: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export interface PointsBalance {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  dailyEarned: number;
  dailyLimit: number;
  canEarnMore: boolean;
  lastEarnedDate: string | null;
}

export interface FraudDetectionResult {
  riskScore: number;
  flags: string[];
  action: "none" | "flag" | "block" | "review";
  details: Record<string, any>;
}

export class PointsService {
  private static instance: PointsService;
  private readonly DAILY_POINT_LIMIT = 100;
  private readonly COOLING_PERIOD_MINUTES = 10;
  private readonly MIN_QUALITY_SCORE = 70;

  public static getInstance(): PointsService {
    if (!PointsService.instance) {
      PointsService.instance = new PointsService();
    }
    return PointsService.instance;
  }

  /**
   * Award points for completed learning activities
   */
  async awardPoints(request: PointsEarnRequest): Promise<{
    success: boolean;
    pointsAwarded: number;
    message: string;
    fraudDetected?: boolean;
  }> {
    try {
      // Check if user exists and get current points
      const userPointsRecord = await this.getUserPoints(request.userId);
      if (!userPointsRecord) {
        return {
          success: false,
          pointsAwarded: 0,
          message: "User not found",
        };
      }

      // Fraud detection
      const fraudResult = await this.detectFraud(request);
      if (fraudResult.action === "block") {
        await this.logFraudDetection(
          request.userId,
          "points-earn",
          fraudResult
        );
        return {
          success: false,
          pointsAwarded: 0,
          message: "Activity flagged for review",
          fraudDetected: true,
        };
      }

      // Check daily limit
      const canEarn = await this.canEarnPoints(request.userId, request.amount);
      if (!canEarn.allowed) {
        return {
          success: false,
          pointsAwarded: 0,
          message: canEarn.reason,
        };
      }

      // Check quality threshold
      if (
        request.qualityScore &&
        request.qualityScore < this.MIN_QUALITY_SCORE
      ) {
        return {
          success: false,
          pointsAwarded: 0,
          message: "Quality score too low to earn points",
        };
      }

      // Check cooling period
      const coolingCheck = await this.checkCoolingPeriod(request.userId);
      if (!coolingCheck.allowed) {
        return {
          success: false,
          pointsAwarded: 0,
          message: coolingCheck.reason,
        };
      }

      // Award points
      const pointsAwarded = Math.min(request.amount, canEarn.remaining);

      await db.transaction(async (tx) => {
        // Update user points
        await tx
          .update(userPoints)
          .set({
            currentBalance: sql`${userPoints.currentBalance} + ${pointsAwarded}`,
            totalEarned: sql`${userPoints.totalEarned} + ${pointsAwarded}`,
            dailyEarned: sql`${userPoints.dailyEarned} + ${pointsAwarded}`,
            lastEarnedDate: new Date().toISOString().split("T")[0],
            updatedAt: new Date(),
          })
          .where(eq(userPoints.userId, request.userId));

        // Create transaction record
        await tx.insert(pointTransactions).values({
          userId: request.userId,
          amount: pointsAwarded,
          type: "earned",
          category: request.category,
          reason: request.reason,
          sourceId: request.sourceId,
          sourceType: request.sourceType,
          qualityScore: request.qualityScore,
          verified: fraudResult.action === "none",
        });
      });

      // Log fraud if flagged
      if (fraudResult.action === "flag") {
        await this.logFraudDetection(
          request.userId,
          "points-earn",
          fraudResult
        );
      }

      return {
        success: true,
        pointsAwarded,
        message: `Awarded ${pointsAwarded} points for ${request.reason}`,
      };
    } catch (error) {
      console.error("Error awarding points:", error);
      return {
        success: false,
        pointsAwarded: 0,
        message: "Failed to award points",
      };
    }
  }

  /**
   * Spend points for AI assistance
   */
  async spendPoints(request: PointsSpendRequest): Promise<{
    success: boolean;
    pointsSpent: number;
    message: string;
    remainingBalance: number;
  }> {
    try {
      const userPointsRecord = await this.getUserPoints(request.userId);
      if (!userPointsRecord) {
        return {
          success: false,
          pointsSpent: 0,
          message: "User not found",
          remainingBalance: 0,
        };
      }

      if (userPointsRecord.currentBalance < request.amount) {
        return {
          success: false,
          pointsSpent: 0,
          message: "Insufficient points balance",
          remainingBalance: userPointsRecord.currentBalance,
        };
      }

      await db.transaction(async (tx) => {
        // Update user points
        await tx
          .update(userPoints)
          .set({
            currentBalance: sql`${userPoints.currentBalance} - ${request.amount}`,
            totalSpent: sql`${userPoints.totalSpent} + ${request.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(userPoints.userId, request.userId));

        // Create transaction record
        await tx.insert(pointTransactions).values({
          userId: request.userId,
          amount: -request.amount,
          type: "spent",
          category: request.category,
          reason: request.reason,
          sourceId: request.sourceId,
          sourceType: "ai-usage",
        });
      });

      return {
        success: true,
        pointsSpent: request.amount,
        message: `Spent ${request.amount} points for ${request.reason}`,
        remainingBalance: userPointsRecord.currentBalance - request.amount,
      };
    } catch (error) {
      console.error("Error spending points:", error);
      return {
        success: false,
        pointsSpent: 0,
        message: "Failed to spend points",
        remainingBalance: 0,
      };
    }
  }

  /**
   * Get user's current points balance and history
   */
  async getPointsBalance(userId: string): Promise<PointsBalance | null> {
    try {
      const userPointsRecord = await this.getUserPoints(userId);
      if (!userPointsRecord) return null;

      const canEarn = await this.canEarnPoints(userId, 0);

      return {
        currentBalance: userPointsRecord.currentBalance,
        totalEarned: userPointsRecord.totalEarned,
        totalSpent: userPointsRecord.totalSpent,
        dailyEarned: userPointsRecord.dailyEarned,
        dailyLimit: this.DAILY_POINT_LIMIT,
        canEarnMore: canEarn.allowed,
        lastEarnedDate: userPointsRecord.lastEarnedDate,
      };
    } catch (error) {
      console.error("Error getting points balance:", error);
      return null;
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const transactions = await db
        .select()
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId))
        .orderBy(desc(pointTransactions.createdAt))
        .limit(limit)
        .offset(offset);

      return transactions;
    } catch (error) {
      console.error("Error getting transaction history:", error);
      return [];
    }
  }

  /**
   * Check if user can earn points (daily limit, cooling period)
   */
  private async canEarnPoints(
    userId: string,
    requestedAmount: number
  ): Promise<{ allowed: boolean; reason: string; remaining: number }> {
    const userPointsRecord = await this.getUserPoints(userId);
    if (!userPointsRecord) {
      return { allowed: false, reason: "User not found", remaining: 0 };
    }

    const today = new Date().toISOString().split("T")[0];
    const isNewDay = userPointsRecord.lastEarnedDate !== today;

    // Reset daily earned if it's a new day
    if (isNewDay) {
      await db
        .update(userPoints)
        .set({
          dailyEarned: 0,
          lastEarnedDate: today,
        })
        .where(eq(userPoints.userId, userId));
    }

    const currentDailyEarned = isNewDay ? 0 : userPointsRecord.dailyEarned;
    const remaining = this.DAILY_POINT_LIMIT - currentDailyEarned;

    if (currentDailyEarned >= this.DAILY_POINT_LIMIT) {
      return {
        allowed: false,
        reason: "Daily point limit reached",
        remaining: 0,
      };
    }

    if (requestedAmount > remaining) {
      return {
        allowed: false,
        reason: `Requested amount exceeds daily limit. Remaining: ${remaining}`,
        remaining,
      };
    }

    return { allowed: true, reason: "", remaining };
  }

  /**
   * Check cooling period between attempts
   */
  private async checkCoolingPeriod(
    userId: string
  ): Promise<{ allowed: boolean; reason: string }> {
    const recentTransaction = await db
      .select()
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          eq(pointTransactions.type, "earned"),
          gte(
            pointTransactions.createdAt,
            new Date(Date.now() - this.COOLING_PERIOD_MINUTES * 60 * 1000)
          )
        )
      )
      .limit(1);

    if (recentTransaction.length > 0) {
      const timeRemaining = Math.ceil(
        (this.COOLING_PERIOD_MINUTES * 60 * 1000 -
          (Date.now() - recentTransaction[0].createdAt.getTime())) /
          1000
      );
      return {
        allowed: false,
        reason: `Please wait ${timeRemaining} seconds before earning more points`,
      };
    }

    return { allowed: true, reason: "" };
  }

  /**
   * Fraud detection for unusual activity patterns
   */
  private async detectFraud(
    request: PointsEarnRequest
  ): Promise<FraudDetectionResult> {
    const flags: string[] = [];
    let riskScore = 0;
    const details: Record<string, any> = {};

    // Check for rapid-fire attempts
    const recentTransactions = await db
      .select()
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, request.userId),
          eq(pointTransactions.type, "earned"),
          gte(
            pointTransactions.createdAt,
            new Date(Date.now() - 60 * 60 * 1000) // Last hour
          )
        )
      );

    if (recentTransactions.length > 10) {
      flags.push("rapid_fire_attempts");
      riskScore += 30;
      details.rapidAttempts = recentTransactions.length;
    }

    // Check for low quality scores
    if (request.qualityScore && request.qualityScore < 50) {
      flags.push("low_quality_score");
      riskScore += 20;
      details.qualityScore = request.qualityScore;
    }

    // Check for unusual patterns
    const dailyTransactions = await db
      .select()
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, request.userId),
          eq(pointTransactions.type, "earned"),
          gte(
            pointTransactions.createdAt,
            new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          )
        )
      );

    if (dailyTransactions.length > 20) {
      flags.push("excessive_daily_activity");
      riskScore += 25;
      details.dailyTransactions = dailyTransactions.length;
    }

    // Check for same source abuse
    if (request.sourceId) {
      const sourceTransactions = dailyTransactions.filter(
        (t) => t.sourceId === request.sourceId
      );
      if (sourceTransactions.length > 5) {
        flags.push("source_abuse");
        riskScore += 15;
        details.sourceTransactions = sourceTransactions.length;
      }
    }

    // Determine action based on risk score
    let action: "none" | "flag" | "block" | "review" = "none";
    if (riskScore >= 70) {
      action = "block";
    } else if (riskScore >= 40) {
      action = "flag";
    } else if (riskScore >= 20) {
      action = "review";
    }

    return {
      riskScore,
      flags,
      action,
      details,
    };
  }

  /**
   * Log fraud detection results
   */
  private async logFraudDetection(
    userId: string,
    activityType: string,
    result: FraudDetectionResult
  ) {
    await db.insert(fraudDetectionLogs).values({
      userId,
      activityType,
      riskScore: result.riskScore,
      flags: result.flags,
      details: result.details,
      action: result.action,
    });
  }

  /**
   * Get user points record, create if doesn't exist
   */
  private async getUserPoints(userId: string) {
    let userPointsRecord = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    if (userPointsRecord.length === 0) {
      // Create new user points record
      const newRecord = await db
        .insert(userPoints)
        .values({
          userId,
          currentBalance: 0,
          totalEarned: 0,
          totalSpent: 0,
          dailyEarned: 0,
        })
        .returning();
      return newRecord[0];
    }

    return userPointsRecord[0];
  }

  /**
   * Get points analytics for admin dashboard
   */
  async getPointsAnalytics() {
    try {
      const totalUsers = await db.select().from(users);
      const totalPoints = await db
        .select({
          totalEarned: sql<number>`sum(${userPoints.totalEarned})`,
          totalSpent: sql<number>`sum(${userPoints.totalSpent})`,
          totalBalance: sql<number>`sum(${userPoints.currentBalance})`,
        })
        .from(userPoints);

      const fraudLogs = await db
        .select()
        .from(fraudDetectionLogs)
        .where(
          gte(
            fraudDetectionLogs.createdAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          )
        );

      return {
        totalUsers: totalUsers.length,
        totalPointsEarned: totalPoints[0]?.totalEarned || 0,
        totalPointsSpent: totalPoints[0]?.totalSpent || 0,
        totalPointsInCirculation: totalPoints[0]?.totalBalance || 0,
        fraudDetections: fraudLogs.length,
        highRiskDetections: fraudLogs.filter((log) => log.riskScore >= 70)
          .length,
      };
    } catch (error) {
      console.error("Error getting points analytics:", error);
      return null;
    }
  }
}

// Export singleton instance
export const pointsService = PointsService.getInstance();
