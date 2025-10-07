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
  comprehensionScore: number;
  accuracyScore: number;
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

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
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
    assessment: ConceptExplanationAssessment
  ): Promise<AssessmentResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
You are an educational AI that evaluates student comprehension of programming concepts.

ASSESSMENT TYPE: Concept Explanation
STUDENT RESPONSE: "${assessment.studentResponse}"
EXPECTED CONCEPTS: ${assessment.expectedConcepts.join(", ")}
DIFFICULTY: ${assessment.difficulty}

EVALUATION CRITERIA:
1. Comprehension (0-100): Does the student understand the core concepts?
2. Accuracy (0-100): Are the explanations technically correct?
3. Clarity (0-100): Is the explanation clear and well-structured?
4. Completeness (0-100): Does it cover the essential concepts?

Please provide:
1. Overall score (0-100)
2. Comprehension score (0-100)
3. Accuracy score (0-100)
4. Detailed feedback
5. Strengths identified
6. Weaknesses identified
7. Specific recommendations for improvement
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
        comprehensionScore: analysis.comprehensionScore,
        accuracyScore: analysis.accuracyScore,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        isPassed: analysis.isPassed,
        detailedAnalysis: analysis.detailedAnalysis,
      };
    } catch (error) {
      console.error("Concept explanation evaluation error:", error);
      return this.getFallbackResult();
    }
  }

  /**
   * Evaluate skill assessment with multiple choice and practical questions
   */
  async evaluateSkillAssessment(
    assessment: SkillAssessment
  ): Promise<AssessmentResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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
      return this.getFallbackResult();
    }
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
        model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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
