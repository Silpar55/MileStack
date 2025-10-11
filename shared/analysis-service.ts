export interface AnalysisResult {
  concepts: string[];
  languages: string[];
  difficulty: number; // This will be mapped from difficulty_score
  prerequisites: string[];
  estimated_hours: number;
  milestones: {
    title: string;
    description: string;
    competency_check: string;
    points_reward: number;
  }[];
}

import { aiAgentClient } from "./ai-agent-client";

export const analyzeAssignmentWithAI = async (
  assignmentData: {
    title: string;
    description?: string;
    courseName?: string;
    extractedText?: string;
    lyzrAssetIds?: string[];
  },
  userId?: string
): Promise<AnalysisResult> => {
  console.log("AI analysis requested for assignment:", assignmentData.title);
  console.log("Text length:", assignmentData.extractedText?.length || 0);

  // Use AI agent for assignment analysis - no fallback
  const analysisResult = await aiAgentClient.analyzeAssignment(
    assignmentData,
    userId
  );
  console.log("AI agent analysis completed successfully:", analysisResult);
  return analysisResult;
};

// Mock analysis functions removed - now using AI agent exclusively
