import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { fraudDetectionLogs } from "@/shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "7"; // days
    const days = parseInt(timeframe);

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get fraud detection statistics
    const stats = await db
      .select({
        totalDetections: sql<number>`count(*)`,
        highRiskDetections: sql<number>`count(*) filter (where ${fraudDetectionLogs.riskScore} >= 70)`,
        mediumRiskDetections: sql<number>`count(*) filter (where ${fraudDetectionLogs.riskScore} >= 40 and ${fraudDetectionLogs.riskScore} < 70)`,
        lowRiskDetections: sql<number>`count(*) filter (where ${fraudDetectionLogs.riskScore} < 40)`,
        blockedActions: sql<number>`count(*) filter (where ${fraudDetectionLogs.action} = 'block')`,
        flaggedActions: sql<number>`count(*) filter (where ${fraudDetectionLogs.action} = 'flag')`,
        reviewedActions: sql<number>`count(*) filter (where ${fraudDetectionLogs.action} = 'review')`,
        reviewed: sql<number>`count(*) filter (where ${fraudDetectionLogs.reviewed} = true)`,
      })
      .from(fraudDetectionLogs)
      .where(gte(fraudDetectionLogs.createdAt, startDate));

    // Get activity type breakdown
    const activityBreakdown = await db
      .select({
        activityType: fraudDetectionLogs.activityType,
        count: sql<number>`count(*)`,
        avgRiskScore: sql<number>`avg(${fraudDetectionLogs.riskScore})`,
      })
      .from(fraudDetectionLogs)
      .where(gte(fraudDetectionLogs.createdAt, startDate))
      .groupBy(fraudDetectionLogs.activityType);

    // Get risk score distribution
    const riskDistribution = await db
      .select({
        riskRange: sql<string>`case 
          when ${fraudDetectionLogs.riskScore} < 20 then 'Low (0-19)'
          when ${fraudDetectionLogs.riskScore} < 40 then 'Medium-Low (20-39)'
          when ${fraudDetectionLogs.riskScore} < 60 then 'Medium (40-59)'
          when ${fraudDetectionLogs.riskScore} < 80 then 'High (60-79)'
          else 'Critical (80-100)'
        end`,
        count: sql<number>`count(*)`,
      })
      .from(fraudDetectionLogs)
      .where(gte(fraudDetectionLogs.createdAt, startDate)).groupBy(sql`case 
        when ${fraudDetectionLogs.riskScore} < 20 then 'Low (0-19)'
        when ${fraudDetectionLogs.riskScore} < 40 then 'Medium-Low (20-39)'
        when ${fraudDetectionLogs.riskScore} < 60 then 'Medium (40-59)'
        when ${fraudDetectionLogs.riskScore} < 80 then 'High (60-79)'
        else 'Critical (80-100)'
      end`);

    // Get daily detection trends
    const dailyTrends = await db
      .select({
        date: sql<string>`date(${fraudDetectionLogs.createdAt})`,
        count: sql<number>`count(*)`,
        avgRiskScore: sql<number>`avg(${fraudDetectionLogs.riskScore})`,
      })
      .from(fraudDetectionLogs)
      .where(gte(fraudDetectionLogs.createdAt, startDate))
      .groupBy(sql`date(${fraudDetectionLogs.createdAt})`)
      .orderBy(sql`date(${fraudDetectionLogs.createdAt})`);

    return NextResponse.json({
      success: true,
      data: {
        timeframe: `${days} days`,
        statistics: stats[0] || {
          totalDetections: 0,
          highRiskDetections: 0,
          mediumRiskDetections: 0,
          lowRiskDetections: 0,
          blockedActions: 0,
          flaggedActions: 0,
          reviewedActions: 0,
          reviewed: 0,
        },
        activityBreakdown,
        riskDistribution,
        dailyTrends,
      },
    });
  } catch (error) {
    console.error("Fraud detection analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud detection analytics" },
      { status: 500 }
    );
  }
}
