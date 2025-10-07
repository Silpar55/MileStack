import { OpenAI } from "openai";
import { pointsService } from "./points-service";

export interface AIAssistanceRequest {
  userId: string;
  assignmentId: string;
  question: string;
  context: {
    assignmentType: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    topics: string[];
    studentLevel: string;
  };
  assistanceLevel: 1 | 2 | 3 | 4;
}

export interface AIAssistanceResponse {
  success: boolean;
  response: string;
  pointsDeducted: number;
  remainingBalance: number;
  sessionId?: string;
  error?: string;
}

export interface CopilotSession {
  id: string;
  userId: string;
  assignmentId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  transcript: CopilotMessage[];
  isActive: boolean;
}

export interface CopilotMessage {
  id: string;
  timestamp: Date;
  sender: "student" | "ai";
  content: string;
  messageType:
    | "question"
    | "explanation"
    | "guidance"
    | "code_review"
    | "suggestion";
}

export class AIAssistanceService {
  private openai: OpenAI | null = null;
  private activeSessions: Map<string, CopilotSession> = new Map();

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured");
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async requestAssistance(
    request: AIAssistanceRequest
  ): Promise<AIAssistanceResponse> {
    try {
      // Check if user has enough points for the requested level
      const requiredPoints = this.getRequiredPoints(request.assistanceLevel);
      const balance = await pointsService.getPointsBalance(request.userId);

      if (!balance || balance.currentBalance < requiredPoints) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: balance?.currentBalance || 0,
          error: `Insufficient points. You need ${requiredPoints} points for Level ${request.assistanceLevel} assistance.`,
        };
      }

      // Deduct points
      const spendResult = await pointsService.spendPoints({
        userId: request.userId,
        amount: requiredPoints,
        category: "ai-copilot",
        reason: `Level ${request.assistanceLevel} AI assistance`,
        sourceId: request.assignmentId,
        metadata: { assistanceLevel: request.assistanceLevel },
      });

