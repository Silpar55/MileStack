import { db } from "./db";
import {
  users,
  challenges,
  learningPathways,
  pathwayProgress,
  checkpointAttempts,
  userPoints,
  pointTransactions,
  achievements,
  fraudDetectionLogs,
} from "./schema";
import { assignments } from "./schema-assignments";
import { eq, gte } from "drizzle-orm";

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      monthly: number;
      retention: {
        day1: number;
        day7: number;
        day30: number;
      };
    };
    learningMetrics: {
      pathwayCompletions: number;
      averageCompletionTime: number;
      successRate: number;
    };
    aiAssistance: {
      totalRequests: number;
      pointsSpent: number;
      satisfactionScore: number;
    };
    integrity: {
      violations: number;
    };
  };
  contentPerformance: {
    challenges: {
      total: number;
      approved: number;
      pending: number;
      completionRate: number;
      averageRating: number;
    };
    assignments: {
      total: number;
      active: number;
      completionRate: number;
      averageScore: number;
    };
    aiEffectiveness: {
      satisfactionRatings: number[];
      responseQuality: number;
      educationalValue: number;
    };
  };
  integrityMonitoring: {
    unusualPatterns: {
      rapidPointEarning: number;
      multipleAccounts: number;
      lowQualitySubmissions: number;
    };
    compliance: {
      honorCodeRate: number;
      transparencyRate: number;
      violationRate: number;
    };
    trends: {
      pointEconomyHealth: number;
      integrityScore: number;
      learningEngagement: number;
    };
  };
}

export interface ContentModeration {
  challenges: {
    pending: Array<{
      id: string;
      title: string;
      description: string;
      difficulty: string;
      submittedBy: string;
      submittedAt: Date;
      reviewStatus: "pending" | "approved" | "rejected";
      qualityScore: number;
    }>;
    approved: Array<{
      id: string;
      title: string;
      completionRate: number;
      averageRating: number;
      lastUpdated: Date;
    }>;
  };
  assignments: {
    pending: Array<{
      id: string;
      title: string;
      description: string;
      difficulty: string;
      submittedBy: string;
      submittedAt: Date;
      reviewStatus: "pending" | "approved" | "rejected";
    }>;
    approved: Array<{
      id: string;
      title: string;
      completionRate: number;
      averageScore: number;
      lastUpdated: Date;
    }>;
  };
}

export interface UserModeration {
  flaggedUsers: Array<{
    id: string;
    name: string;
    email: string;
    institution?: string;
    flagReason: string;
    flagDate: Date;
    riskScore: number;
    recentActivity: Array<{
      type: string;
      timestamp: Date;
      description: string;
    }>;
  }>;
  suspiciousActivity: Array<{
    id: string;
    userId: string;
    activityType: string;
    riskScore: number;
    detectedAt: Date;
    description: string;
    status: "investigating" | "resolved" | "false_positive";
  }>;
}

export interface PlatformSettings {
  general: {
    platformName: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    aiAssistanceEnabled: boolean;
  };
  points: {
    dailyLimit: number;
    earningMultiplier: number;
    spendingMultiplier: number;
    fraudDetectionThreshold: number;
  };
  integrity: {
    honorCodeRequired: boolean;
    transparencyRequired: boolean;
    violationThreshold: number;
    autoFlagging: boolean;
  };
  content: {
    autoApprovalThreshold: number;
    qualityScoreThreshold: number;
    moderationQueueSize: number;
  };
}

export class AdminAnalyticsService {
  async getAnalyticsOverview(): Promise<AdminAnalytics> {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic metrics
    const totalUsers = await db.select().from(users);
    const activeUsers = await this.getActiveUsers(dayStart, monthStart);
    const learningMetrics = await this.getLearningMetrics();
    const aiAssistance = await this.getAIAssistanceMetrics();
    const integrity = await this.getIntegrityMetrics();

    // Get content performance
    const contentPerformance = await this.getContentPerformance();

    // Get integrity monitoring
    const integrityMonitoring = await this.getIntegrityMonitoring();

    return {
      overview: {
        totalUsers: totalUsers.length,
        activeUsers,
        learningMetrics,
        aiAssistance,
        integrity,
      },
      contentPerformance,
      integrityMonitoring,
    };
  }

