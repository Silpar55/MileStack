import { db } from "./db";
import {
  learningPathways,
  pathwayProgress,
  checkpointAttempts,
  pointTransactions,
  userPoints,
} from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createHash, createHmac } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

export interface HonorCodeSignature {
  id: string;
  userId: string;
  assignmentId?: string;
  signature: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  version: string;
  institution?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TransparencyReport {
  assignment_details: {
    title: string;
    uploaded_at: string;
    completed_at: string;
    total_time_invested: string;
  };
  learning_progression: {
    competency_checkpoints: Array<{
      checkpoint: string;
      attempts: number;
      final_score: string;
      time_spent: string;
    }>;
  };
  ai_assistance_used: Array<{
    timestamp: string;
    type: string;
    points_spent: number;
    context: string;
    assistance_provided: string;
  }>;
  academic_integrity_compliance: {
    honor_code_acceptances: number;
    policy_violations: number;
    transparency_level: string;
  };
}

export interface IntegrityDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
  };
  summary: {
    total_assignments: number;
    total_ai_assistance_requests: number;
    total_points_earned: number;
    total_points_spent: number;
    honor_code_signatures: number;
    transparency_reports_generated: number;
  };
  recent_activity: Array<{
    timestamp: string;
    type: string;
    description: string;
    assignment_id?: string;
  }>;
  integrity_score: {
    overall: number;
    transparency: number;
    compliance: number;
    learning_engagement: number;
  };
}

export interface PrivacySettings {
  userId: string;
  shareWithInstructors: boolean;
  allowAnonymousAnalytics: boolean;
  dataRetentionPeriod: number; // days
  exportDataOnRequest: boolean;
  deleteDataOnRequest: boolean;
  lmsIntegration: boolean;
  customInstitutionPolicies: boolean;
}

export class AcademicIntegrityService {
  private readonly HONOR_CODE_VERSION = "1.0.0";
  private readonly INTEGRITY_SALT =
    process.env.INTEGRITY_SALT || "default-salt";

  async signHonorCode(
    userId: string,
    assignmentId: string | null,
    userAgent: string,
    ipAddress: string,
    institution?: string
  ): Promise<HonorCodeSignature> {
    try {
      const timestamp = new Date().toISOString();
      const signatureData = {
        userId,
        assignmentId,
        timestamp,
        version: this.HONOR_CODE_VERSION,
        institution,
      };

      // Create digital signature using HMAC
      const signature = this.createDigitalSignature(signatureData);

      const honorCodeSignature: HonorCodeSignature = {
        id: this.generateSignatureId(),
        userId,
        assignmentId: assignmentId || undefined,
        signature,
        timestamp,
        ipAddress,
        userAgent,
        version: this.HONOR_CODE_VERSION,
        institution,
        isActive: true,
        createdAt: new Date(),
      };

      // Store in database (would be implemented with actual DB operations)
      await this.storeHonorCodeSignature(honorCodeSignature);

      return honorCodeSignature;
    } catch (error) {
      console.error("Error signing honor code:", error);
      throw new Error("Failed to sign honor code");
    }
  }