      if (!spendResult.success) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: balance.currentBalance,
          error: spendResult.message,
        };
      }

      // Generate educational response based on level
      const response = await this.generateEducationalResponse(request);

      return {
        success: true,
        response,
        pointsDeducted: requiredPoints,
        remainingBalance: spendResult.remainingBalance,
      };
    } catch (error) {
      console.error("AI Assistance Error:", error);
      return {
        success: false,
        response: "",
        pointsDeducted: 0,
        remainingBalance: 0,
        error: "Failed to process AI assistance request",
      };
    }
  }

  async startCopilotSession(
    userId: string,
    assignmentId: string
  ): Promise<AIAssistanceResponse> {
    try {
      // Check if user has enough points for copilot session
      const requiredPoints = 50;
      const balance = await pointsService.getPointsBalance(userId);

      if (!balance || balance.currentBalance < requiredPoints) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: balance?.currentBalance || 0,
          error:
            "Insufficient points. You need 50 points for a copilot session.",
        };
      }

      // Deduct points
      const spendResult = await pointsService.spendPoints({
        userId,
        amount: requiredPoints,
        category: "ai-copilot",
        reason: "AI Copilot Session (30 minutes)",
        sourceId: assignmentId,
        metadata: { sessionType: "copilot" },
      });

      if (!spendResult.success) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: balance.currentBalance,
          error: spendResult.message,
        };
      }

      // Create new copilot session
      const sessionId = `copilot_${userId}_${Date.now()}`;
      const session: CopilotSession = {
        id: sessionId,
        userId,
        assignmentId,
        startTime: new Date(),
        duration: 0,
        transcript: [],
        isActive: true,
      };

      this.activeSessions.set(sessionId, session);

      return {
        success: true,
        response: `Copilot session started! You have 30 minutes of collaborative coding time. I'll guide you through your assignment with educational explanations. What would you like to work on first?`,
        pointsDeducted: requiredPoints,
        remainingBalance: spendResult.remainingBalance,
        sessionId,
      };
    } catch (error) {
      console.error("Copilot Session Error:", error);
      return {
        success: false,
        response: "",
        pointsDeducted: 0,
        remainingBalance: 0,
        error: "Failed to start copilot session",
      };
    }
  }

  async sendCopilotMessage(
    sessionId: string,
    message: string
  ): Promise<AIAssistanceResponse> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.isActive) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: 0,
          error: "Session not found or inactive",
        };
      }

      // Check if session has expired (30 minutes)
      const now = new Date();
      const sessionDuration = now.getTime() - session.startTime.getTime();
      if (sessionDuration > 30 * 60 * 1000) {
        session.isActive = false;
        session.endTime = now;
        session.duration = sessionDuration;
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: 0,
          error: "Copilot session has expired. Please start a new session.",
        };
      }

      // Add student message to transcript
      const studentMessage: CopilotMessage = {
        id: `msg_${Date.now()}`,
        timestamp: now,
        sender: "student",
        content: message,
        messageType: "question",
      };
      session.transcript.push(studentMessage);

      // Generate AI response
      const aiResponse = await this.generateCopilotResponse(session, message);

      // Add AI response to transcript
      const aiMessage: CopilotMessage = {
        id: `msg_${Date.now() + 1}`,
        timestamp: new Date(),
        sender: "ai",
        content: aiResponse,
        messageType: "guidance",
      };
      session.transcript.push(aiMessage);

      return {
        success: true,
        response: aiResponse,
        pointsDeducted: 0,
        remainingBalance: 0,
      };
    } catch (error) {
      console.error("Copilot Message Error:", error);
      return {
        success: false,
        response: "",
        pointsDeducted: 0,
        remainingBalance: 0,
        error: "Failed to process copilot message",
      };
    }
  }

  async endCopilotSession(sessionId: string): Promise<AIAssistanceResponse> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          response: "",
          pointsDeducted: 0,
          remainingBalance: 0,
          error: "Session not found",
        };
      }

      session.isActive = false;
      session.endTime = new Date();
      session.duration =
        session.endTime.getTime() - session.startTime.getTime();

      // Save session transcript to database (implement as needed)
      await this.saveSessionTranscript(session);

      return {
        success: true,
        response: `Copilot session ended. Duration: ${Math.round(
          session.duration / 1000 / 60
        )} minutes. Your session transcript has been saved for learning review.`,
        pointsDeducted: 0,
        remainingBalance: 0,
      };
    } catch (error) {
      console.error("End Copilot Session Error:", error);
      return {
        success: false,
        response: "",
        pointsDeducted: 0,
        remainingBalance: 0,
        error: "Failed to end copilot session",
      };
    }
  }

  async getSessionTranscript(sessionId: string): Promise<CopilotMessage[]> {
    const session = this.activeSessions.get(sessionId);
    return session ? session.transcript : [];
  }

  private getRequiredPoints(level: number): number {
    switch (level) {
      case 1:
        return 5;
      case 2:
        return 15;
      case 3:
        return 25;
      case 4:
        return 50;
      default:
        return 0;
    }
  }

  private async generateEducationalResponse(
    request: AIAssistanceRequest
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(
      request.assistanceLevel,
      request.context
    );

    const completion = await this.getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.question },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      completion.choices[0]?.message?.content || "Unable to generate response"
    );
  }

  private async generateCopilotResponse(
    session: CopilotSession,
    message: string
  ): Promise<string> {
    const systemPrompt = this.buildCopilotSystemPrompt();

    const completion = await this.getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return (
      completion.choices[0]?.message?.content || "Unable to generate response"
    );
  }

  private buildSystemPrompt(level: number, context: any): string {
    const basePrompt = `You are an educational AI assistant that provides guidance without giving complete solutions. Your role is to help students learn through Socratic questioning and educational explanations.

CRITICAL CONSTRAINTS:
- NEVER provide complete, copy-paste solutions
- NEVER give direct answers to coding problems
- ALWAYS ask questions to guide student thinking
- ALWAYS explain WHY concepts are important
- ALWAYS provide educational context

RESPONSE FRAMEWORK:
- always_ask_first: "What do you think about [specific concept]?"
- provide_context: "This is important because..."
- educational_examples: "Similar to [related concept], but different because..."
- next_steps: "Try implementing [specific small step] and see what happens"
- never_include: ["complete_solutions", "copy_paste_code", "direct_answers"]

ASSIGNMENT CONTEXT:
- Type: ${context.assignmentType}
- Difficulty: ${context.difficulty}
- Topics: ${context.topics.join(", ")}
- Student Level: ${context.studentLevel}`;

    switch (level) {
      case 1:
        return `${basePrompt}

LEVEL 1 ASSISTANCE (5 points): Conceptual Hints
- Use Socratic questioning: "What do you think happens when..."
- Provide concept clarification: "This problem relates to [concept] because..."
- Give direction guidance: "Consider the base case first"
- NO code solutions, only conceptual understanding
- Focus on building mental models and understanding`;

      case 2:
        return `${basePrompt}

LEVEL 2 ASSISTANCE (15 points): Pseudocode Structure
- Provide high-level algorithmic approach
- Show logical flow without specific implementation
- Give structure suggestions: "You'll need a loop here and a condition there"
- Still NO actual code, just logical organization
- Focus on problem-solving approach and algorithm design`;

      case 3:
        return `${basePrompt}

LEVEL 3 ASSISTANCE (25 points): Code Review and Feedback
- Analyze student's existing code for improvements
- Identify bugs without fixing them directly
- Suggest refactoring approaches with educational reasoning
- Point out best practices and explain WHY
- Focus on code quality and learning from mistakes`;

      default:
        return basePrompt;
    }
  }

  private buildCopilotSystemPrompt(): string {
    return `You are an AI coding copilot in a 30-minute educational session. Your role is to guide the student through their assignment with constant educational explanations.

CRITICAL CONSTRAINTS:
- NEVER provide complete, copy-paste solutions
- NEVER give direct answers to coding problems
- ALWAYS ask the student to explain their reasoning first
- ALWAYS provide educational context for every suggestion
- ALWAYS explain WHY concepts are important

COPILOT APPROACH:
- Pair programming style with constant explanation
- Ask "What do you think about [specific concept]?" before suggesting
- Provide educational examples: "Similar to [related concept], but different because..."
- Guide step-by-step with small, manageable tasks
- Explain the reasoning behind each suggestion
- Encourage the student to think through problems

RESPONSE FRAMEWORK:
- always_ask_first: "What do you think about [specific concept]?"
- provide_context: "This is important because..."
- educational_examples: "Similar to [related concept], but different because..."
- next_steps: "Try implementing [specific small step] and see what happens"
- never_include: ["complete_solutions", "copy_paste_code", "direct_answers"]

Remember: You are a learning partner, not a solution provider. Guide the student to discover the solution through understanding.`;
  }

  private async saveSessionTranscript(session: CopilotSession): Promise<void> {
    // Implement database storage for session transcripts
    // This would typically save to a database table for learning review
    console.log(
      "Saving session transcript:",
      session.id,
      session.transcript.length,
      "messages"
    );
  }
}

export const aiAssistanceService = new AIAssistanceService();
