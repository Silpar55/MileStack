import { NextRequest, NextResponse } from "next/server";
import { aiAssistanceService } from "@/shared/ai-assistance-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, assignmentId } = body;

    // Validate required fields
    if (!userId || !assignmentId) {
      return NextResponse.json(
        { error: "Missing required fields: userId and assignmentId" },
        { status: 400 }
      );
    }

    // Start copilot session
    const result = await aiAssistanceService.startCopilotSession(
      userId,
      assignmentId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      response: result.response,
      pointsDeducted: result.pointsDeducted,
      remainingBalance: result.remainingBalance,
    });
  } catch (error) {
    console.error("Start Copilot Session Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
