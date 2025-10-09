import { GoogleGenerativeAI } from "@google/generative-ai";

interface ConceptExplanationAssessment {
  type: "concept-explanation";
  prompt: string;
  studentResponse: string;
  expectedConcepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

interface SkillAssessmentQuestion {
  id: string;
  type: "multiple-choice" | "code-completion" | "practical-implementation";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

interface SkillAssessment {
  type: "skill-assessment";
  questions: SkillAssessmentQuestion[];
  studentResponses: Record<string, any>;
  timeLimit: number;
}

interface CodeReviewAssessment {
  type: "code-review";
  codeSnippet: string;
  issues: Array<{
    line: number;
    type: "error" | "warning" | "improvement";
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  studentAnalysis: string;
  expectedIssues: string[];
}

interface AssessmentResult {
  score: number;
  topicRelevanceScore?: number;
  comprehensionScore: number;
  accuracyScore: number;
  originalityScore: number;
  plagiarismDetected: boolean;
  plagiarismScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  isPassed: boolean;
  detailedAnalysis: any;
}

export class CompetencyAssessmentService {
  private static instance: CompetencyAssessmentService;
  private genAI: GoogleGenerativeAI;
  private useRuleBasedGrading: boolean;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    // Use rule-based grading for development to avoid AI costs
    this.useRuleBasedGrading =
      process.env.NODE_ENV === "development" || !process.env.GEMINI_API_KEY;
  }

  public static getInstance(): CompetencyAssessmentService {
    if (!CompetencyAssessmentService.instance) {
      CompetencyAssessmentService.instance = new CompetencyAssessmentService();
    }
    return CompetencyAssessmentService.instance;
  }

