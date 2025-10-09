import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChallengeGenerationRequest {
  concepts: string[];
  difficulty: string;
  category: string;
  subcategory?: string;
  timeLimit?: number;
  language?: string;
  userId?: string;
}

interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  subcategory: string;
  points: number;
  timeLimit: number;
  memoryLimit: number;
  prerequisites: string[];
  tags: string[];
  starterCode: Record<string, string>;
  testCases: Array<{
    input: any;
    expectedOutput: any;
    description: string;
    isHidden: boolean;
  }>;
  expectedOutput: string;
  hints: string[];
  solution: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChallengeGenerationRequest = await request.json();
    const {
      concepts,
      difficulty,
      category,
      subcategory,
      timeLimit,
      language = "javascript",
      userId,
    } = body;

    // Validate required fields
    if (!concepts || !difficulty || !category) {
      return NextResponse.json(
        { error: "Missing required fields: concepts, difficulty, category" },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "data-structures",
      "algorithms",
      "web-dev",
      "database",
      "system-design",
      "machine-learning",
      "security",
      "mobile-dev",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Get Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Generate challenge using AI
    const generatedChallenge = await generateChallengeWithAI({
      concepts,
      difficulty,
      category,
      subcategory,
      timeLimit,
      language,
    });

    return NextResponse.json({
      success: true,
      challenge: generatedChallenge,
      message: "Challenge generated successfully",
    });
  } catch (error) {
    console.error("Challenge generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateChallengeWithAI(
  params: ChallengeGenerationRequest
): Promise<GeneratedChallenge> {
  const geminiApiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

  const prompt = `
You are an expert programming instructor and challenge creator. Generate a comprehensive programming challenge based on the following requirements:

Concepts: ${params.concepts.join(", ")}
Difficulty: ${params.difficulty}
Category: ${params.category}
Subcategory: ${params.subcategory || "general"}
Time Limit: ${params.timeLimit || "no limit"}
Language: ${params.language}

Please create a JSON response with the following structure:

{
  "title": "Challenge Title",
  "description": "Detailed problem description with examples and constraints",
  "difficulty": "${params.difficulty}",
  "category": "${params.category}",
  "subcategory": "${params.subcategory || "general"}",
  "points": 100,
  "timeLimit": ${params.timeLimit || 300},
  "memoryLimit": 256,
  "prerequisites": ["concept1", "concept2"],
  "tags": ["tag1", "tag2", "tag3"],
  "starterCode": {
    "javascript": "function solution() {\n  // Your code here\n}",
    "python": "def solution():\n    # Your code here\n    pass",
    "java": "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}"
  },
  "testCases": [
    {
      "input": "example input",
      "expectedOutput": "expected output",
      "description": "Test case description",
      "isHidden": false
    }
  ],
  "expectedOutput": "Expected output format description",
  "hints": [
    "Hint 1: Think about the approach",
    "Hint 2: Consider edge cases",
    "Hint 3: Optimize your solution"
  ],
  "solution": "Complete solution code"
}

Requirements:
1. Make the challenge appropriate for ${params.difficulty} level
2. Focus on the concepts: ${params.concepts.join(", ")}
3. Include 3-5 test cases with at least 2 hidden
4. Provide starter code for multiple languages
5. Make the description clear and engaging
6. Include helpful hints that guide without giving away the solution
7. Ensure the challenge is solvable within the time limit
8. Make it educational and practical

Generate a challenging but fair programming problem that tests the specified concepts.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Parse the JSON response
    const challengeData = JSON.parse(content);

    // Validate the generated challenge
    if (
      !challengeData.title ||
      !challengeData.description ||
      !challengeData.testCases
    ) {
      throw new Error("Invalid challenge generated");
    }

    return challengeData as GeneratedChallenge;
  } catch (error) {
    console.error("AI challenge generation error:", error);

    // Fallback to a basic challenge template
    return generateFallbackChallenge(params);
  }
}

function generateFallbackChallenge(
  params: ChallengeGenerationRequest
): GeneratedChallenge {
  const difficultyPoints = {
    beginner: 50,
    intermediate: 100,
    advanced: 200,
    expert: 300,
  };

  const difficultyTimeLimit = {
    beginner: 300,
    intermediate: 600,
    advanced: 1200,
    expert: 1800,
  };

  return {
    title: `${params.concepts[0]} Challenge`,
    description: `Implement a solution for the ${
      params.concepts[0]
    } problem. This challenge focuses on ${params.concepts.join(
      ", "
    )} concepts.`,
    difficulty: params.difficulty,
    category: params.category,
    subcategory: params.subcategory || "general",
    points:
      difficultyPoints[params.difficulty as keyof typeof difficultyPoints],
    timeLimit:
      params.timeLimit ||
      difficultyTimeLimit[
        params.difficulty as keyof typeof difficultyTimeLimit
      ],
    memoryLimit: 256,
    prerequisites: params.concepts.slice(0, 2),
    tags: params.concepts,
    starterCode: {
      javascript:
        "function solution() {\n  // Your code here\n  return null;\n}",
      python: "def solution():\n    # Your code here\n    pass",
      java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
    },
    testCases: [
      {
        input: "example input",
        expectedOutput: "expected output",
        description: "Basic test case",
        isHidden: false,
      },
      {
        input: "hidden input",
        expectedOutput: "hidden output",
        description: "Hidden test case",
        isHidden: true,
      },
    ],
    expectedOutput: "Return the expected result",
    hints: [
      "Think about the problem step by step",
      "Consider edge cases",
      "Optimize your solution for efficiency",
    ],
    solution: "// Complete solution would be provided here",
  };
}
