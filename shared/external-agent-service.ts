/**
 * External AI Agent Service for Intelligent Grading
 * 
 * This service handles communication with an external AI agent for grading
 * student responses. It provides a secure interface with proper error handling
 * and fallback mechanisms.
 */

// Interfaces for type safety
interface ExternalAgentResponse {
  response?: string | object;
  message?: string;
  content?: string;
  [key: string]: any;
}

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
  improvement_suggestions?: string[];
  learning_indicators?: {
    concept_grasp: "developing" | "solid" | "advanced";
    application_skill: "beginner" | "intermediate" | "advanced";
    critical_thinking: "basic" | "developing" | "strong";
  };
  next_steps?: string[];
}

/**
 * Generate a static session ID for a milestone
 * This ensures consistent conversation context for each milestone
 */
const getSessionId = (milestoneId: string): string => {
  return `milestone-${milestoneId}-session`;
};

/**
 * Grade a student response using the external AI agent
 * 
 * @param context - The grading context containing assignment and student information
 * @param milestoneId - The ID of the milestone for session management
 * @returns Promise<GradingResult> - The grading result from the external agent
 */
export const gradeWithExternalAgent = async (
  context: GradingContext,
  milestoneId: string
): Promise<GradingResult> => {
  const sessionId = getSessionId(milestoneId);

  // Construct the grading prompt with all necessary context
  const gradingPrompt = `
You are an expert educational evaluator with perfect judgment. Your job is to grade student responses with precise context awareness and fair scoring.

ASSIGNMENT CONTEXT:
Assignment Title: "${context.assignmentTitle}"
Assignment Domain: "${context.assignmentDomain}"
Milestone Question: "${context.competencyRequirement}"
Expected Key Concepts: ${JSON.stringify(context.expectedConcepts)}
Attempt Number: ${context.attemptNumber}

STUDENT ANSWER TO EVALUATE:
"${context.studentAnswer}"

GRADING INSTRUCTIONS:

STEP 1 - CONTEXT RELEVANCE ANALYSIS (0-100 points):
- Does the student's answer address the SAME DOMAIN/TECHNOLOGY as the assignment?
- EXAMPLES OF SCORING:
  * Assignment about SwiftUI + Answer mentions SwiftUI/iOS/mobile development = 85-100 points
  * Assignment about SwiftUI + Answer mentions React/web development = 5-25 points
  * Assignment about C++ banking + Answer mentions Java/Python programming = 40-60 points
  * Assignment about C++ banking + Answer mentions cooking recipes = 0-10 points

STEP 2 - UNDERSTANDING DEPTH ANALYSIS (0-100 points):
- IF context relevance >= 60, evaluate how well student understands what they need to do
- ACCEPT BOTH approaches as equally valid:
  * Practical: "I need to create a SwiftUI app with navigation and data binding"
  * Theoretical: "SwiftUI uses declarative syntax with state management through @State and @Binding"
  * Mixed: "I need to build an app using SwiftUI's declarative patterns and state binding"
- SCORE based on clarity and accuracy of their understanding
- Length doesn't matter - short clear answers score as well as detailed ones

STEP 3 - COMPLETENESS ANALYSIS (0-100 points):
- Are the key assignment requirements/concepts addressed?
- Does the answer show awareness of main deliverables?
- Don't penalize for missing minor details if core understanding is present

STEP 4 - CALCULATE FINAL SCORE:
final_score = (context_relevance × 0.5) + (understanding_depth × 0.3) + (completeness × 0.2)
passed = final_score >= 70 AND context_relevance >= 60

STEP 5 - DETERMINE FEEDBACK TYPE:
- "excellent": final_score >= 85
- "good_progress": final_score 70-84
- "needs_improvement": final_score 50-69
- "context_mismatch": context_relevance < 60

CRITICAL RULES:
1. If student talks about the SAME technology/domain as assignment, context_relevance should be 70-100
2. If student talks about DIFFERENT technology/domain, context_relevance should be 0-40
3. Both practical and theoretical answers are equally acceptable if context-relevant
4. Be generous with scoring when context is correct - we want to encourage learning
5. Provide specific, encouraging feedback that references the actual assignment

RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
{
  "context_relevance_score": 85,
  "understanding_depth_score": 78,
  "completeness_score": 72,
  "final_score": 79,
  "passed": true,
  "feedback_type": "good_progress",
  "concepts_identified": ["swiftui", "navigation", "state management"],
  "detailed_feedback": {
    "context_feedback": "Perfect! Your answer clearly addresses the SwiftUI assignment requirements.",
    "understanding_feedback": "You show good understanding of what needs to be built with SwiftUI.",
    "completeness_feedback": "You covered the main requirements. Consider mentioning data binding as well.",
    "suggestions": [
      "Great job identifying SwiftUI as the key technology",
      "Your understanding of navigation is solid",
      "Try to mention state management concepts like @State or @Binding"
    ],
    "encouragement": "Excellent work! You clearly understand the SwiftUI assignment scope."
  }
}

EXAMPLES FOR CALIBRATION:

EXAMPLE 1 - SwiftUI Assignment:
Student Answer: "I need to create a mobile app using SwiftUI with navigation between screens"
Expected Scores: context_relevance=90, understanding_depth=85, completeness=75, final_score=85, passed=true

EXAMPLE 2 - SwiftUI Assignment:
Student Answer: "I will use React and JavaScript to build the user interface"
Expected Scores: context_relevance=15, understanding_depth=0, completeness=10, final_score=10, passed=false

EXAMPLE 3 - C++ Banking Assignment:
Student Answer: "I need to create bank account classes with inheritance in C++"
Expected Scores: context_relevance=95, understanding_depth=90, completeness=85, final_score=92, passed=true

Remember: BE GENEROUS when context is correct. Students should succeed when they demonstrate relevant understanding, whether practical or theoretical. Focus on encouraging learning while maintaining academic standards.
`;

  try {
    const response = await fetch(
      "https://agent-prod.studio.lyzr.ai/v3/inference/chat/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXTERNAL_AGENT_API_KEY || "",
        },
        body: JSON.stringify({
          user_id: "asilva-juarez@myseneca.ca",
          agent_id: "68e80d375a7abf50752754a3",
          session_id: sessionId,
          message: gradingPrompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `External agent API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Parse the response and extract the grading result
    // The response structure might vary, so we need to handle it appropriately
    let gradingResult: GradingResult;

    // Try different response structures
    if (data.response && typeof data.response === "string") {
      // If response is a string, try to parse it as JSON
      try {
        gradingResult = JSON.parse(data.response);
        // Successfully parsed JSON from string response
      } catch (parseError) {
        console.error(
          "Failed to parse JSON from external agent response:",
          parseError
        );
        throw new Error("Invalid JSON response from external agent");
      }
    } else if (data.response && typeof data.response === "object") {
      // If response is already an object, use it directly
      gradingResult = data.response;
      // Using object response directly
    } else if (data.message && typeof data.message === "string") {
      // Try parsing from message field
      try {
        gradingResult = JSON.parse(data.message);
        // Successfully parsed JSON from message field
      } catch (parseError) {
        console.error("Failed to parse JSON from message field:", parseError);
        throw new Error("Invalid JSON response from external agent");
      }
    } else if (data.content && typeof data.content === "string") {
      // Try parsing from content field
      try {
        gradingResult = JSON.parse(data.content);
        // Successfully parsed JSON from content field
      } catch (parseError) {
        console.error("Failed to parse JSON from content field:", parseError);
        throw new Error("Invalid JSON response from external agent");
      }
    } else if (typeof data === "object" && data.context_relevance_score) {
      // If the response itself is the grading result
      gradingResult = data;
      // Using response as grading result directly
    } else {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from external agent");
    }

    // Validate the response structure
    const validationErrors = [];
    
    if (typeof gradingResult.context_relevance_score !== "number") {
      validationErrors.push("Missing or invalid context_relevance_score");
    }
    if (typeof gradingResult.understanding_depth_score !== "number") {
      validationErrors.push("Missing or invalid understanding_depth_score");
    }
    if (typeof gradingResult.completeness_score !== "number") {
      validationErrors.push("Missing or invalid completeness_score");
    }
    if (typeof gradingResult.final_score !== "number") {
      validationErrors.push("Missing or invalid final_score");
    }
    if (typeof gradingResult.passed !== "boolean") {
      validationErrors.push("Missing or invalid passed field");
    }
    if (!gradingResult.feedback_type) {
      validationErrors.push("Missing feedback_type");
    }
    if (!Array.isArray(gradingResult.concepts_identified)) {
      validationErrors.push("Missing or invalid concepts_identified");
    }
    if (!gradingResult.detailed_feedback) {
      validationErrors.push("Missing detailed_feedback");
    }

    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      console.error(
        "Received grading result:",
        JSON.stringify(gradingResult, null, 2)
      );
      throw new Error(
        `Invalid grading result structure from external agent: ${validationErrors.join(", ")}`
      );
    }

    // Ensure all required fields are present with defaults if needed
    const completeGradingResult: GradingResult = {
      ...gradingResult,
      improvement_suggestions: gradingResult.improvement_suggestions || [
        "Continue building on your understanding",
        "Practice implementing the concepts you've learned",
        "Consider how different components interact",
      ],
      learning_indicators: gradingResult.learning_indicators || {
        concept_grasp:
          gradingResult.final_score >= 80 ? "solid" : "developing",
        application_skill:
          gradingResult.final_score >= 80 ? "intermediate" : "beginner",
        critical_thinking:
          gradingResult.final_score >= 70 ? "developing" : "basic",
      },
      next_steps: gradingResult.next_steps || [
        gradingResult.passed
          ? "Great job! Move on to the next milestone."
          : "Review the feedback and try again",
        "Apply what you've learned to practical examples",
        "Consider how this relates to real-world applications",
      ],
    };

    return completeGradingResult;
  } catch (error) {
    console.error("External agent grading failed:", error);
    throw error;
  }
};