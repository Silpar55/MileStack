import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import {
  assignments,
  assignmentAnalyses,
  learningPathways,
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
      .set({ status: "processing" })
      .where(eq(assignments.id, assignmentId));

    // Extract text based on file type
    let extractedText = "";

    try {
      switch (assignmentData.mimeType) {
        case "application/pdf":
          extractedText = await extractTextFromPDF(assignmentData.filePath);
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword":
          extractedText = await extractTextFromDOCX(assignmentData.filePath);
          break;
        case "text/plain":
          extractedText = await readFile(assignmentData.filePath, "utf-8");
          break;
        case "image/jpeg":
        case "image/png":
        case "image/gif":
        case "image/bmp":
        case "image/tiff":
          extractedText = await extractTextFromImage(assignmentData.filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${assignmentData.mimeType}`);
      }
    } catch (error) {
      console.error("Text extraction error:", error);
      await db
        .update(assignments)
        .set({ status: "error" })
        .where(eq(assignments.id, assignmentId));

      return NextResponse.json(
        { error: "Failed to extract text from file" },
        { status: 500 }
      );
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
      .insert(assignmentAnalyses)
      .values({
        assignmentId,
        extractedText,
        concepts: analysisResult.concepts,
        skills: analysisResult.skills,
        difficultyLevel: analysisResult.difficultyLevel,
        estimatedTimeHours: analysisResult.estimatedTimeHours.toString(),
        prerequisites: analysisResult.prerequisites,
        learningGaps: analysisResult.learningGaps,
        aiAnalysisMetadata: {
          timestamp: new Date().toISOString(),
          model: "gemini-1.5-flash",
          version: "1.0",
        },
      })
      .returning();

    // Create learning pathway
    const pathway = await db
      .insert(learningPathways)
      .values({
        assignmentId,
        userId: assignmentData.userId,
        title: `Learning Path: ${assignmentData.title}`,
        description: `Personalized learning pathway for ${assignmentData.title}`,
        totalPoints: analysisResult.milestones.reduce(
          (sum, milestone) => sum + milestone.points,
          0
        ),
        estimatedDuration: Math.ceil(analysisResult.estimatedTimeHours / 2), // 2 hours per day
        difficultyLevel: analysisResult.difficultyLevel,
      })
      .returning();

    // Create learning milestones
    const milestones = [];
    for (let i = 0; i < analysisResult.milestones.length; i++) {
      const milestone = analysisResult.milestones[i];
      const createdMilestone = await db
        .insert(learningMilestones)
        .values({
          pathwayId: pathway[0].id,
          title: milestone.title,
          description: milestone.description,
          points: milestone.points,
          order: i + 1,
          competencyRequirements: milestone.competencyRequirements,
          resources: [], // Will be populated later
        })
        .returning();
      milestones.push(createdMilestone[0]);
    }

    // Update assignment status to analyzed
    await db
      .update(assignments)
      .set({ status: "analyzed" })
      .where(eq(assignments.id, assignmentId));

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis[0].id,
        concepts: analysisResult.concepts,
        skills: analysisResult.skills,
        difficultyLevel: analysisResult.difficultyLevel,
        estimatedTimeHours: analysisResult.estimatedTimeHours,
        prerequisites: analysisResult.prerequisites,
        learningGaps: analysisResult.learningGaps,
      },
      pathway: {
        id: pathway[0].id,
        title: pathway[0].title,
        totalPoints: pathway[0].totalPoints,
        estimatedDuration: pathway[0].estimatedDuration,
        milestones: milestones.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          points: m.points,
          order: m.order,
          competencyRequirements: m.competencyRequirements,
        })),
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
