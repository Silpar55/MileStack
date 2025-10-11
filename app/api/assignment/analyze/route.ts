import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalysis,
  learningMilestones,
} from "@/shared/schema-assignments";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { join } from "path";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { analyzeAssignmentWithAI } from "@/shared/analysis-service";

export async function POST(request: NextRequest) {
  try {
    console.log("Analysis API called");
    const session = await auth();
    console.log(
      "Session:",
      session?.user?.id ? "Authenticated" : "Not authenticated"
    );

    if (!session?.user?.id) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId } = await request.json();
    console.log("Assignment ID:", assignmentId);

    if (!assignmentId) {
      console.log("No assignment ID provided");
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get assignment details
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignmentData = assignment[0];

    // Verify ownership
    if (assignmentData.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status to processing
    await db
      .update(assignments)
      .set({ analysisStatus: "processing" })
      .where(eq(assignments.id, assignmentId));

    // Use the extracted text from the assignment
    let extractedText = assignmentData.extractedText || "";

    // Get Lyzr asset IDs from assignment
    const lyzrAssetIds = Array.isArray(assignmentData.lyzrAssetIds)
      ? assignmentData.lyzrAssetIds
      : [];

    console.log("=== ANALYSIS DEBUG ===");
    console.log("Assignment Title:", assignmentData.title);
    console.log("Has Lyzr Asset IDs:", lyzrAssetIds.length > 0);
    console.log("Lyzr Asset IDs:", lyzrAssetIds);
    console.log("Raw Extracted Text:", extractedText);
    console.log("Extracted Text Length:", extractedText.length);
    console.log("==============================");

    // If no Lyzr asset IDs and no extracted text, provide a fallback message
    if (
      lyzrAssetIds.length === 0 &&
      (!extractedText || extractedText.trim().length === 0)
    ) {
      extractedText = `Assignment: ${assignmentData.title}\n\nNo files were successfully uploaded for processing. Please try uploading again.`;
      console.warn(`No Lyzr asset IDs for assignment ${assignmentId}`);
    }

    // Perform AI analysis using custom AI agent
    console.log("Starting AI analysis for assignment:", assignmentId);
    console.log("Final extracted text length:", extractedText.length);

    let analysisResult;
    try {
      analysisResult = await analyzeAssignmentWithAI(
        {
          title: assignmentData.title,
          description: undefined, // Description field not available in current schema
          courseName: assignmentData.courseName || undefined,
          extractedText: extractedText,
          lyzrAssetIds: lyzrAssetIds,
        },
        session.user.id
      );
      console.log("AI analysis completed successfully:", analysisResult);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
      // Update assignment status to failed
      await db
        .update(assignments)
        .set({
          analysisStatus: "failed",
        })
        .where(eq(assignments.id, assignmentId));

      return NextResponse.json(
        {
          error: "Analysis failed",
          message: "We couldn't upload the PDF correctly. Please try again.",
          details:
            "The AI agent was unable to process your assignment file. Please ensure the PDF is not corrupted and try uploading again.",
          canRetry: true,
        },
        { status: 500 }
      );
    }

    // Save analysis results
    const analysis = await db
      .insert(assignmentAnalysis)
      .values({
        assignmentId,
        concepts: analysisResult.concepts,
        languages: analysisResult.languages,
        difficultyScore: Math.min(
          Math.max(analysisResult.difficulty, 1),
          10
        ) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        prerequisites: analysisResult.prerequisites,
        estimatedTimeHours: analysisResult.estimated_hours.toString(),
      })
      .returning();

    // Create learning milestones directly for the assignment
    const milestones = [];
    for (let i = 0; i < analysisResult.milestones.length; i++) {
      const milestone = analysisResult.milestones[i];
      const createdMilestone = await db
        .insert(learningMilestones)
        .values({
          assignmentId,
          milestoneOrder: i + 1,
          title: milestone.title,
          description: milestone.description,
          competencyRequirement: milestone.competency_check,
          pointsReward: milestone.points_reward,
          status: i === 0 ? "available" : "locked", // First milestone available, others locked
        })
        .returning();
      milestones.push(createdMilestone[0]);
    }

    // Update assignment status to complete
    await db
      .update(assignments)
      .set({ analysisStatus: "complete" })
      .where(eq(assignments.id, assignmentId));

    // Calculate total points from milestones
    const totalPoints = milestones.reduce((sum, m) => sum + m.pointsReward, 0);

    return NextResponse.json({
      success: true,
      analysis: {
        concepts: analysisResult.concepts,
        languages: analysisResult.languages,
        difficulty: analysisResult.difficulty,
        estimated_hours: analysisResult.estimated_hours,
        prerequisites: analysisResult.prerequisites,
      },
      pathway: {
        id: assignmentId, // Use assignment ID as pathway ID
        totalPoints,
        milestones: milestones.map((m) => ({
          title: m.title,
          description: m.description,
          points: m.pointsReward,
          competencyRequirements: m.competencyRequirement,
        })),
      },
      assignment: {
        id: assignmentId,
        title: assignmentData.title,
        originalFilename: assignmentData.originalFilename,
        analysisStatus: "complete",
      },
    });
  } catch (error) {
    console.error("Assignment analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Text extraction functions
async function extractTextFromPDF(filePath: string): Promise<string> {
  // For now, return a placeholder - PDF processing would need to be implemented
  // with a server-side PDF library or external service
  return "PDF text extraction not implemented yet. Please use text files or images for now.";
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const {
    data: { text },
  } = await Tesseract.recognize(filePath, "eng", {
    logger: (m) => console.log(m),
  });
  return text;
}
