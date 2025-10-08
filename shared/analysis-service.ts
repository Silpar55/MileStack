import { getGeminiModel } from "./gemini-client";

export interface AnalysisResult {
  concepts: string[];
  languages: string[];
  difficulty: number;
  prerequisites: string[];
  estimated_hours: number;
  milestones: {
    title: string;
    description: string;
    competency_check: string;
    points_reward: number;
  }[];
}

export const analyzeAssignmentWithGemini = async (
  extractedText: string
): Promise<AnalysisResult> => {
  try {
    const model = getGeminiModel();

    const prompt = `
  Analyze this programming assignment and return ONLY valid JSON in this exact format:
  {
    "concepts": ["concept1", "concept2"],
    "languages": ["python"],
    "difficulty": 6,
    "prerequisites": ["prereq1", "prereq2"], 
    "estimated_hours": 4.5,
    "milestones": [
      {
        "title": "Understand Problem Requirements",
        "description": "Learn and demonstrate understanding of core concepts",
        "competency_check": "Explain the problem in your own words",
        "points_reward": 10
      }
    ]
  }
  
  Assignment text: ${extractedText}
  
  Rules:
  - Max 5 concepts
  - Difficulty 1-10 scale
  - 3-5 milestones total
  - Points: 10, 15, 20, or 25 for milestones
  - Return ONLY JSON, no markdown formatting
  - No code examples in milestones
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return getMockAnalysis(extractedText);
  }
};

const getMockAnalysis = (text: string): AnalysisResult => {
  if (
    text.toLowerCase().includes("binary search tree") ||
    text.toLowerCase().includes("bst")
  ) {
    return {
      concepts: ["binary trees", "recursion", "data structures"],
      languages: ["python"],
      difficulty: 6,
      prerequisites: ["basic programming", "recursion basics"],
      estimated_hours: 4.5,
      milestones: [
        {
          title: "Understand Tree Concepts",
          description:
            "Learn binary search tree properties and traversal methods",
          competency_check: "Explain BST ordering and traversal types",
          points_reward: 10,
        },
        {
          title: "Implement Basic Structure",
          description: "Create TreeNode class and basic tree operations",
          competency_check: "Code a TreeNode class with insert method",
          points_reward: 15,
        },
        {
          title: "Add Search Functionality",
          description: "Implement search and traversal methods",
          competency_check: "Demonstrate search algorithm understanding",
          points_reward: 20,
        },
      ],
    };
  }

  if (
    text.toLowerCase().includes("sorting") ||
    text.toLowerCase().includes("sort")
  ) {
    return {
      concepts: ["algorithms", "sorting", "arrays"],
      languages: ["python"],
      difficulty: 5,
      prerequisites: ["basic programming", "arrays"],
      estimated_hours: 3.5,
      milestones: [
        {
          title: "Understand Sorting Concepts",
          description:
            "Learn different sorting algorithms and their complexity",
          competency_check: "Explain time complexity of sorting algorithms",
          points_reward: 10,
        },
        {
          title: "Implement Basic Sort",
          description: "Code bubble sort or selection sort",
          competency_check: "Implement a working sorting algorithm",
          points_reward: 15,
        },
        {
          title: "Optimize Performance",
          description: "Implement more efficient sorting algorithms",
          competency_check: "Compare algorithm performance",
          points_reward: 20,
        },
      ],
    };
  }

  if (
    text.toLowerCase().includes("recursion") ||
    text.toLowerCase().includes("recursive")
  ) {
    return {
      concepts: ["recursion", "algorithms", "problem solving"],
      languages: ["python"],
      difficulty: 7,
      prerequisites: ["functions", "basic programming"],
      estimated_hours: 5.0,
      milestones: [
        {
          title: "Understand Recursion",
          description: "Learn recursive thinking and base cases",
          competency_check: "Identify base cases in recursive problems",
          points_reward: 10,
        },
        {
          title: "Implement Recursive Functions",
          description: "Write recursive solutions to problems",
          competency_check: "Code recursive functions correctly",
          points_reward: 20,
        },
        {
          title: "Optimize Recursion",
          description: "Learn about tail recursion and memoization",
          competency_check: "Apply optimization techniques",
          points_reward: 15,
        },
      ],
    };
  }

  // Default mock analysis for general programming assignments
  return {
    concepts: ["programming fundamentals", "problem solving", "algorithms"],
    languages: ["python"],
    difficulty: 4,
    prerequisites: ["basic programming", "data types"],
    estimated_hours: 3.0,
    milestones: [
      {
        title: "Understand Requirements",
        description: "Analyze the assignment requirements and constraints",
        competency_check: "Explain the problem in your own words",
        points_reward: 10,
      },
      {
        title: "Design Solution",
        description: "Plan the approach and algorithm for the solution",
        competency_check: "Outline your solution approach",
        points_reward: 15,
      },
      {
        title: "Implement Code",
        description: "Write the programming solution",
        competency_check: "Demonstrate working code",
        points_reward: 20,
      },
      {
        title: "Test and Debug",
        description: "Test the solution and fix any issues",
        competency_check: "Show test cases and debugging process",
        points_reward: 10,
      },
    ],
  };
};