  async getContentModeration(): Promise<ContentModeration> {
    // Get pending challenges
    const pendingChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, false));

    // Get approved challenges
    const approvedChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true));

    // Get pending assignments
    const pendingAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.analysisStatus, "pending"));

    // Get completed assignments
    const completedAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.analysisStatus, "complete"));

    return {
      challenges: {
        pending: pendingChallenges.map((challenge) => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          submittedBy: challenge.createdBy || "Unknown",
          submittedAt: challenge.createdAt,
          reviewStatus: challenge.isActive
            ? "approved"
            : ("pending" as "pending" | "approved" | "rejected"),
          qualityScore: challenge.rating || 0,
        })),
        approved: approvedChallenges.map((challenge) => ({
          id: challenge.id,
          title: challenge.title,
          completionRate: challenge.solvedCount || 0,
          averageRating: challenge.rating || 0,
          lastUpdated: challenge.updatedAt,
        })),
      },
      assignments: {
        pending: pendingAssignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.originalFilename || "No filename",
          difficulty: assignment.estimatedDifficulty?.toString() || "unknown",
          submittedBy: assignment.userId || "Unknown",
          submittedAt: assignment.uploadTimestamp,
          reviewStatus: (assignment.analysisStatus === "complete"
            ? "approved"
            : "pending") as "pending" | "approved" | "rejected",
        })),
        approved: completedAssignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          completionRate: 0,
          averageScore: 0,
          lastUpdated: assignment.uploadTimestamp,
        })),
      },
    };
  }

  async getUserModeration(): Promise<UserModeration> {
    // Get flagged users (mock implementation - users table doesn't have isFlagged field)
    const flaggedUsers: any[] = [];

    // Get suspicious activity
    const suspiciousActivity = await db
      .select()
      .from(fraudDetectionLogs)
      .where(gte(fraudDetectionLogs.riskScore, 70));

    return {
      flaggedUsers: flaggedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        flagReason: user.flagReason || "Unusual activity pattern",
        flagDate: user.flaggedAt || user.createdAt,
        riskScore: user.riskScore || 0,
        recentActivity: [], // This would be populated from activity logs
      })),
      suspiciousActivity: suspiciousActivity.map((activity) => ({
        id: activity.id,
        userId: activity.userId,
        activityType: activity.activityType,
        riskScore: activity.riskScore,
        detectedAt: activity.createdAt,
        description: `Fraud detection: ${activity.activityType}`,
        status: activity.reviewed
          ? "resolved"
          : ("investigating" as
              | "investigating"
              | "resolved"
              | "false_positive"),
      })),
    };
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    // This would typically come from a settings table
    return {
      general: {
        platformName: "MileStack",
        maintenanceMode: false,
        registrationEnabled: true,
        aiAssistanceEnabled: true,
      },
      points: {
        dailyLimit: 100,
        earningMultiplier: 1.0,
        spendingMultiplier: 1.0,
        fraudDetectionThreshold: 70,
      },
      integrity: {
        honorCodeRequired: true,
        transparencyRequired: true,
        violationThreshold: 3,
        autoFlagging: true,
      },
      content: {
        autoApprovalThreshold: 85,
        qualityScoreThreshold: 70,
        moderationQueueSize: 50,
      },
    };
  }

  async updatePlatformSettings(
    settings: Partial<PlatformSettings>
  ): Promise<PlatformSettings> {
    // This would update the settings in the database
    // For now, return the updated settings
    return {
      general: {
        platformName: "MileStack",
        maintenanceMode: false,
        registrationEnabled: true,
        aiAssistanceEnabled: true,
      },
      points: {
        dailyLimit: 100,
        earningMultiplier: 1.0,
        spendingMultiplier: 1.0,
        fraudDetectionThreshold: 70,
      },
      integrity: {
        honorCodeRequired: true,
        transparencyRequired: true,
        violationThreshold: 3,
        autoFlagging: true,
      },
      content: {
        autoApprovalThreshold: 85,
        qualityScoreThreshold: 70,
        moderationQueueSize: 50,
      },
    };
  }

  async approveChallenge(
    challengeId: string,
    approvedBy: string
  ): Promise<{ success: boolean }> {
    try {
      await db
        .update(learningPathways)
        .set({
          isActive: true,
          approvedBy,
          approvedAt: new Date(),
        })
        .where(eq(learningPathways.id, challengeId));

      return { success: true };
    } catch (error) {
      console.error("Error approving challenge:", error);
      return { success: false };
    }
  }

  async rejectChallenge(
    challengeId: string,
    rejectedBy: string,
    reason: string
  ): Promise<{ success: boolean }> {
    try {
      await db
        .update(learningPathways)
        .set({
          isActive: false,
        })
        .where(eq(learningPathways.id, challengeId));

      return { success: true };
    } catch (error) {
      console.error("Error rejecting challenge:", error);
      return { success: false };
    }
  }

  async flagUser(
    userId: string,
    reason: string,
    flaggedBy: string
  ): Promise<{ success: boolean }> {
    try {
      // Mock implementation - users table doesn't have flagging fields
      // In a real implementation, you would create a separate flagged_users table
      console.log(`User ${userId} flagged by ${flaggedBy} for: ${reason}`);
      return { success: true };
    } catch (error) {
      console.error("Error flagging user:", error);
      return { success: false };
    }
  }

  async unflagUser(
    userId: string,
    unflaggedBy: string
  ): Promise<{ success: boolean }> {
    try {
      // Mock implementation - users table doesn't have flagging fields
      console.log(`User ${userId} unflagged by ${unflaggedBy}`);
      return { success: true };
    } catch (error) {
      console.error("Error unflagging user:", error);
      return { success: false };
    }
  }

  async generateReport(
    reportType: "overview" | "integrity" | "content" | "users",
    period: { start: Date; end: Date }
  ): Promise<{ downloadUrl: string }> {
    // This would generate a comprehensive report
    // For now, return a mock download URL
    return {
      downloadUrl: `/api/admin/reports/${reportType}-${period.start.toISOString()}-${period.end.toISOString()}.pdf`,
    };
  }

  private async getActiveUsers(dayStart: Date, monthStart: Date) {
    // This would calculate active users from activity logs
    return {
      daily: 150,
      monthly: 1200,
      retention: {
        day1: 85,
        day7: 65,
        day30: 45,
      },
    };
  }

  private async getLearningMetrics() {
    // This would calculate learning metrics from pathway progress
    return {
      pathwayCompletions: 450,
      averageCompletionTime: 4.5, // hours
      successRate: 78,
    };
  }

  private async getAIAssistanceMetrics() {
    // This would calculate AI assistance metrics
    return {
      totalRequests: 2500,
      pointsSpent: 12500,
      satisfactionScore: 4.2,
    };
  }

  private async getIntegrityMetrics() {
    // This would calculate integrity metrics
    return {
      violations: 15,
    };
  }

  private async getContentPerformance() {
    // This would calculate content performance metrics
    return {
      challenges: {
        total: 150,
        approved: 120,
        pending: 30,
        completionRate: 75,
        averageRating: 4.1,
      },
      assignments: {
        total: 80,
        active: 65,
        completionRate: 82,
        averageScore: 85,
      },
      aiEffectiveness: {
        satisfactionRatings: [4.2, 4.1, 4.3, 4.0, 4.2],
        responseQuality: 4.1,
        educationalValue: 4.3,
      },
    };
  }

  private async getIntegrityMonitoring() {
    // This would calculate integrity monitoring metrics
    return {
      unusualPatterns: {
        rapidPointEarning: 5,
        multipleAccounts: 2,
        lowQualitySubmissions: 8,
      },
      compliance: {
        honorCodeRate: 95,
        transparencyRate: 88,
        violationRate: 2.5,
      },
      trends: {
        pointEconomyHealth: 85,
        integrityScore: 92,
        learningEngagement: 78,
      },
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
