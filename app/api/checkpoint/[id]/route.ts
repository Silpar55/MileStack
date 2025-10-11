import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/shared/db";
import {
  learningMilestones,
  assignmentCheckpointAttempts,
  assignments,
  assignmentAnalysis,
} from "@/shared/schema-assignments";
import { users, userPoints, pointTransactions } from "@/shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  gradeStudentResponse,
  getAdaptiveFeedback,
  generateReflectionPrompts,
} from "@/shared/intelligent-grading-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestoneId = params.id;
    const { answer, timeSpentSeconds, isFinalAttempt } = await request.json();

    // Validate input
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid answer",
          message: "Please provide a valid answer for the milestone.",
        },
        { status: 400 }
      );
    }

    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get milestone details with assignment context
    const milestoneData = await db
      .select({
        milestone: learningMilestones,
        assignment: assignments,
        analysis: assignmentAnalysis,
      })
      .from(learningMilestones)
      .innerJoin(
        assignments,
        eq(learningMilestones.assignmentId, assignments.id)
      )
      .leftJoin(
        assignmentAnalysis,
        eq(assignments.id, assignmentAnalysis.assignmentId)
      )
      .where(eq(learningMilestones.id, milestoneId))
      .limit(1);

    if (!milestoneData[0]) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const { milestone: ms, assignment: assign, analysis } = milestoneData[0];

    // Check if milestone is already completed
    if (ms.status === "completed") {
      return NextResponse.json(
        {
          error: "Milestone already completed",
          message: "You have already successfully completed this milestone.",
          status: "completed",
        },
        { status: 400 }
      );
    }

    // Check if milestone is available for attempts
    if (ms.status === "locked") {
      return NextResponse.json(
        {
          error: "Milestone locked",
          message:
            "This milestone is not yet available. Complete the previous milestone first.",
          milestone_status: ms.status,
        },
        { status: 400 }
      );
    }

    // Get previous attempts for context
    const previousAttempts = await db
      .select()
      .from(assignmentCheckpointAttempts)
      .where(
        and(
          eq(assignmentCheckpointAttempts.userId, session.user.id),
          eq(assignmentCheckpointAttempts.milestoneId, milestoneId)
        )
      )
      .orderBy(desc(assignmentCheckpointAttempts.attemptTimestamp));

    const attemptNumber = previousAttempts.length + 1;

    // Prepare grading context
    const gradingContext = {
      assignmentTitle: assign.title,
      assignmentDomain: "general",
      milestoneTitle: ms.title,
      competencyRequirement: ms.competencyRequirement,
      expectedConcepts: (analysis?.concepts as string[]) || [],
      studentAnswer: answer.trim(),
      attemptNumber,
      previousFeedback: previousAttempts.map((attempt) => ({
        feedback_type: "needs_improvement",
        detailed_feedback: { suggestions: [attempt.feedback || ""] },
        final_score: attempt.aiScore || 0,
      })),
      userInstructions: undefined,
      difficultyLevel: assign.estimatedDifficulty || undefined,
      userId: session.user.id,
    };

    // Grade the response using intelligent grading service
    const gradingResult = await gradeStudentResponse(
      gradingContext,
      milestoneId
    );

    // Get adaptive feedback based on previous attempts
    const adaptiveFeedback = getAdaptiveFeedback(gradingResult, gradingContext);

    // Generate reflection prompts
    const reflectionPrompts = generateReflectionPrompts(
      gradingResult,
      gradingContext
    );

    // Calculate improvement from previous attempt
    let improvementFromPrevious = null;
    let scoreDelta = 0;
    if (previousAttempts.length > 0) {
      const lastAttempt = previousAttempts[0];
      scoreDelta =
        (gradingResult.final_score || 0) - (lastAttempt.aiScore || 0);
      improvementFromPrevious = scoreDelta > 0;
    }

    // Store the attempt with data that matches the schema
    const attemptData = {
      userId: session.user.id,
      milestoneId,
      attemptNumber,
      submittedAnswer: answer.trim(),
      aiScore: gradingResult.final_score as any,
      passed: gradingResult.passed,
      feedback: JSON.stringify(gradingResult.detailed_feedback),
    };

    await db.insert(assignmentCheckpointAttempts).values(attemptData);

    // Handle successful completion
    if (gradingResult.passed) {
      // Award points
      await awardPoints(
        session.user.id,
        ms.pointsReward,
        `Milestone completed: ${ms.title}`
      );

      // Mark milestone as completed
      await db
        .update(learningMilestones)
        .set({
          status: "completed",
        })
        .where(eq(learningMilestones.id, milestoneId));

      // Unlock next milestone if exists
      await db
        .update(learningMilestones)
        .set({ status: "available" })
        .where(
          and(
            eq(learningMilestones.assignmentId, ms.assignmentId),
            eq(learningMilestones.milestoneOrder, ms.milestoneOrder + 1),
            eq(learningMilestones.status, "locked")
          )
        );

      // Get next milestone info for response
      const nextMilestone = await db
        .select()
        .from(learningMilestones)
        .where(
          and(
            eq(learningMilestones.assignmentId, ms.assignmentId),
            eq(learningMilestones.milestoneOrder, ms.milestoneOrder + 1)
          )
        )
        .limit(1);
    }

    // Prepare comprehensive response
    const response = {
      success: true,
      passed: gradingResult.passed,
      scores: {
        context_relevance: gradingResult.context_relevance_score,
        understanding_depth: gradingResult.understanding_depth_score,
        completeness: gradingResult.completeness_score,
        final: gradingResult.final_score,
      },
      feedback: {
        type: gradingResult.feedback_type,
        detailed: gradingResult.detailed_feedback,
        adaptive: adaptiveFeedback,
        reflection_prompts: reflectionPrompts,
        next_steps: gradingResult.next_steps,
      },
      attempt_info: {
        number: attemptNumber,
        total_attempts: attemptNumber,
        improvement_from_previous: improvementFromPrevious,
        score_delta: scoreDelta,
        time_spent_seconds: timeSpentSeconds,
        is_final_attempt: isFinalAttempt || false,
      },
      learning_indicators: gradingResult.learning_indicators,
      concepts_identified: gradingResult.concepts_identified,
      points_earned: gradingResult.passed ? ms.pointsReward : 0,
      milestone_completed: gradingResult.passed,
      next_milestone_unlocked: gradingResult.passed,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Checkpoint processing failed:", error);
    return NextResponse.json(
      {
        error: "Grading failed",
        message:
          "An error occurred while processing your response. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to award points
async function awardPoints(userId: string, points: number, reason: string) {
  try {
    // Update user points
    await db
      .update(userPoints)
      .set({
        currentBalance: sql`${userPoints.currentBalance} + ${points}`,
        totalEarned: sql`${userPoints.totalEarned} + ${points}`,
        dailyEarned: sql`${userPoints.dailyEarned} + ${points}`,
        lastEarnedDate: sql`now()`,
      })
      .where(eq(userPoints.userId, userId));

    // Record point transaction
    await db.insert(pointTransactions).values({
      userId,
      amount: points,
      type: "earned",
      category: "milestone_completion",
      reason,
      sourceId: userId, // Could be milestone ID in the future
      sourceType: "milestone",
      verified: true,
    });
  } catch (error) {
    console.error("Failed to award points:", error);
    // Don't throw error - points are secondary to milestone completion
  }
}

// GET endpoint to retrieve milestone details and previous attempts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const milestoneId = params.id;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get milestone details
    const milestoneData = await db
      .select({
        milestone: learningMilestones,
        assignment: assignments,
        analysis: assignmentAnalysis,
      })
      .from(learningMilestones)
      .innerJoin(
        assignments,
        eq(learningMilestones.assignmentId, assignments.id)
      )
      .leftJoin(
        assignmentAnalysis,
        eq(assignments.id, assignmentAnalysis.assignmentId)
      )
      .where(eq(learningMilestones.id, milestoneId))
      .limit(1);

    if (!milestoneData[0]) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const { milestone: ms, assignment: assign, analysis } = milestoneData[0];

    // Get user's previous attempts
    const previousAttempts = await db
      .select()
      .from(assignmentCheckpointAttempts)
      .where(
        and(
          eq(assignmentCheckpointAttempts.userId, session.user.id),
          eq(assignmentCheckpointAttempts.milestoneId, milestoneId)
        )
      )
      .orderBy(desc(assignmentCheckpointAttempts.attemptTimestamp));

    // Check if milestone is locked after completion
    const isLocked = ms.status === "completed";

    return NextResponse.json({
      milestone: {
        id: ms.id,
        title: ms.title,
        description: ms.description,
        competency_requirement: ms.competencyRequirement,
        points_reward: ms.pointsReward,
        status: ms.status,
        milestone_order: ms.milestoneOrder,
      },
      assignment: {
        id: assign.id,
        title: assign.title,
        domain: "general",
        concepts: analysis?.concepts,
      },
      attempts: {
        total: previousAttempts.length,
        attempts: previousAttempts.map((attempt) => ({
          attempt_number: attempt.attemptNumber,
          submitted_answer: attempt.submittedAnswer,
          scores: {
            context_relevance: 0,
            understanding_depth: 0,
            completeness: 0,
            final: attempt.aiScore || 0,
          },
          passed: attempt.passed,
          feedback_type: "needs_improvement",
          detailed_feedback: { suggestions: [attempt.feedback || ""] },
          concepts_identified: [],
          attempt_timestamp: attempt.attemptTimestamp,
          time_spent_seconds: 0,
          improvement_from_previous: false,
          score_delta: 0,
        })),
      },
      can_attempt: !isLocked && ms.status !== "locked",
      is_completed: ms.status === "completed",
    });
  } catch (error) {
    console.error("Failed to get milestone details:", error);
    return NextResponse.json(
      { error: "Failed to retrieve milestone" },
      { status: 500 }
    );
  }
}
