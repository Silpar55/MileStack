import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  competencyAssessments,
  pathwayCheckpoints,
  learningPathways,
} from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's competency assessments
    const assessments = await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId))
      .orderBy(desc(competencyAssessments.submittedAt))
      .limit(limit);

    // Get checkpoint and pathway details for each assessment
    const assessmentData = [];

    for (const assessment of assessments) {
      const checkpoint = await db
        .select()
        .from(pathwayCheckpoints)
        .where(eq(pathwayCheckpoints.id, assessment.checkpointId))
        .limit(1);

      if (checkpoint.length > 0) {
        const pathway = await db
          .select()
          .from(learningPathways)
          .where(eq(learningPathways.id, checkpoint[0].pathwayId))
          .limit(1);

        if (pathway.length > 0) {
          assessmentData.push({
            id: assessment.id,
            pathwayTitle: pathway[0].title,
            checkpointTitle: checkpoint[0].title,
            type: assessment.assessmentType,
            score: assessment.overallScore || 0,
            comprehensionScore: assessment.comprehensionScore || 0,
            accuracyScore: assessment.accuracyScore || 0,
            isPassed: assessment.isPassed || false,
            submittedAt: assessment.submittedAt,
            feedback: assessment.feedback,
            pathwayId: pathway[0].id,
            checkpointId: checkpoint[0].id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: assessmentData,
    });
  } catch (error) {
    console.error("Dashboard assessments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard assessments" },
      { status: 500 }
    );
  }
}
