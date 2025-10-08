import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalysis,
  learningMilestones,
} from "@/shared/schema-assignments";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIAnalysisResult {
  concepts: string[];
  skills: string[];
  difficultyLevel: number;
  estimatedTimeHours: number;
  prerequisites: string[];
  learningGaps: string[];
  milestones: {
    title: string;
    description: string;
    points: number;
    competencyRequirements: string[];
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { assignmentId } = await request.json();

    if (!assignmentId) {
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

    // Update status to processing
    await db
      .update(assignments)
      .set({ analysisStatus: "processing" })
      .where(eq(assignments.id, assignmentId));

    // Use the extracted text from the assignment
    let extractedText = assignmentData.extractedText || "";

    // If no text was extracted, provide a fallback message
    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `Assignment: ${assignmentData.title}\n\nNo readable text could be extracted from the uploaded file. Please ensure the file contains text and try uploading again.`;
      console.warn(`No text extracted for assignment ${assignmentId}`);
    }

    // Perform AI analysis
    let analysisResult: AIAnalysisResult;

    try {
      analysisResult = await performAIAnalysis(
        extractedText,
        assignmentData.title
      );
    } catch (error) {
      console.error("AI analysis error:", error);
      // Fallback to basic analysis
      analysisResult = await performBasicAnalysis(
        extractedText,
        assignmentData.title
      );
    }

    // Save analysis results
    const analysis = await db
      .insert(assignmentAnalysis)
      .values({
        assignmentId,
        concepts: analysisResult.concepts,
        languages: ["python", "javascript"], // Default languages
        difficultyScore: Math.min(
          Math.max(analysisResult.difficultyLevel, 1),
          10
        ) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        prerequisites: analysisResult.prerequisites,
        estimatedTimeHours: analysisResult.estimatedTimeHours.toString(),
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
          competencyRequirement: milestone.competencyRequirements.join(", "),
          pointsReward: milestone.points,
          status: "locked", // Will be unlocked as user progresses
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
        skills: analysisResult.skills,
        difficultyLevel: analysisResult.difficultyLevel,
        estimatedTimeHours: analysisResult.estimatedTimeHours,
        prerequisites: analysisResult.prerequisites,
        learningGaps: analysisResult.learningGaps,
      },
      pathway: {
        id: assignmentId, // Use assignment ID as pathway ID
        totalPoints,
        milestones: milestones.map((m) => ({
          title: m.title,
          description: m.description,
          points: m.pointsReward,
          competencyRequirements: m.competencyRequirement.split(", "),
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

// AI Analysis functions
async function performAIAnalysis(
  text: string,
  title: string
): Promise<AIAnalysisResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert programming instructor and learning pathway designer. Analyze assignments and create structured learning experiences.

Analyze this programming assignment and provide a comprehensive learning pathway:

Assignment Title: ${title}
Assignment Content: ${text.substring(0, 4000)}...

Please provide a JSON response with the following structure:
{
  "concepts": ["array", "loops", "functions", "object-oriented programming"],
  "skills": ["problem solving", "debugging", "code organization"],
  "difficultyLevel": 7,
  "estimatedTimeHours": 12.5,
  "prerequisites": ["basic programming", "data types", "control structures"],
  "learningGaps": ["advanced algorithms", "design patterns"],
  "milestones": [
    {
      "title": "Understand the Problem",
      "description": "Analyze requirements and break down the problem",
      "points": 5,
      "competencyRequirements": ["problem analysis", "requirement understanding"]
    },
    {
      "title": "Design the Solution",
      "description": "Create algorithm and data structure design",
      "points": 15,
      "competencyRequirements": ["algorithm design", "data structure selection"]
    },
    {
      "title": "Implement Core Logic",
      "description": "Write the main functionality",
      "points": 25,
      "competencyRequirements": ["coding", "syntax", "logic implementation"]
    },
    {
      "title": "Test and Debug",
      "description": "Ensure code works correctly",
      "points": 15,
      "competencyRequirements": ["testing", "debugging", "error handling"]
    },
    {
      "title": "Optimize and Document",
      "description": "Improve performance and add documentation",
      "points": 10,
      "competencyRequirements": ["optimization", "documentation", "code review"]
    }
  ]
}

Focus on programming concepts, difficulty assessment (1-10 scale), and create 3-5 meaningful milestones with point values that total to 70 points.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return JSON.parse(content);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get AI analysis from Gemini");
  }
}

async function performBasicAnalysis(
  text: string,
  title: string
): Promise<AIAnalysisResult> {
  // Basic keyword-based analysis as fallback
  const programmingKeywords = [
    "function",
    "class",
    "method",
    "variable",
    "array",
    "loop",
    "condition",
    "algorithm",
    "data structure",
    "recursion",
    "iteration",
    "object",
    "inheritance",
    "polymorphism",
    "encapsulation",
    "abstraction",
  ];

  const concepts = programmingKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  const difficultyKeywords = {
    beginner: ["print", "input", "variable", "if", "for", "while"],
    intermediate: ["function", "class", "array", "list", "dictionary"],
    advanced: [
      "algorithm",
      "recursion",
      "inheritance",
      "polymorphism",
      "design pattern",
    ],
  };

  let difficultyLevel = 3; // Default to beginner
  if (
    concepts.some((concept) => difficultyKeywords.advanced.includes(concept))
  ) {
    difficultyLevel = 8;
  } else if (
    concepts.some((concept) =>
      difficultyKeywords.intermediate.includes(concept)
    )
  ) {
    difficultyLevel = 5;
  }

  return {
    concepts: concepts.slice(0, 10), // Limit to 10 concepts
    skills: ["problem solving", "coding", "debugging"],
    difficultyLevel,
    estimatedTimeHours: difficultyLevel * 1.5,
    prerequisites: ["basic programming", "data types"],
    learningGaps: ["advanced concepts"],
    milestones: [
      {
        title: "Understand Requirements",
        description: "Analyze the assignment requirements",
        points: 10,
        competencyRequirements: [
          "reading comprehension",
          "requirement analysis",
        ],
      },
      {
        title: "Plan Solution",
        description: "Design the approach and algorithm",
        points: 20,
        competencyRequirements: ["algorithm design", "problem decomposition"],
      },
      {
        title: "Implement Code",
        description: "Write the programming solution",
        points: 30,
        competencyRequirements: ["coding", "syntax", "logic"],
      },
      {
        title: "Test and Refine",
        description: "Test the solution and fix issues",
        points: 10,
        competencyRequirements: ["testing", "debugging"],
      },
    ],
  };
}
