import { NextRequest, NextResponse } from "next/server";
import { aiAssistanceService } from "@/shared/ai-assistance-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // End copilot session
    const result = await aiAssistanceService.endCopilotSession(sessionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      response: result.response,
    });
  } catch (error) {
    console.error("End Copilot Session Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