  /**
   * Evaluate concept explanation assessment
   * Students must explain assignment requirements in their own words
   */
  async evaluateConceptExplanation(
    assessment: ConceptExplanationAssessment,
    assignmentContent?: string
  ): Promise<AssessmentResult> {
    if (this.useRuleBasedGrading) {
      return this.evaluateConceptExplanationRuleBased(
        assessment,
        assignmentContent
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
      });

      const prompt = `
You are an educational AI that evaluates student comprehension of programming concepts with strict anti-plagiarism detection.

ASSESSMENT TYPE: Concept Explanation
STUDENT RESPONSE: "${assessment.studentResponse}"
EXPECTED CONCEPTS: ${assessment.expectedConcepts.join(", ")}
DIFFICULTY: ${assessment.difficulty}
${
  assignmentContent
    ? `ASSIGNMENT CONTENT (for plagiarism detection and topic relevance): "${assignmentContent.substring(
        0,
        1000
      )}..."`
    : ""
}

CRITICAL TOPIC RELEVANCE CHECK:
- FIRST: Verify that the student's response is actually about the SAME TOPIC as the assignment
- Check if the student is answering about the correct subject matter (e.g., if assignment is about "Binary Search Trees" but student writes about "SwiftUI", this should score 0)
- Ensure the concepts mentioned in the student's response align with the assignment's actual content
- If the topic doesn't match, automatically score 0 regardless of response quality

ANTI-PLAGIARISM REQUIREMENTS:
- Check if student response contains direct copying from assignment content
- Look for identical phrases, sentences, or paragraphs
- Detect if student is just rearranging assignment text
- Verify student is using their own words and understanding

EVALUATION CRITERIA (in order of importance):
1. TOPIC RELEVANCE (0-100): Does the response address the ACTUAL assignment topic? If not, score 0.
2. Comprehension (0-100): Does the student understand the core concepts of the CORRECT topic?
3. Accuracy (0-100): Are the explanations technically correct for the assignment's subject matter?
4. Clarity (0-100): Is the explanation clear and demonstrates understanding of the RIGHT concepts?
5. Completeness (0-100): Does it show understanding of key concepts from the assignment (quality over quantity)?
6. Originality (0-100): Is this the student's own understanding, not copied?
7. Plagiarism Detection (0-100): How much content appears to be copied?

IMPORTANT: 
- TOPIC RELEVANCE IS CRITICAL: If the student answers about the wrong topic, the score must be 0
- Focus on understanding and concept demonstration, not essay length
- A concise but accurate explanation about the CORRECT topic should score well
- A long, well-written response about the WRONG topic should score 0

Please provide:
1. Overall score (0-100) - MUST be 0 if topic doesn't match
2. Topic Relevance score (0-100) - 0 if wrong topic, 100 if correct topic
3. Comprehension score (0-100)
4. Accuracy score (0-100)
5. Detailed feedback
6. Strengths identified
7. Weaknesses identified
8. Specific recommendations for improvement
9. Whether the student passed (minimum 80% required AND topic must match)

Format your response as JSON:
{
  "overallScore": number,
  "topicRelevanceScore": number,
  "comprehensionScore": number,
  "accuracyScore": number,
  "feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "isPassed": boolean,
  "detailedAnalysis": {
    "topicMatch": boolean,
    "conceptCoverage": number,
    "technicalAccuracy": number,
    "clarityScore": number,
    "missingConcepts": ["string"],
    "misconceptions": ["string"]
  }
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const analysis = JSON.parse(text);

      return {
        score: analysis.overallScore,
        topicRelevanceScore: analysis.topicRelevanceScore,
        comprehensionScore: analysis.comprehensionScore,
        accuracyScore: analysis.accuracyScore,
        originalityScore: analysis.originalityScore || 100,
        plagiarismDetected: analysis.plagiarismDetected || false,
        plagiarismScore: analysis.plagiarismScore || 0,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        isPassed: analysis.isPassed,
        detailedAnalysis: analysis.detailedAnalysis,
      };
    } catch (error) {
      console.error("Concept explanation evaluation error:", error);
      return this.evaluateConceptExplanationRuleBased(assessment);
    }
  }

  /**
   * Rule-based evaluation for concept explanation (development mode)
   */
  private evaluateConceptExplanationRuleBased(
    assessment: ConceptExplanationAssessment,
    assignmentContent?: string
  ): AssessmentResult {
    const response = assessment.studentResponse.toLowerCase();
    let score = 0;
    let originalityScore = 100;
    let plagiarismScore = 0;
    let plagiarismDetected = false;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Topic relevance check - CRITICAL FIRST CHECK
    let topicRelevanceScore = 100;
    if (assignmentContent) {
      const assignmentText = assignmentContent.toLowerCase();

      // Extract key terms from assignment (first 200 chars usually contain main topic)
      const assignmentKeywords = assignmentText
        .substring(0, 200)
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 10); // Top 10 keywords

      // Check if student response mentions any assignment keywords
      const responseKeywords = response
        .split(/\s+/)
        .filter((word) => word.length > 3);
      const matchingKeywords = assignmentKeywords.filter((keyword) =>
        responseKeywords.some(
          (responseWord) =>
            responseWord.includes(keyword) || keyword.includes(responseWord)
        )
      );

      // If less than 30% of assignment keywords are mentioned, likely wrong topic
      const keywordMatchPercentage =
        (matchingKeywords.length / assignmentKeywords.length) * 100;

      if (keywordMatchPercentage < 30) {
        topicRelevanceScore = 0;
        weaknesses.push(
          "Response does not appear to address the assignment topic"
        );
        recommendations.push(
          "Ensure you are answering about the correct subject matter from the assignment"
        );

        // If topic doesn't match, return 0 score regardless of other factors
        return {
          score: 0,
          topicRelevanceScore: 0,
          comprehensionScore: 0,
          accuracyScore: 0,
          originalityScore: 0,
          plagiarismDetected: false,
          plagiarismScore: 0,
          feedback:
            "Your response does not appear to address the correct assignment topic. Please ensure you understand what the assignment is asking about and respond accordingly.",
          strengths: [],
          weaknesses: ["Response addresses wrong topic"],
          recommendations: [
            "Review the assignment requirements and ensure you understand the correct subject matter",
          ],
          isPassed: false,
          detailedAnalysis: {
            topicMatch: false,
            conceptCoverage: 0,
            technicalAccuracy: 0,
            clarityScore: 0,
            missingConcepts: [],
            misconceptions: [],
          },
        };
      }
    }

    // Plagiarism detection
    if (assignmentContent) {
      const assignmentText = assignmentContent.toLowerCase();
      const responseWords = response.split(/\s+/);
      const assignmentWords = assignmentText.split(/\s+/);

      // Check for exact phrase matches (3+ words)
      let matchedPhrases = 0;
      for (let i = 0; i <= responseWords.length - 3; i++) {
        const phrase = responseWords.slice(i, i + 3).join(" ");
        if (assignmentText.includes(phrase)) {
          matchedPhrases++;
        }
      }

      // Calculate plagiarism percentage
      const totalPossiblePhrases = Math.max(1, responseWords.length - 2);
      plagiarismScore = Math.min(
        100,
        (matchedPhrases / totalPossiblePhrases) * 100
      );
      plagiarismDetected = plagiarismScore > 30;

      if (plagiarismDetected) {
        originalityScore = Math.max(0, 100 - plagiarismScore);
        weaknesses.push(
          `High similarity to assignment content (${plagiarismScore.toFixed(
            1
          )}%)`
        );
        recommendations.push(
          "Rewrite in your own words - avoid copying from assignment"
        );
      } else {
        strengths.push("Original explanation in student's own words");
      }
    }

    // Basic length check - more lenient
    if (assessment.studentResponse.length < 10) {
      score = 10;
      weaknesses.push("Response very brief");
      recommendations.push(
        "Provide a bit more detail to demonstrate understanding"
      );
    } else {
      score = 20; // Base score for any reasonable attempt
    }

    // Base score for attempting
    score = 30;
    strengths.push("Made an attempt to explain the concept");

    // Check for expected concepts
    let conceptsFound = 0;
    for (const concept of assessment.expectedConcepts) {
      if (response.includes(concept.toLowerCase())) {
        conceptsFound++;
        score += 15;
        strengths.push(`Mentioned ${concept}`);
      }
    }

    // Concept coverage scoring
    const conceptCoverage =
      (conceptsFound / assessment.expectedConcepts.length) * 100;
    if (conceptCoverage >= 80) {
      score += 20;
      strengths.push("Good concept coverage");
    } else if (conceptCoverage >= 50) {
      score += 10;
      weaknesses.push("Missing some key concepts");
      recommendations.push("Review and include more key concepts");
    } else {
      weaknesses.push("Limited concept coverage");
      recommendations.push(
        "Focus on understanding and explaining key concepts"
      );
    }

    // Length and structure scoring - more flexible
    if (assessment.studentResponse.length > 50) {
      score += 10;
      strengths.push("Clear explanation");
    }
    if (assessment.studentResponse.length > 100) {
      score += 5;
      strengths.push("Detailed explanation");
    }

    // Basic structure check
    const sentences = assessment.studentResponse
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    if (sentences.length >= 3) {
      score += 10;
      strengths.push("Well-structured explanation");
    } else {
      weaknesses.push("Could improve structure");
      recommendations.push("Break down explanation into clear sentences");
    }

    // Technical accuracy indicators
    const technicalTerms = [
      "algorithm",
      "data structure",
      "complexity",
      "efficiency",
      "implementation",
    ];
    let technicalTermsFound = 0;
    for (const term of technicalTerms) {
      if (response.includes(term)) {
        technicalTermsFound++;
      }
    }
    if (technicalTermsFound > 0) {
      score += Math.min(15, technicalTermsFound * 5);
      strengths.push("Used appropriate technical terms");
    }

    // Cap score at 100
    score = Math.min(100, score);

    // Generate recommendations based on score
    if (score < 80) {
      recommendations.push(
        "Review the assignment requirements and key concepts"
      );
      recommendations.push(
        "Provide specific examples to illustrate your understanding"
      );
    }

    return this.createAssessmentResult(
      score,
      score,
      score,
      originalityScore,
      plagiarismDetected,
      plagiarismScore,
      strengths,
      weaknesses,
      recommendations,
      topicRelevanceScore
    );
  }

  /**
   * Create standardized assessment result
   */
  private createAssessmentResult(
    score: number,
    comprehensionScore: number,
    accuracyScore: number,
    originalityScore: number = 100,
    plagiarismDetected: boolean = false,
    plagiarismScore: number = 0,
    strengths: string[],
    weaknesses: string[],
    recommendations: string[],
    topicRelevanceScore: number = 100
  ): AssessmentResult {
    const isPassed = score >= 80 && !plagiarismDetected;
    let feedback = "";

    if (isPassed) {
      feedback =
        "Excellent work! You demonstrated a strong understanding of the concepts. ";
    } else if (score >= 60) {
      feedback = "Good effort! You showed understanding of some concepts. ";
    } else {
      feedback = "Your explanation needs improvement. ";
    }

    if (strengths.length > 0) {
      feedback += "Strengths: " + strengths.join(", ") + ". ";
    }
    if (weaknesses.length > 0) {
      feedback += "Areas to improve: " + weaknesses.join(", ") + ". ";
    }
    if (recommendations.length > 0) {
      feedback += "Recommendations: " + recommendations.join(", ") + ".";
    }

    return {
      score,
      topicRelevanceScore,
      comprehensionScore,
      accuracyScore,
      originalityScore,
      plagiarismDetected,
      plagiarismScore,
      feedback,
      strengths,
      weaknesses,
      recommendations,
      isPassed,
      detailedAnalysis: {
        conceptCoverage: score,
        technicalAccuracy: score,
        clarityScore: score,
        missingConcepts: weaknesses,
        misconceptions: [],
      },
    };
  }

  /**
   * Evaluate skill assessment with multiple choice and practical questions
   */
  async evaluateSkillAssessment(
    assessment: SkillAssessment
  ): Promise<AssessmentResult> {
    if (this.useRuleBasedGrading) {
      return this.evaluateSkillAssessmentRuleBased(assessment);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
      });

      let totalScore = 0;
      let maxScore = 0;
      const questionResults: any[] = [];

      for (const question of assessment.questions) {
        const studentAnswer = assessment.studentResponses[question.id];
        const isCorrect = this.checkAnswer(question, studentAnswer);
        const questionScore = isCorrect ? question.points : 0;

        totalScore += questionScore;
        maxScore += question.points;

        questionResults.push({
          questionId: question.id,
          question: question.question,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          score: questionScore,
          maxScore: question.points,
        });
      }

      const percentageScore = Math.round((totalScore / maxScore) * 100);
      const isPassed = percentageScore >= 80;

      // Generate AI feedback
      const feedbackPrompt = `
Analyze this skill assessment performance:

QUESTIONS: ${assessment.questions.length}
SCORE: ${totalScore}/${maxScore} (${percentageScore}%)
RESULTS: ${JSON.stringify(questionResults)}

Provide:
1. Overall feedback on performance
2. Strengths identified
3. Areas for improvement
4. Specific recommendations

Format as JSON:
{
  "feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"]
}
`;

      const result = await model.generateContent(feedbackPrompt);
      const response = await result.response;
      const text = response.text();
      const analysis = JSON.parse(text);

      return {
        score: percentageScore,
        comprehensionScore: percentageScore,
        accuracyScore: percentageScore,
        originalityScore: 100,
        plagiarismDetected: false,
        plagiarismScore: 0,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        isPassed,
        detailedAnalysis: {
          questionResults,
          totalScore,
          maxScore,
          percentageScore,
        },
      };
    } catch (error) {
      console.error("Skill assessment evaluation error:", error);
      return this.evaluateSkillAssessmentRuleBased(assessment);
    }
  }

  /**
   * Rule-based evaluation for skill assessment (development mode)
   */
  private evaluateSkillAssessmentRuleBased(
    assessment: SkillAssessment
  ): AssessmentResult {
    let totalScore = 0;
    let maxScore = 0;
    const questionResults: any[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    for (const question of assessment.questions) {
      const studentAnswer = assessment.studentResponses[question.id];
      let questionScore = 0;
      let isCorrect = false;

      if (question.type === "multiple-choice") {
        // Give partial credit for attempting
        if (
          studentAnswer &&
          typeof studentAnswer === "string" &&
          studentAnswer.length > 0
        ) {
          questionScore = Math.floor(question.points * 0.8); // 80% for attempting
          // Add some randomness for development
          questionScore += Math.floor(
            Math.random() * Math.floor(question.points * 0.2)
          );
        }
        isCorrect = questionScore > question.points * 0.7;
      } else if (question.type === "code-completion") {
        // Check for basic code structure
        if (studentAnswer && typeof studentAnswer === "string") {
          const code = studentAnswer.toLowerCase();
          questionScore = 20; // Base score for attempting

          if (code.includes("def ") || code.includes("function"))
            questionScore += 20;
          if (code.includes("return")) questionScore += 20;
          if (code.includes("if ") || code.includes("else"))
            questionScore += 15;
          if (code.includes("for ") || code.includes("while"))
            questionScore += 15;
          if (code.length > 50) questionScore += 10;
        }
        isCorrect = questionScore > question.points * 0.7;
      } else if (question.type === "practical-implementation") {
        // Similar to code completion but with higher expectations
        if (studentAnswer && typeof studentAnswer === "string") {
          const code = studentAnswer.toLowerCase();
          questionScore = 30; // Base score for attempting

          if (code.includes("def ") || code.includes("function"))
            questionScore += 25;
          if (code.includes("return")) questionScore += 25;
          if (code.includes("if ") || code.includes("else"))
            questionScore += 10;
          if (code.includes("for ") || code.includes("while"))
            questionScore += 10;
          if (code.length > 100) questionScore += 10;
        }
        isCorrect = questionScore > question.points * 0.7;
      }

      totalScore += questionScore;
      maxScore += question.points;

      questionResults.push({
        questionId: question.id,
        question: question.question,
        studentAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        score: questionScore,
        maxScore: question.points,
      });
    }

    const percentageScore = Math.round((totalScore / maxScore) * 100);
    const isPassed = percentageScore >= 80;

    // Generate feedback based on performance
    if (isPassed) {
      strengths.push("Demonstrated good understanding of the concepts");
      strengths.push("Answered questions with appropriate detail");
    } else if (percentageScore >= 60) {
      strengths.push("Showed understanding of some concepts");
      weaknesses.push("Some areas need improvement");
      recommendations.push("Review the concepts where you struggled");
    } else {
      weaknesses.push("Limited understanding demonstrated");
      recommendations.push("Review the fundamental concepts");
      recommendations.push("Practice with similar problems");
    }

    let feedback = "";
    if (isPassed) {
      feedback =
        "Great job! You demonstrated good understanding of the concepts. ";
    } else if (percentageScore >= 60) {
      feedback = "Good effort! You showed understanding of some concepts. ";
    } else {
      feedback = "Your responses need improvement. ";
    }

    if (strengths.length > 0) {
      feedback += "Strengths: " + strengths.join(", ") + ". ";
    }
    if (weaknesses.length > 0) {
      feedback += "Areas to improve: " + weaknesses.join(", ") + ". ";
    }
    if (recommendations.length > 0) {
      feedback += "Recommendations: " + recommendations.join(", ") + ".";
    }

    return {
      score: percentageScore,
      comprehensionScore: percentageScore,
      accuracyScore: percentageScore,
      originalityScore: 100,
      plagiarismDetected: false,
      plagiarismScore: 0,
      feedback,
      strengths,
      weaknesses,
      recommendations,
      isPassed,
      detailedAnalysis: {
        questionResults,
        totalScore,
        maxScore,
        percentageScore,
      },
    };
  }

  /**
   * Evaluate code review assessment
   * Students must identify issues and suggest solutions
   */
  async evaluateCodeReview(
    assessment: CodeReviewAssessment
  ): Promise<AssessmentResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
      });

      const prompt = `
You are an educational AI that evaluates student code review skills.

CODE SNIPPET:
\`\`\`
${assessment.codeSnippet}
\`\`\`

STUDENT ANALYSIS: "${assessment.studentAnalysis}"
EXPECTED ISSUES: ${assessment.expectedIssues.join(", ")}

EVALUATION CRITERIA:
1. Issue Detection (0-100): How many issues did the student identify?
2. Accuracy (0-100): Are the identified issues correct?
3. Solutions (0-100): Are the proposed solutions appropriate?
4. Analysis Depth (0-100): Is the analysis thorough and insightful?

Please provide:
1. Overall score (0-100)
2. Comprehension score (0-100) 
3. Accuracy score (0-100)
4. Detailed feedback
5. Strengths identified
6. Weaknesses identified
7. Specific recommendations
8. Whether the student passed (minimum 80% required)

Format your response as JSON:
{
  "overallScore": number,
  "comprehensionScore": number,
  "accuracyScore": number,
  "feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "isPassed": boolean,
  "detailedAnalysis": {
    "issuesIdentified": number,
    "issuesCorrect": number,
    "solutionsProvided": number,
    "solutionsCorrect": number,
    "missedIssues": ["string"],
    "incorrectAnalysis": ["string"]
  }
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = JSON.parse(text);

      return {
        score: analysis.overallScore,
        comprehensionScore: analysis.comprehensionScore,
        accuracyScore: analysis.accuracyScore,
        originalityScore: analysis.originalityScore || 100,
        plagiarismDetected: analysis.plagiarismDetected || false,
        plagiarismScore: analysis.plagiarismScore || 0,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        isPassed: analysis.isPassed,
        detailedAnalysis: analysis.detailedAnalysis,
      };
    } catch (error) {
      console.error("Code review evaluation error:", error);
      return this.getFallbackResult();
    }
  }

  /**
   * Generate adaptive assessment questions based on student performance
   */
  async generateAdaptiveAssessment(
    pathwayId: string,
    checkpointId: string,
    studentPerformance: any,
    assignmentComplexity: "low" | "medium" | "high"
  ): Promise<SkillAssessmentQuestion[]> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
      });

      const prompt = `