  async generateTransparencyReport(
    userId: string,
    assignmentId: string
  ): Promise<TransparencyReport> {
    try {
      // Get assignment details
      const pathway = await db
        .select()
        .from(learningPathways)
        .where(eq(learningPathways.id, assignmentId))
        .limit(1);

      if (pathway.length === 0) {
        throw new Error("Assignment not found");
      }

      // Get learning progress
      const progress = await db
        .select()
        .from(pathwayProgress)
        .where(
          and(
            eq(pathwayProgress.userId, userId),
            eq(pathwayProgress.pathwayId, assignmentId)
          )
        )
        .limit(1);

      // Get checkpoint attempts
      const checkpoints = await db
        .select()
        .from(checkpointAttempts)
        .where(
          and(
            eq(checkpointAttempts.userId, userId),
            eq(checkpointAttempts.checkpointId, assignmentId)
          )
        );

      // Get AI assistance usage
      const aiAssistance = await db
        .select()
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, userId),
            eq(pointTransactions.category, "ai_assistance")
          )
        )
        .orderBy(desc(pointTransactions.createdAt));

      // Get honor code signatures
      const honorCodeSignatures = await this.getHonorCodeSignatures(userId);

      // Calculate competency checkpoints
      const competencyCheckpoints = checkpoints.map((checkpoint) => ({
        checkpoint: `Checkpoint ${checkpoint.checkpointId.slice(0, 8)}`,
        attempts: checkpoint.attemptNumber || 1,
        final_score: `${Math.round((checkpoint.score || 0) * 100)}%`,
        time_spent: this.formatTimeInvestment(checkpoint.timeSpent || 0),
      }));

      // Format AI assistance usage
      const aiAssistanceUsed = aiAssistance.map((assistance) => ({
        timestamp:
          assistance.createdAt?.toISOString() || new Date().toISOString(),
        type: assistance.category || "Unknown",
        points_spent: Math.abs(assistance.amount) || 0,
        context: assistance.reason || "No context provided",
        assistance_provided: assistance.reason || "No details available",
      }));

      const report: TransparencyReport = {
        assignment_details: {
          title: pathway[0].title,
          uploaded_at:
            pathway[0].createdAt?.toISOString() || new Date().toISOString(),
          completed_at:
            progress[0]?.completedAt?.toISOString() || new Date().toISOString(),
          total_time_invested: this.formatTimeInvestment(
            progress[0]?.timeSpent || 0
          ),
        },
        learning_progression: {
          competency_checkpoints: competencyCheckpoints,
        },
        ai_assistance_used: aiAssistanceUsed,
        academic_integrity_compliance: {
          honor_code_acceptances: honorCodeSignatures.length,
          policy_violations: 0, // Would be calculated based on actual violations
          transparency_level: "Full disclosure available",
        },
      };

      return report;
    } catch (error) {
      console.error("Error generating transparency report:", error);
      throw new Error("Failed to generate transparency report");
    }
  }

  async getIntegrityDashboard(userId: string): Promise<IntegrityDashboard> {
    try {
      // Get user details (would be from user service)
      const user = {
        id: userId,
        name: "Student Name", // Would be fetched from user service
        email: "student@example.com", // Would be fetched from user service
        institution: "Example University", // Would be fetched from user service
      };

      // Get summary statistics
      const totalAssignments = await db
        .select({ count: sql<number>`count(*)` })
        .from(pathwayProgress)
        .where(eq(pathwayProgress.userId, userId));

      const totalAiAssistance = await db
        .select({ count: sql<number>`count(*)` })
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, userId),
            eq(pointTransactions.category, "ai_assistance")
          )
        );

      const totalPointsEarned = await db
        .select({ total: sql<number>`sum(${pointTransactions.amount})` })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId));

      const totalPointsSpent = await db
        .select({ total: sql<number>`sum(${pointTransactions.amount})` })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId));

      const honorCodeSignatures = await this.getHonorCodeSignatures(userId);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Calculate integrity score
      const integrityScore = await this.calculateIntegrityScore(userId);

      const dashboard: IntegrityDashboard = {
        user,
        summary: {
          total_assignments: totalAssignments[0]?.count || 0,
          total_ai_assistance_requests: totalAiAssistance[0]?.count || 0,
          total_points_earned: totalPointsEarned[0]?.total || 0,
          total_points_spent: totalPointsSpent[0]?.total || 0,
          honor_code_signatures: honorCodeSignatures.length,
          transparency_reports_generated: 0, // Would be calculated
        },
        recent_activity: recentActivity,
        integrity_score: integrityScore,
      };

      return dashboard;
    } catch (error) {
      console.error("Error getting integrity dashboard:", error);
      throw new Error("Failed to get integrity dashboard");
    }
  }

  async updatePrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    try {
      // Update privacy settings in database
      const updatedSettings: PrivacySettings = {
        userId,
        shareWithInstructors: settings.shareWithInstructors ?? false,
        allowAnonymousAnalytics: settings.allowAnonymousAnalytics ?? true,
        dataRetentionPeriod: settings.dataRetentionPeriod ?? 365,
        exportDataOnRequest: settings.exportDataOnRequest ?? true,
        deleteDataOnRequest: settings.deleteDataOnRequest ?? true,
        lmsIntegration: settings.lmsIntegration ?? false,
        customInstitutionPolicies: settings.customInstitutionPolicies ?? false,
      };

      // Store in database (would be implemented with actual DB operations)
      await this.storePrivacySettings(updatedSettings);

      return updatedSettings;
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw new Error("Failed to update privacy settings");
    }
  }

  async shareReportWithInstructor(
    userId: string,
    assignmentId: string,
    instructorEmail: string
  ): Promise<{ success: boolean; reportUrl: string }> {
    try {
      // Generate transparency report
      const report = await this.generateTransparencyReport(
        userId,
        assignmentId
      );

      // Create shareable link (would be implemented with actual sharing mechanism)
      const reportUrl = await this.createShareableReport(
        report,
        instructorEmail
      );

      // Send notification to instructor
      await this.sendInstructorNotification(instructorEmail, reportUrl);

      return {
        success: true,
        reportUrl,
      };
    } catch (error) {
      console.error("Error sharing report with instructor:", error);
      throw new Error("Failed to share report with instructor");
    }
  }

  async exportStudentData(userId: string): Promise<{
    data: any;
    format: string;
    downloadUrl: string;
  }> {
    try {
      // Get all student data
      const studentData = await this.getAllStudentData(userId);

      // Create export package
      const exportData = {
        user_id: userId,
        export_date: new Date().toISOString(),
        data: studentData,
        privacy_notice:
          "This data export contains your complete academic integrity record.",
      };

      // Generate download URL (would be implemented with actual file storage)
      const downloadUrl = await this.createDataExport(exportData);

      return {
        data: exportData,
        format: "json",
        downloadUrl,
      };
    } catch (error) {
      console.error("Error exporting student data:", error);
      throw new Error("Failed to export student data");
    }
  }

  private createDigitalSignature(data: any): string {
    const message = JSON.stringify(data);
    const hmac = createHmac("sha256", this.INTEGRITY_SALT);
    hmac.update(message);
    return hmac.digest("hex");
  }

  private generateSignatureId(): string {
    return createHash("sha256")
      .update(`${Date.now()}-${Math.random()}`)
      .digest("hex")
      .substring(0, 16);
  }

  private async storeHonorCodeSignature(
    signature: HonorCodeSignature
  ): Promise<void> {
    // Would be implemented with actual database storage
    console.log("Storing honor code signature:", signature.id);
  }

  private async getHonorCodeSignatures(
    userId: string
  ): Promise<HonorCodeSignature[]> {
    // Would be implemented with actual database query
    return [];
  }

  private async getRecentActivity(userId: string): Promise<
    Array<{
      timestamp: string;
      type: string;
      description: string;
      assignment_id?: string;
    }>
  > {
    // Would be implemented with actual database query
    return [
      {
        timestamp: new Date().toISOString(),
        type: "honor_code_signed",
        description: "Signed honor code for new assignment",
        assignment_id: "assignment-123",
      },
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "ai_assistance_used",
        description: "Used conceptual hint for recursion understanding",
        assignment_id: "assignment-123",
      },
    ];
  }

  private async calculateIntegrityScore(userId: string): Promise<{
    overall: number;
    transparency: number;
    compliance: number;
    learning_engagement: number;
  }> {
    // Would be implemented with actual calculation logic
    return {
      overall: 95,
      transparency: 100,
      compliance: 90,
      learning_engagement: 95,
    };
  }

  private async storePrivacySettings(settings: PrivacySettings): Promise<void> {
    // Would be implemented with actual database storage
    console.log("Storing privacy settings for user:", settings.userId);
  }

  private async createShareableReport(
    report: TransparencyReport,
    instructorEmail: string
  ): Promise<string> {
    // Would be implemented with actual sharing mechanism
    return `https://milestack.com/reports/${Date.now()}`;
  }

  private async sendInstructorNotification(
    instructorEmail: string,
    reportUrl: string
  ): Promise<void> {
    // Would be implemented with actual email service
    console.log(
      `Sending notification to ${instructorEmail} with report: ${reportUrl}`
    );
  }

  private async getAllStudentData(userId: string): Promise<any> {
    // Would be implemented with actual data aggregation
    return {
      user_id: userId,
      honor_code_signatures: [],
      transparency_reports: [],
      ai_assistance_usage: [],
      learning_progress: [],
    };
  }

  private async createDataExport(data: any): Promise<string> {
    // Would be implemented with actual file storage
    return `https://milestack.com/exports/${Date.now()}.json`;
  }

  private formatTimeInvestment(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins} minutes`;
  }
}

export const academicIntegrityService = new AcademicIntegrityService();
