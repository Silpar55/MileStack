import { getGeminiModel } from "./gemini-client";
import { gradeWithExternalAgent } from "./external-agent-service";

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
  // Try external agent first if milestoneId is provided
  if (milestoneId) {
    try {
      const externalResult = await gradeWithExternalAgent(
        context as any,
        milestoneId
      );
      return externalResult;
    } catch (error) {
      console.error("External agent grading failed:", error);
      // Fall through to Gemini
    }
  }

  // Fallback to Gemini
  try {
    // Falling back to Gemini for grading
    const model = getGeminiModel();

    // Build progressive feedback context
    const previousFeedbackContext =
      context.previousFeedback && context.previousFeedback.length > 0
        ? `\nPREVIOUS ATTEMPTS & FEEDBACK:\n${context.previousFeedback
            .map(
              (fb, idx) =>
                `Attempt ${idx + 1}: ${fb.feedback_type} - ${
                  fb.detailed_feedback?.suggestions?.join(", ") ||
                  "No specific feedback"
                }`
            )
            .join("\n")}`
        : "";

    const userInstructionsContext = context.userInstructions
      ? `\nSPECIAL USER INSTRUCTIONS:\n${context.userInstructions}`
      : "";

    const difficultyContext = context.difficultyLevel
      ? `\nDIFFICULTY LEVEL: ${context.difficultyLevel}/10`
      : "";

    const gradingPrompt = `
You are an expert educational evaluator with perfect judgment. Your job is to grade student responses with precise context awareness and fair scoring.

ASSIGNMENT CONTEXT:
Assignment Title: "${context.assignmentTitle}"
Assignment Domain: "${context.assignmentDomain}"  
Milestone Question: "${context.competencyRequirement}"
Expected Key Concepts: ${JSON.stringify(context.expectedConcepts)}
Attempt Number: ${
      context.attemptNumber
    }${difficultyContext}${userInstructionsContext}${previousFeedbackContext}

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
  },
  "improvement_suggestions": [
    "Consider how different components will interact with each other",
    "Think about error handling and edge cases",
    "Consider scalability and performance implications"
  ],
  "learning_indicators": {
    "concept_grasp": "solid",
    "application_skill": "intermediate", 
    "critical_thinking": "developing"
  },
  "next_steps": [
    "Start implementing the authentication system",
    "Create a basic component structure",
    "Test your understanding with a simple prototype"
  ]
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

    const result = await model.generateContent(gradingPrompt);
    const response = await result.response;
    const gradingText = response.text().trim();

    // Clean up the response text
    let jsonText = gradingText;
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0];
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0];
    }

    jsonText = jsonText.trim();

    const gradingResult: GradingResult = JSON.parse(jsonText);

    // Validate the result
    if (!validateGradingResult(gradingResult)) {
      throw new Error("Invalid grading result format");
    }

    return gradingResult;
  } catch (error) {
    console.error("Gemini grading failed:", error);
    // Final fallback to mock grading
    return getContextAwareMockGrading(context);
  }
};

const validateGradingResult = (result: any): result is GradingResult => {
  return (
    typeof result.context_relevance_score === "number" &&
    typeof result.understanding_depth_score === "number" &&
    typeof result.completeness_score === "number" &&
    typeof result.final_score === "number" &&
    typeof result.passed === "boolean" &&
    typeof result.feedback_type === "string" &&
    Array.isArray(result.concepts_identified) &&
    result.detailed_feedback &&
    typeof result.detailed_feedback.context_feedback === "string"
  );
};

const getContextAwareMockGrading = (context: GradingContext): GradingResult => {
  // Enhanced mock grading with better context awareness
  const studentAnswer = context.studentAnswer.toLowerCase();
  const domain = context.assignmentDomain?.toLowerCase();
  const expectedConcepts =
    context.expectedConcepts?.map((c) => c.toLowerCase()) || [];
  const assignmentTitle = context.assignmentTitle?.toLowerCase() || "";

  // Check context relevance with more sophisticated logic
  let contextRelevance = 0;
  let contextFeedback = "";

  // First, check for completely wrong topics that should get very low scores
  const wrongTopics = {
    // Note: Swift/SwiftUI are not included here as they can be relevant to many assignments
    android: ["android", "kotlin", "java", "mobile", "app"],

    // Only flag very specific data structure topics as wrong when assignment is clearly about something else
    data_structures_specific: [
      "binary search tree",
      "avl tree",
      "red black tree",
      "graph traversal",
      "dijkstra algorithm",
      "breadth first search",
      "depth first search",
      "heap sort",
      "merge sort",
      "quick sort",
    ],

    // Web development when assignment is about something else
    web_development: [
      "react",
      "html",
      "css",
      "javascript",
      "web",
      "frontend",
      "backend",
      "api",
      "database",
      "node",
      "express",
    ],

    // Backend/Server topics when assignment is about something else
    backend: [
      "server",
      "database",
      "sql",
      "api",
      "backend",
      "express",
      "node",
      "python",
      "java",
      "spring",
    ],

    // Machine Learning when assignment is about something else
    machine_learning: [
      "machine learning",
      "ai",
      "neural",
      "model",
      "training",
      "data",
      "algorithm",
      "prediction",
    ],
  };

  // Check if student is talking about completely wrong topics
  const studentAnswerLower = studentAnswer.toLowerCase();
  let wrongTopicDetected = false;
  let wrongTopicType = "";

  // Create domain mapping for better matching
  const domainMappings = {
    swiftui: ["swiftui", "swift", "ios", "mobile", "mobile_development"],
    swift: ["swiftui", "swift", "ios", "mobile", "mobile_development"], // Add swift mapping
    mobile_development: [
      "swiftui",
      "swift",
      "ios",
      "mobile",
      "android",
      "kotlin",
    ],
    web_development: [
      "web",
      "react",
      "html",
      "css",
      "javascript",
      "frontend",
      "backend",
    ],
    data_structures: [
      "data_structures",
      "algorithms",
      "data_structures_algorithms",
    ],
    backend: ["backend", "server", "api", "database"],
    machine_learning: [
      "machine_learning",
      "ai",
      "ml",
      "artificial_intelligence",
    ],
  };

  // Find the correct domain category
  const actualDomain = domainMappings[domain as keyof typeof domainMappings]
    ? domain
    : Object.keys(domainMappings).find((key) =>
        domainMappings[key as keyof typeof domainMappings].includes(domain)
      ) || domain;

  // Special case: if domain is "general", be very generous with programming-related answers
  if (domain === "general" || domain === "General") {
    const programmingKeywords = [
      "program",
      "code",
      "app",
      "application",
      "software",
      "function",
      "class",
      "struct",
      "variable",
      "loop",
      "if",
      "else",
      "return",
      "create",
      "build",
      "develop",
      "implement",
      "design",
      "algorithm",
      "data",
      "user",
      "interface",
      "swift",
      "swiftui",
      "ios",
      "mobile",
      "bank",
      "account",
      "transaction",
      "finance",
      "money",
      "spending",
      "report",
      "track",
      "manage",
    ];

    const hasProgrammingKeywords = programmingKeywords.some((keyword) =>
      studentAnswerLower.includes(keyword.toLowerCase())
    );

    if (hasProgrammingKeywords && studentAnswer.length > 50) {
      // Skip off-topic detection for programming-related answers when domain is general
      // Set a flag to bypass the off-topic detection loop
      wrongTopicDetected = false;
    }
  }

  for (const [topicType, keywords] of Object.entries(wrongTopics)) {
    // Check if this topic type is NOT related to the assignment domain
    const isWrongTopic =
      topicType !== actualDomain &&
      !domainMappings[actualDomain as keyof typeof domainMappings]?.includes(
        topicType
      ) &&
      !domainMappings[topicType as keyof typeof domainMappings]?.includes(
        actualDomain
      );

    if (isWrongTopic) {
      const wrongMatches = keywords.filter((keyword) =>
        studentAnswerLower.includes(keyword.toLowerCase())
      );

      if (wrongMatches.length >= 3) {
        // If 3+ keywords from wrong topic are found (very conservative detection)
        wrongTopicDetected = true;
        wrongTopicType = topicType;
        break;
      }
    }
  }

  if (wrongTopicDetected) {
    contextRelevance = 5; // Very low score for completely wrong topic
    contextFeedback = `Your response is about ${wrongTopicType.replace(
      "_",
      " "
    )} which is completely unrelated to this assignment. Please focus on the correct topic.`;
    // Off-topic detected - using fallback grading

    return {
      context_relevance_score: contextRelevance,
      understanding_depth_score: 10,
      completeness_score: 5,
      final_score: contextRelevance,
      passed: false,
      feedback_type: "completely_off_topic",
      concepts_identified: [],
      detailed_feedback: {
        context_feedback: contextFeedback,
        understanding_feedback: "Please focus on the correct assignment topic.",
        completeness_feedback:
          "Your response is about the wrong subject entirely.",
        suggestions: [
          "You are discussing a completely wrong topic. This assignment is not about the topic you described. Please focus on the correct assignment subject.",
        ],
        encouragement:
          "Don't worry - just make sure you understand what this assignment is asking for and try again!",
      },
      improvement_suggestions: [
        "Read the assignment instructions carefully",
        "Focus on the specific topic and domain mentioned",
        "Ask for clarification if you're unsure about the requirements",
      ],
      learning_indicators: {
        concept_grasp: "developing",
        application_skill: "beginner",
        critical_thinking: "basic",
      },
      next_steps: [
        "Review the assignment requirements carefully",
        "Focus on the correct topic and domain",
        "Try again with a response about the right subject",
      ],
    };
  } else {
    console.log(
      `[AI Grading] No off-topic detected for domain: ${domain} (actual: ${actualDomain})`
    );
    if (domain === "web_development") {
      const webKeywords = [
        "web",
        "react",
        "html",
        "css",
        "javascript",
        "frontend",
        "backend",
        "api",
        "database",
      ];
      const webMatches = webKeywords.filter((keyword) =>
        studentAnswerLower.includes(keyword.toLowerCase())
      );

      if (webMatches.length > 0) {
        contextRelevance = Math.min(85 + webMatches.length * 2, 100); // More generous scoring
        contextFeedback = `Excellent! You're addressing web development concepts. Found ${webMatches.length} relevant terms.`;
      } else {
        contextRelevance = 15;
        contextFeedback =
          "Your response is not about web development. Please focus on the correct topic for this assignment.";
      }
    } else if (
      domain === "swiftui" ||
      domain === "swift" ||
      domain === "mobile_development"
    ) {
      const swiftUIKeywords = [
        "swiftui",
        "swift",
        "ios",
        "mobile",
        "app",
        "xcode",
        "ui",
        "interface",
        "view",
        "navigation",
        "button",
        "text",
        "image",
        "list",
        "vstack",
        "hstack",
        "zstack",
        "command",
        "line",
        "class",
        "struct",
        "enum",
        "protocol",
        "function",
        "variable",
        "constant",
        "optional",
        "bank",
        "account",
        "transaction",
        "finance",
        "report",
      ];
      const swiftUIMatches = swiftUIKeywords.filter((keyword) =>
        studentAnswerLower.includes(keyword.toLowerCase())
      );

      if (swiftUIMatches.length > 0) {
        contextRelevance = Math.min(85 + swiftUIMatches.length * 2, 100); // More generous scoring
        contextFeedback = `Excellent! You're addressing SwiftUI/mobile development concepts. Found ${swiftUIMatches.length} relevant terms.`;
      } else {
        contextRelevance = 15;
        contextFeedback =
          "Your response is not about SwiftUI/mobile development. Please focus on the correct topic for this assignment.";
      }
    } else if (domain === "data_structures") {
      const dsKeywords = [
        "array",
        "list",
        "tree",
        "graph",
        "algorithm",
        "complexity",
        "sorting",
        "searching",
      ];
      const dsMatches = dsKeywords.filter((keyword) =>
        studentAnswer.includes(keyword)
      );

      if (dsMatches.length > 0) {
        contextRelevance = Math.min(85 + dsMatches.length * 2, 100); // More generous scoring
        contextFeedback = `Excellent! You're addressing data structures concepts. Found ${dsMatches.length} relevant terms.`;
      } else {
        contextRelevance = 10;
        contextFeedback =
          "Your response is not about data structures. Please focus on the correct topic for this assignment.";
      }
    } else {
      // Generic context checking - be very generous for programming-related responses
      const programmingKeywords = [
        "program",
        "code",
        "app",
        "application",
        "software",
        "function",
        "class",
        "struct",
        "variable",
        "loop",
        "if",
        "else",
        "return",
        "create",
        "build",
        "develop",
        "implement",
        "design",
        "algorithm",
        "data",
        "user",
        "interface",
      ];

      const hasProgrammingKeywords = programmingKeywords.some((keyword) =>
        studentAnswerLower.includes(keyword.toLowerCase())
      );

      if (studentAnswer.length > 50 && hasProgrammingKeywords) {
        contextRelevance = 90; // Very generous for programming-related answers
        contextFeedback =
          "Excellent! Your answer clearly addresses programming concepts and shows understanding of the assignment.";
      } else if (studentAnswer.length > 50) {
        contextRelevance = 80; // Still generous for longer answers
        contextFeedback =
          "Your answer seems relevant to the assignment context.";
      } else {
        contextRelevance = 15;
        contextFeedback =
          "Your response is too brief or off-topic. Please provide a detailed explanation of the correct assignment topic.";
      }
    }

    // Check concept coverage - be more generous
    const conceptsFound = expectedConcepts.filter((concept) =>
      studentAnswer.toLowerCase().includes(concept.toLowerCase())
    );

    let completeness;
    if (expectedConcepts.length > 0) {
      // More generous scoring - if they mention half the concepts, give them good completeness
      const conceptRatio = conceptsFound.length / expectedConcepts.length;
      if (conceptRatio >= 0.5) {
        completeness = Math.min(conceptRatio * 100 + 20, 100); // Bonus for covering half or more
      } else {
        completeness = conceptRatio * 100;
      }
    } else {
      // For assignments without specific concepts, be generous if they give a good programming answer
      if (
        studentAnswer.length > 100 &&
        studentAnswerLower.includes("program")
      ) {
        completeness = 90;
      } else if (studentAnswer.length > 50) {
        completeness = 80;
      } else {
        completeness = 60;
      }
    }

    // Understanding depth based on answer quality - be more generous for good answers
    let understanding = 50;
    if (studentAnswer.length > 100) {
      understanding = 85; // Higher score for detailed answers
    } else if (studentAnswer.length > 50) {
      understanding = 75; // Good score for medium-length answers
    } else if (studentAnswer.length > 20) {
      understanding = 65; // Decent score for short but complete answers
    }

    // Boost understanding for programming-related content
    if (
      studentAnswerLower.includes("swift") ||
      studentAnswerLower.includes("programming") ||
      studentAnswerLower.includes("app") ||
      studentAnswerLower.includes("function")
    ) {
      understanding = Math.min(understanding + 10, 95);
    }

    // Adjust based on attempt number
    if (context.attemptNumber > 1) {
      understanding += 5; // Slight boost for persistence
    }

    // Calculate final score using the new framework weights
    const finalScore = Math.round(
      contextRelevance * 0.5 + understanding * 0.3 + completeness * 0.2
    );

    let feedbackType = "needs_improvement";
    if (contextRelevance < 60) feedbackType = "context_mismatch";
    else if (finalScore >= 85) feedbackType = "excellent";
    else if (finalScore >= 70) feedbackType = "good_progress";
    else if (finalScore >= 50) feedbackType = "needs_improvement";
    else feedbackType = "needs_improvement";

    const suggestions = [];
    if (contextRelevance < 20) {
      suggestions.push(
        "You are discussing a completely wrong topic. This assignment is not about the topic you described. Please focus on the correct assignment subject."
      );
    } else if (contextRelevance < 50) {
      suggestions.push(
        "Your response is mostly about the wrong topic. Please focus on the specific assignment requirements."
      );
    } else if (contextRelevance < 80) {
      suggestions.push(
        "Focus more on the specific assignment requirements and correct topic"
      );
    }
    if (understanding < 70) {
      suggestions.push("Provide more detail about your understanding");
    }
    if (completeness < 70) {
      suggestions.push(
        "Address more of the key concepts mentioned in the assignment"
      );
    }

    return {
      context_relevance_score: contextRelevance,
      understanding_depth_score: understanding,
      completeness_score: completeness,
      final_score: finalScore,
      passed: finalScore >= 70 && contextRelevance >= 60,
      feedback_type: feedbackType,
      concepts_identified: conceptsFound,
      detailed_feedback: {
        context_feedback: contextFeedback,
        understanding_feedback:
          understanding >= 70
            ? "Shows good understanding of the concepts"
            : "Try to be more specific about your understanding",
        completeness_feedback:
          expectedConcepts.length > 0
            ? `Covered ${conceptsFound.length}/${expectedConcepts.length} expected concepts`
            : "Good coverage of the topic",
        suggestions:
          suggestions.length > 0 ? suggestions : ["Keep up the good work!"],
        encouragement:
          context.attemptNumber > 1
            ? `Great persistence! You're making progress. ${
                finalScore >= 70 ? "You've got this!" : "Keep working on it!"
              }`
            : "Good start! Keep building on your understanding.",
      },
      improvement_suggestions: [
        "Try to connect concepts to specific implementation details",
        "Consider the relationships between different components",
        "Think about potential challenges and how to address them",
      ],
      learning_indicators: {
        concept_grasp:
          finalScore >= 80
            ? "solid"
            : finalScore >= 60
            ? "developing"
            : "developing",
        application_skill: finalScore >= 80 ? "intermediate" : "beginner",
        critical_thinking: finalScore >= 70 ? "developing" : "basic",
      },
      next_steps: [
        finalScore >= 70
          ? "You're ready to proceed to the next milestone!"
          : "Review the assignment requirements and try again",
        "Consider how your understanding applies to the practical implementation",
        "Think about potential challenges you might encounter",
      ],
    };
  }
};

