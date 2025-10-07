import { NextRequest, NextResponse } from "next/server";
import { withAPIMiddleware } from "@/shared/middleware";
import { aiAssistanceService } from "@/shared/ai-assistance-service";

async function handler(
  request: NextRequest,
  userId?: string
): Promise<NextResponse> {
  try {
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assignmentId, question, context, assistanceLevel } = body;

    // Validate required fields
    if (!assignmentId || !question || !context || !assistanceLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate assistance level
    if (![1, 2, 3, 4].includes(assistanceLevel)) {
      return NextResponse.json(
        { error: "Invalid assistance level. Must be 1, 2, 3, or 4" },
        { status: 400 }
      );
    }

    // Request AI assistance
    const result = await aiAssistanceService.requestAssistance({
      userId,
      assignmentId,
      question,
      context,
      assistanceLevel,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      response: result.response,
      pointsDeducted: result.pointsDeducted,
      remainingBalance: result.remainingBalance,
    });
  } catch (error) {
    console.error("AI Ask Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAPIMiddleware(handler, {
  requireAuth: true,
  cors: true,
  security: true,
});
