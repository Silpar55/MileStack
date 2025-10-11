import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  pathwayCheckpoints,
  checkpointAttempts,
  competencyAssessments,
} from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { competencyAssessmentService } from "@/shared/competency-assessment";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const attemptId = searchParams.get("attemptId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get checkpoint details
    const checkpoint = await db
      .select()
      .from(pathwayCheckpoints)
      .where(eq(pathwayCheckpoints.id, params.id))
      .limit(1);

    if (checkpoint.length === 0) {
      return NextResponse.json(
        { error: "Checkpoint not found" },
        { status: 404 }
      );
    }

    // Get specific attempt if attemptId provided, otherwise get latest
    let attempt;
    if (attemptId) {
      const attempts = await db
        .select()
        .from(checkpointAttempts)
        .where(
          and(
            eq(checkpointAttempts.id, attemptId),
            eq(checkpointAttempts.userId, userId)
          )
        )
        .limit(1);
      attempt = attempts[0];
    } else {
      const attempts = await db
        .select()
        .from(checkpointAttempts)
        .where(
          and(
            eq(checkpointAttempts.checkpointId, params.id),
            eq(checkpointAttempts.userId, userId)
          )
        )
        .orderBy(desc(checkpointAttempts.attemptNumber))
        .limit(1);
      attempt = attempts[0];
    }

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get competency assessment
    const assessment = await db
      .select()
      .from(competencyAssessments)
      .where(
        and(
          eq(competencyAssessments.checkpointId, params.id),
          eq(competencyAssessments.userId, userId)
        )
      )
      .orderBy(desc(competencyAssessments.submittedAt))
      .limit(1);

    // Get all attempts for comparison
    const allAttempts = await db
      .select()
      .from(checkpointAttempts)
      .where(
        and(
          eq(checkpointAttempts.checkpointId, params.id),
          eq(checkpointAttempts.userId, userId)
        )
      )
      .orderBy(desc(checkpointAttempts.attemptNumber));

    // Generate personalized feedback if assessment exists
    let personalizedFeedback = "";
    if (assessment.length > 0) {
      try {
        personalizedFeedback =
          await competencyAssessmentService.generatePersonalizedFeedback(
            {
              score: assessment[0].overallScore || 0,
              comprehensionScore: assessment[0].comprehensionScore || 0,
              accuracyScore: assessment[0].accuracyScore || 0,
              feedback: assessment[0].feedback || "",
              strengths: [],
              weaknesses: [],
              recommendations: [],
              isPassed: assessment[0].isPassed || false,
              detailedAnalysis: assessment[0].aiAnalysis || {},
              originalityScore: 0,
              plagiarismDetected: false,
              plagiarismScore: 0,
            },
            {
              // Student profile would come from user data
              experienceLevel: "intermediate",
              learningStyle: "visual",
              strengths: [],
              weaknesses: [],
            },
            ["master-programming-concepts", "improve-problem-solving"]
          );
      } catch (error) {
        console.error("Personalized feedback generation error:", error);
        personalizedFeedback = assessment[0].feedback || "";
      }
    }

    // Calculate performance metrics
    const performanceMetrics = {
      currentScore: attempt.score || 0,
      bestScore: Math.max(...allAttempts.map((a) => a.score || 0)),
      averageScore:
        allAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
        allAttempts.length,
      improvement:
        allAttempts.length > 1
          ? (attempt.score || 0) - (allAttempts[1]?.score || 0)
          : 0,
      timeSpent: attempt.timeSpent || 0,
      totalAttempts: allAttempts.length,
      maxAttempts: checkpoint[0].maxAttempts,
    };

    // Generate recommendations for improvement
    const recommendations = generateRecommendations(
      attempt,
      assessment[0],
      allAttempts,
      checkpoint[0]
    );

    return NextResponse.json({
      success: true,
      data: {
        checkpoint: {
          id: checkpoint[0].id,
          title: checkpoint[0].title,
          type: checkpoint[0].type,
          points: checkpoint[0].points,
          passingScore: checkpoint[0].passingScore,
        },
        attempt: {
          id: attempt.id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          pointsEarned: attempt.pointsEarned,
          timeSpent: attempt.timeSpent,
          status: attempt.status,
          feedback: attempt.feedback,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
        },
        assessment: assessment[0] || null,
        personalizedFeedback,
        performanceMetrics,
        recommendations,
        canRetry: allAttempts.length < (checkpoint[0]?.maxAttempts || 3),
        isPassed: attempt.status === "completed",
        nextSteps: generateNextSteps(attempt, checkpoint[0]),
      },
    });
  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  attempt: any,
  assessment: any,
  allAttempts: any[],
  checkpoint: any
): string[] {
  const recommendations: string[] = [];

  if (attempt.score < 80) {
    recommendations.push(
      "Review the fundamental concepts covered in this checkpoint"
    );
  }

  if (attempt.timeSpent > (checkpoint.timeLimit || 30)) {
    recommendations.push("Practice time management to improve efficiency");
  }

  if (allAttempts.length > 1) {
    const improvement = attempt.score - (allAttempts[1]?.score || 0);
    if (improvement > 0) {
      recommendations.push(
        "Great improvement! Continue building on this progress"
      );
    } else if (improvement < 0) {
      recommendations.push(
        "Consider reviewing the material before attempting again"
      );
    }
  }

  if (assessment?.aiAnalysis?.missingConcepts?.length > 0) {
    recommendations.push(
      `Focus on these concepts: ${assessment.aiAnalysis.missingConcepts.join(
        ", "
      )}`
    );
  }

  if (assessment?.aiAnalysis?.misconceptions?.length > 0) {
    recommendations.push(
      `Clarify these misconceptions: ${assessment.aiAnalysis.misconceptions.join(
        ", "
      )}`
    );
  }

  return recommendations;
}

function generateNextSteps(attempt: any, checkpoint: any): string[] {
  const nextSteps: string[] = [];

  if (attempt.status === "completed") {
    nextSteps.push("Proceed to the next checkpoint in the pathway");
    nextSteps.push("Review the concepts you mastered in this checkpoint");
  } else {
    nextSteps.push("Review the feedback and try again");
    nextSteps.push("Consider seeking additional help if needed");
  }

  return nextSteps;
}