export const getAdaptiveFeedback = async (
  currentAttempt: GradingResult,
  previousAttempts: GradingResult[],
  context: GradingContext
): Promise<string[]> => {
  if (previousAttempts.length === 0) {
    return currentAttempt.detailed_feedback.suggestions;
  }

  const lastAttempt = previousAttempts[previousAttempts.length - 1];
  const improvements = [];
  const regressions = [];

  // Check for improvements
  if (
    currentAttempt.context_relevance_score > lastAttempt.context_relevance_score
  ) {
    improvements.push(
      "Great improvement in addressing the assignment context!"
    );
  }
  if (
    currentAttempt.understanding_depth_score >
    lastAttempt.understanding_depth_score
  ) {
    improvements.push("Your understanding has deepened - well done!");
  }
  if (currentAttempt.completeness_score > lastAttempt.completeness_score) {
    improvements.push("You're covering more of the required concepts now.");
  }

  // Check for regressions
  if (
    currentAttempt.context_relevance_score < lastAttempt.context_relevance_score
  ) {
    regressions.push("Focus more on the specific assignment requirements.");
  }
  if (
    currentAttempt.understanding_depth_score <
    lastAttempt.understanding_depth_score
  ) {
    regressions.push("Try to be more specific about your understanding.");
  }

  // Combine feedback
  const adaptiveFeedback = [
    ...improvements,
    ...regressions,
    ...currentAttempt.detailed_feedback.suggestions,
  ];

  return adaptiveFeedback;
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
