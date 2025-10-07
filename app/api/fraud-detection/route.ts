import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { fraudDetectionLogs, users } from "@/shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereCondition;
    if (userId) {
      whereCondition = eq(fraudDetectionLogs.userId, userId);
    }

    const logs = await db
      .select()
      .from(fraudDetectionLogs)
      .where(whereCondition)
      .orderBy(desc(fraudDetectionLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get user details for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, log.userId))
          .limit(1);

        return {
          ...log,
          user: user[0] || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: logsWithUsers,
    });
  } catch (error) {
    console.error("Fraud detection logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud detection logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, action, reviewedBy } = body;

    if (!logId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validActions = ["none", "flag", "block", "review"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await db
      .update(fraudDetectionLogs)
      .set({
        action,
        reviewed: true,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || null,
      })
      .where(eq(fraudDetectionLogs.id, logId));

    return NextResponse.json({
      success: true,
      message: "Fraud detection log updated successfully",
    });
  } catch (error) {
    console.error("Fraud detection log update error:", error);
    return NextResponse.json(
      { error: "Failed to update fraud detection log" },
      { status: 500 }
    );
  }
}