Generate adaptive assessment questions for a learning pathway checkpoint.

PATHWAY ID: ${pathwayId}
CHECKPOINT ID: ${checkpointId}
ASSIGNMENT COMPLEXITY: ${assignmentComplexity}
STUDENT PERFORMANCE: ${JSON.stringify(studentPerformance)}

Generate 5 questions that:
1. Match the assignment complexity level
2. Address identified knowledge gaps
3. Progress from basic to advanced concepts
4. Include multiple question types (multiple-choice, code completion, practical implementation)

Format as JSON array:
[
  {
    "id": "string",
    "type": "multiple-choice" | "code-completion" | "practical-implementation",
    "question": "string",
    "options": ["string"] (for multiple-choice only),
    "correctAnswer": "string" | ["string"],
    "explanation": "string",
    "points": number
  }
]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error("Adaptive assessment generation error:", error);
      return this.getFallbackQuestions();
    }
  }

  /**
   * Generate personalized feedback based on assessment results
   */
  async generatePersonalizedFeedback(
    assessmentResult: AssessmentResult,
    studentProfile: any,
    learningGoals: string[]
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
      });

      const prompt = `
Generate personalized feedback for a student based on their assessment performance.

ASSESSMENT RESULT: ${JSON.stringify(assessmentResult)}
STUDENT PROFILE: ${JSON.stringify(studentProfile)}
LEARNING GOALS: ${learningGoals.join(", ")}

Create feedback that:
1. Acknowledges their strengths
2. Addresses specific weaknesses
3. Provides actionable recommendations
4. Connects to their learning goals
5. Motivates continued learning
6. Suggests specific next steps

Keep the feedback encouraging but honest, and provide specific, actionable advice.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Personalized feedback generation error:", error);
      return "Thank you for completing the assessment. Please review your results and continue with your learning journey.";
    }
  }

  private checkAnswer(
    question: SkillAssessmentQuestion,
    studentAnswer: any
  ): boolean {
    if (question.type === "multiple-choice") {
      return studentAnswer === question.correctAnswer;
    } else if (question.type === "code-completion") {
      // For code completion, we might need more sophisticated comparison
      return studentAnswer === question.correctAnswer;
    } else if (question.type === "practical-implementation") {
      // For practical implementation, we might need to run the code
      return studentAnswer === question.correctAnswer;
    }
    return false;
  }

  private getFallbackResult(): AssessmentResult {
    return {
      score: 0,
      comprehensionScore: 0,
      accuracyScore: 0,
      originalityScore: 0,
      plagiarismDetected: false,
      plagiarismScore: 0,
      feedback:
        "Assessment could not be evaluated at this time. Please try again.",
      strengths: [],
      weaknesses: ["Unable to complete assessment"],
      recommendations: ["Please retake the assessment"],
      isPassed: false,
      detailedAnalysis: {},
    };
  }

  private getFallbackQuestions(): SkillAssessmentQuestion[] {
    return [
      {
        id: "fallback-1",
        type: "multiple-choice",
        question: "What is the primary purpose of this concept?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This is the correct answer because...",
        points: 20,
      },
    ];
  }
}

// Export singleton instance
export const competencyAssessmentService =
  CompetencyAssessmentService.getInstance();
