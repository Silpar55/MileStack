import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  challengeSubmissions,
  pointTransactions,
  userProgress,
  checkpointAttempts,
  auditLogs,
  challenges,
  pathwayCheckpoints,
  users,
} from "@/shared/schema";
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

    // Fetch recent challenge submissions
    let recentSubmissions: Array<{
      id: string;
      challengeTitle: string | null;
      status: string;
      language: string;
      points: number | null;
      createdAt: Date;
    }> = [];
    try {
      recentSubmissions = await db
        .select({
          id: challengeSubmissions.id,
          challengeTitle: challenges.title,
          status: challengeSubmissions.status,
          language: challengeSubmissions.language,
          points: challenges.points,
          createdAt: challengeSubmissions.submittedAt,
        })
        .from(challengeSubmissions)
        .leftJoin(
          challenges,
          eq(challengeSubmissions.challengeId, challenges.id)
        )
        .where(eq(challengeSubmissions.userId, userId))
        .orderBy(desc(challengeSubmissions.submittedAt))
        .limit(10);
    } catch (error) {
      console.error("Error fetching challenge submissions:", error);
      recentSubmissions = [];
    }

    // Fetch recent point transactions
    let recentPoints: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: Date;
    }> = [];
    try {
      recentPoints = await db
        .select({
          id: pointTransactions.id,
          type: pointTransactions.type,
          amount: pointTransactions.amount,
          description: pointTransactions.reason, // Fixed: use 'reason' field instead of 'description'
          createdAt: pointTransactions.createdAt,
        })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId))
        .orderBy(desc(pointTransactions.createdAt))
        .limit(10);
    } catch (error) {
      console.error("Error fetching point transactions:", error);
      recentPoints = [];
    }

    // Fetch recent checkpoint attempts
    let recentCheckpoints: Array<{
      id: string;
      checkpointTitle: string | null;
      status: string;
      score: number | null;
      createdAt: Date;
    }> = [];
    try {
      recentCheckpoints = await db
        .select({
          id: checkpointAttempts.id,
          checkpointTitle: pathwayCheckpoints.title,
          status: checkpointAttempts.status,
          score: checkpointAttempts.score,
          createdAt: checkpointAttempts.startedAt, // Fixed: use 'startedAt' instead of 'createdAt'
        })
        .from(checkpointAttempts)
        .leftJoin(
          pathwayCheckpoints,
          eq(checkpointAttempts.checkpointId, pathwayCheckpoints.id)
        )
        .where(eq(checkpointAttempts.userId, userId))
        .orderBy(desc(checkpointAttempts.startedAt))
        .limit(5);
    } catch (error) {
      console.error("Error fetching checkpoint attempts:", error);
      recentCheckpoints = [];
    }

    // Fetch recent audit logs (general activity)
    let recentAuditLogs: Array<{
      id: string;
      action: string;
      resource: string | null;
      details: any;
      createdAt: Date;
    }> = [];
    try {
      recentAuditLogs = await db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          resource: auditLogs.resource,
          details: auditLogs.metadata, // Fixed: use 'metadata' field instead of 'details'
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(10);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      recentAuditLogs = [];
    }

    // Transform and combine activities
    const activities: Array<{
      id: string;
      type: string;
      action: string;
      item: string;
      time: Date;
      points: number;
      details: any;
    }> = [];

    // Add challenge submissions
    if (recentSubmissions && Array.isArray(recentSubmissions)) {
      recentSubmissions.forEach((submission) => {
        if (submission && submission.id) {
          activities.push({
            id: submission.id,
            type: "challenge",
            action: submission.status === "passed" ? "Solved" : "Attempted",
            item: submission.challengeTitle || "Challenge",
            time: submission.createdAt,
            points: submission.status === "passed" ? submission.points || 0 : 0,
            details: {
              language: submission.language,
              status: submission.status,
            },
          });
        }
      });
    }

    // Add point transactions
    if (recentPoints && Array.isArray(recentPoints)) {
      recentPoints.forEach((transaction) => {
        if (transaction && transaction.id) {
          activities.push({
            id: transaction.id,
            type: "points",
            action: transaction.type === "earn" ? "Earned" : "Spent",
            item: transaction.description || "Points",
            time: transaction.createdAt,
            points:
              transaction.type === "earn"
                ? transaction.amount
                : -transaction.amount,
            details: {
              type: transaction.type,
              amount: transaction.amount,
            },
          });
        }
      });
    }

    // Add checkpoint attempts
    if (recentCheckpoints && Array.isArray(recentCheckpoints)) {
      recentCheckpoints.forEach((checkpoint) => {
        if (checkpoint && checkpoint.id) {
          activities.push({
            id: checkpoint.id,
            type: "checkpoint",
            action:
              checkpoint.status === "completed" ? "Completed" : "Attempted",
            item: checkpoint.checkpointTitle || "Learning Checkpoint",
            time: checkpoint.createdAt,
            points: checkpoint.status === "completed" ? 50 : 0, // Default points for checkpoints
            details: {
              status: checkpoint.status,
              score: checkpoint.score,
            },
          });
        }
      });
    }

    // Add audit log activities (filter for educational activities only)
    if (recentAuditLogs && Array.isArray(recentAuditLogs)) {
      recentAuditLogs.forEach((log) => {
        if (log && log.id && log.action) {
          // Only include educational activities, exclude login/logout
          if (
            [
              "assignment_created",
              "assignment_submitted",
              "assignment_completed",
              "assignment_deleted",
              "challenge_started",
              "challenge_completed",
              "learning_path_started",
              "learning_path_completed",
              "checkpoint_reached",
              "milestone_achieved",
              "ai_session_start",
              "ai_session_end",
            ].includes(log.action)
          ) {
            activities.push({
              id: log.id,
              type: "educational",
              action: getActionText(log.action),
              item: log.resource || "Activity",
              time: log.createdAt,
              points: getPointsForAction(log.action),
              details: log.details,
            });
          }
        }
      });
    }

    // Sort all activities by time (most recent first)
    activities.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    // Limit to 20 most recent activities
    const recentActivities = activities.slice(0, 20);

    // Generate activity timeline (grouped by day)
    const timeline = generateActivityTimeline(recentActivities);

    return NextResponse.json({
      success: true,
      activities: recentActivities,
      timeline: timeline,
      stats: {
        totalActivities: activities.length,
        challengeSubmissions: recentSubmissions.length,
        pointTransactions: recentPoints.length,
        checkpointAttempts: recentCheckpoints.length,
      },
    });
  } catch (error) {
    console.error("Profile activity fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getActionText(action: string): string {
  const actionMap: Record<string, string> = {
    // Assignment activities
    assignment_created: "Created assignment",
    assignment_submitted: "Submitted assignment",
    assignment_completed: "Completed assignment",
    assignment_deleted: "Deleted assignment",

    // Challenge activities
    challenge_started: "Started challenge",
    challenge_completed: "Completed challenge",

    // Learning path activities
    learning_path_started: "Started learning path",
    learning_path_completed: "Completed learning path",

    // Progress activities
    checkpoint_reached: "Reached checkpoint",
    milestone_achieved: "Achieved milestone",

    // AI assistance
    ai_session_start: "Started AI session",
    ai_session_end: "Ended AI session",
  };
  return actionMap[action] || action;
}

function getPointsForAction(action: string): number {
  const pointsMap: Record<string, number> = {
    // Assignment points
    assignment_created: 10,
    assignment_submitted: 25,
    assignment_completed: 50,
    assignment_deleted: 0,

    // Challenge points
    challenge_started: 5,
    challenge_completed: 100,

    // Learning path points
    learning_path_started: 10,
    learning_path_completed: 200,

    // Progress points
    checkpoint_reached: 25,
    milestone_achieved: 75,

    // AI assistance points (minimal)
    ai_session_start: 0,
    ai_session_end: 0,
  };
  return pointsMap[action] || 0;
}

function generateActivityTimeline(activities: any[]): any[] {
  const timeline: any[] = [];
  const groupedByDate: Record<string, any[]> = {};

  // Group activities by date
  activities.forEach((activity) => {
    const date = new Date(activity.time).toDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(activity);
  });

  // Convert to timeline format
  Object.entries(groupedByDate).forEach(([date, dayActivities]) => {
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let displayDate: string;
    if (dateObj.toDateString() === today.toDateString()) {
      displayDate = "Today";
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      displayDate = "Yesterday";
    } else {
      displayDate = dateObj.toLocaleDateString();
    }

    timeline.push({
      date: displayDate,
      activities: dayActivities.map((activity) => ({
        action: activity.action,
        item: activity.item,
        time: activity.time,
        points: activity.points,
        type: activity.type,
      })),
    });
  });

  return timeline;
}
