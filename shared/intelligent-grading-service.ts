import { aiAgentClient } from "./ai-agent-client";

interface GradingContext {
  assignmentTitle: string;
  assignmentDomain: string;
  milestoneTitle: string;
  competencyRequirement: string;
  expectedConcepts: string[];
  studentAnswer: string;
  attemptNumber: number;
  previousFeedback?: any[];
  userInstructions?: string;
  difficultyLevel?: number;
  userId?: string;
}

interface GradingResult {
  context_relevance_score: number;
  understanding_depth_score: number;
  completeness_score: number;
  final_score: number;
  passed: boolean;
  feedback_type: string;
  concepts_identified: string[];
  detailed_feedback: {
    context_feedback: string;
    understanding_feedback: string;
    completeness_feedback: string;
    suggestions: string[];
    encouragement: string;
  };
  improvement_suggestions: string[];
  learning_indicators: {
    concept_grasp: "developing" | "solid" | "advanced";
    application_skill: "beginner" | "intermediate" | "advanced";
    critical_thinking: "basic" | "developing" | "strong";
  };
  next_steps: string[];
}

export const gradeStudentResponse = async (
  context: GradingContext,
  milestoneId?: string
): Promise<GradingResult> => {
  console.log("Grading student response with AI agent");

  try {
    // Use AI agent for milestone grading
    const gradingResult = await aiAgentClient.gradeMilestone(
      {
        assignmentTitle: context.assignmentTitle,
        milestoneTitle: context.milestoneTitle,
        competencyRequirement: context.competencyRequirement,
        expectedConcepts: context.expectedConcepts,
        studentAnswer: context.studentAnswer,
        attemptNumber: context.attemptNumber,
      },
      context.userId || "milestack-user"
    );

    console.log("AI agent grading completed successfully:", gradingResult);
    return gradingResult;
  } catch (error) {
    console.error("AI agent grading failed, falling back to mock:", error);
    // Fallback to mock grading if AI agent fails
    return getMockGradingResult(context);
  }
};

// Mock grading function until custom AI agent is integrated
const getMockGradingResult = (context: GradingContext): GradingResult => {
  const answerLength = context.studentAnswer.length;
  const hasKeywords = context.expectedConcepts.some((concept) =>
    context.studentAnswer.toLowerCase().includes(concept.toLowerCase())
  );

  // Simple scoring logic
  const contextScore = hasKeywords ? 85 : 45;
  const understandingScore = answerLength > 50 ? 80 : 60;
  const completenessScore = answerLength > 100 ? 75 : 55;

  const finalScore = Math.round(
    contextScore * 0.4 + understandingScore * 0.35 + completenessScore * 0.25
  );

  const passed = finalScore >= 70 && contextScore >= 60;

  return {
    context_relevance_score: contextScore,
    understanding_depth_score: understandingScore,
    completeness_score: completenessScore,
    final_score: finalScore,
    passed,
    feedback_type: passed ? "good_progress" : "needs_improvement",
    concepts_identified: context.expectedConcepts.filter((concept) =>
      context.studentAnswer.toLowerCase().includes(concept.toLowerCase())
    ),
    detailed_feedback: {
      context_feedback: hasKeywords
        ? "Good understanding of the assignment context and requirements."
        : "Please ensure your response addresses the specific assignment requirements.",
      understanding_feedback:
        answerLength > 50
          ? "Your response shows good understanding of the concepts."
          : "Try to provide more detailed explanations to demonstrate your understanding.",
      completeness_feedback:
        answerLength > 100
          ? "Your response covers the key points well."
          : "Consider expanding your response to address all aspects of the milestone.",
      suggestions: passed
        ? ["Great work! You're ready for the next milestone."]
        : [
            "Try to include more specific details about the concepts.",
            "Consider explaining your reasoning step by step.",
          ],
      encouragement: passed
        ? "Excellent progress! Keep up the great work."
        : "Don't give up! Learning takes time and practice.",
    },
    improvement_suggestions: passed
      ? ["Continue building on this understanding for the next milestone."]
      : [
          "Review the assignment requirements more carefully.",
          "Try to connect your answer to the specific concepts mentioned.",
        ],
    learning_indicators: {
      concept_grasp: finalScore >= 80 ? "solid" : "developing",
      application_skill: finalScore >= 75 ? "intermediate" : "beginner",
      critical_thinking: finalScore >= 70 ? "developing" : "basic",
    },
    next_steps: passed
      ? [
          "Move on to the next milestone",
          "Apply this understanding to practice problems",
        ]
      : [
          "Review the assignment materials",
          "Try the milestone again with more detail",
        ],
  };
};

export const getAdaptiveFeedback = (
  gradingResult: GradingResult,
  context: GradingContext
): string[] => {
  // Simple adaptive feedback based on scores
  const feedback = [];

  if (gradingResult.context_relevance_score < 70) {
    feedback.push("Focus on addressing the specific assignment requirements");
  }

  if (gradingResult.understanding_depth_score < 70) {
    feedback.push(
      "Provide more detailed explanations to show your understanding"
    );
  }

  if (gradingResult.completeness_score < 70) {
    feedback.push(
      "Consider covering all aspects of the milestone requirements"
    );
  }

  return feedback;
};

export const generateReflectionPrompts = (
  gradingResult: GradingResult,
  context: GradingContext
): string[] => {
  const prompts = [];

  if (gradingResult.context_relevance_score < 70) {
    prompts.push(
      "What specific aspects of the assignment do you think you might have misunderstood?"
    );
  }

  if (gradingResult.understanding_depth_score < 70) {
    prompts.push(
      "How would you explain this concept to someone who has never seen it before?"
    );
  }

  if (gradingResult.completeness_score < 70) {
    prompts.push(
      "What additional concepts or requirements do you think you should have addressed?"
    );
  }

  if (gradingResult.passed) {
    prompts.push(
      "What was the most challenging part of this milestone for you?"
    );
    prompts.push(
      "How do you plan to apply this understanding to the next milestone?"
    );
  } else {
    prompts.push(
      "What strategies will you use to improve your understanding for the next attempt?"
    );
  }

  return prompts;
};
