import { NextRequest, NextResponse } from "next/server";
import { aiAssistanceService } from "@/shared/ai-assistance-service";

export async function GET(
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

    // Get session transcript
    const transcript = await aiAssistanceService.getSessionTranscript(
      sessionId
    );

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error("Get Session Transcript Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
