import { NextRequest, NextResponse } from "next/server";
import { aiAssistanceService } from "@/shared/ai-assistance-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { message } = body;
    const sessionId = params.id;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "Missing required field: message" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Send message to copilot session
    const result = await aiAssistanceService.sendCopilotMessage(
      sessionId,
      message
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      response: result.response,
    });
  } catch (error) {
    console.error("Copilot Message Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
