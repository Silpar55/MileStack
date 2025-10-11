interface AIAgentRequest {
  user_id: string;
  agent_id: string;
  session_id: string;
  message: string;
}

interface AIAgentResponse {
  response: string;
  session_id: string;
  status: string;
}

interface AIAgentConfig {
  baseUrl: string;
  apiKey: string;
  agentId: string;
}

class AIAgentClient {
  private config: AIAgentConfig;

  constructor() {
    this.config = {
      baseUrl: "https://agent-prod.studio.lyzr.ai/v3/inference/chat/",
      apiKey: process.env.AI_AGENTS_API_KEY || "",
      agentId: "68e96580de8385f5b42ddf19",
    };

    if (!this.config.apiKey) {
      console.error("AI_AGENTS_API_KEY environment variable is not set");
    }
  }

  async sendMessage(
    message: string,
    userId: string = "milestack-user",
    sessionId?: string
  ): Promise<AIAgentResponse> {
    if (!this.config.apiKey) {
      throw new Error("AI agent API key not configured");
    }

    const requestBody: AIAgentRequest = {
      user_id: userId,
      agent_id: this.config.agentId,
      session_id: sessionId || `${this.config.agentId}-${Date.now()}`,
      message: message,
    };

    try {
      const response = await fetch(this.config.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `AI agent request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      if (data.response) {
        return {
          response: data.response,
          session_id: data.session_id || requestBody.session_id,
          status: data.status || "success",
        };
      } else if (data.message) {
        return {
          response: data.message,
          session_id: data.session_id || requestBody.session_id,
          status: data.status || "success",
        };
      } else {
        // Fallback: try to extract response from any text field
        const responseText = data.text || data.content || JSON.stringify(data);
        return {
          response: responseText,
          session_id: requestBody.session_id,
          status: "success",
        };
      }
    } catch (error) {
      console.error("AI agent request error:", error);
      throw new Error(
        `Failed to communicate with AI agent: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async sendPDFMessage(
    message: string,
    pdfBuffer: Buffer,
    userId: string = "milestack-user",
    sessionId?: string,
    assignmentTitle?: string,
    courseName?: string
  ): Promise<AIAgentResponse> {
    if (!this.config.apiKey) {
      throw new Error("AI agent API key not configured");
    }

    try {
      console.log("Sending PDF file directly to AI agent...");
      console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);

      // Create FormData to send the PDF file
      const formData = new FormData();

      // Create a Blob from the PDF buffer
      const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
        type: "application/pdf",
      });
      formData.append("file", pdfBlob, "assignment.pdf");

      // Add simple message
      formData.append("message", message);
      formData.append("user_id", userId);
      formData.append("agent_id", this.config.agentId);
      formData.append(
        "session_id",
        sessionId || `${this.config.agentId}-${Date.now()}`
      );

      const response = await fetch(this.config.baseUrl, {
        method: "POST",
        headers: {
          "x-api-key": this.config.apiKey,
          // Don't set Content-Type, let fetch set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(
          `PDF upload failed: ${response.status} ${response.statusText}`
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `AI agent PDF upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      if (data.response) {
        return {
          response: data.response,
          session_id:
            data.session_id ||
            sessionId ||
            `${this.config.agentId}-${Date.now()}`,
          status: data.status || "success",
        };
      } else if (data.message) {
        return {
          response: data.message,
          session_id:
            data.session_id ||
            sessionId ||
            `${this.config.agentId}-${Date.now()}`,
          status: data.status || "success",
        };
      } else {
        throw new Error("Unexpected response format from AI agent");
      }
    } catch (error) {
      console.error("Error sending PDF to AI agent:", error);
      throw new Error(
        `Failed to send PDF to AI agent: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async analyzeAssignment(
    assignmentData: {
      title: string;
      description?: string;
      courseName?: string;
      extractedText?: string;
      lyzrAssetIds?: string[];
    },
    userId: string = "milestack-user"
  ): Promise<any> {
    console.log("=== AI AGENT DEBUG INFO ===");
    console.log("Assignment Title:", assignmentData.title);
    console.log("Course Name:", assignmentData.courseName);
    console.log("Description:", assignmentData.description);
    console.log("Has Lyzr Asset IDs:", !!assignmentData.lyzrAssetIds);
    console.log("Lyzr Asset IDs:", assignmentData.lyzrAssetIds);
    console.log("Has Extracted Text:", !!assignmentData.extractedText);
    console.log(
      "Extracted Text Length:",
      assignmentData.extractedText?.length || 0
    );
    console.log("User ID:", userId);
    console.log("=============================");

    let prompt: string;

    if (assignmentData.lyzrAssetIds && assignmentData.lyzrAssetIds.length > 0) {
      // For files uploaded to Lyzr assets, send asset IDs to AI agent
      prompt = "Give me the milestones";
    } else if (assignmentData.extractedText) {
      // Check if this is a PDF placeholder (indicating PDF extraction is not available)
      const isPDFPlaceholder = assignmentData.extractedText.includes(
        "ASSIGNMENT PDF UPLOADED"
      );

      if (isPDFPlaceholder) {
        // For PDF placeholders, create a more focused prompt based on title and course
        prompt = `You are an expert programming instructor creating learning milestones for a programming assignment. Since this is a PDF assignment, please analyze the assignment title and course information to generate appropriate milestones.

ASSIGNMENT DETAILS:
- Title: ${assignmentData.title}
- Course: ${assignmentData.courseName || "Not specified"}

INSTRUCTIONS:
Based on the assignment title "${assignmentData.title}"${
          assignmentData.courseName
            ? ` and course "${assignmentData.courseName}"`
            : ""
        }, please:

1. Identify the most likely programming language/framework:
   - Look for keywords in the title (Swift, SwiftUI, React, Python, Java, JavaScript, etc.)
   - Consider the course name for context
   - If uncertain, make a reasonable assumption based on common assignment patterns

2. Create 4-6 comprehensive learning milestones that:
   - Are specific to the identified technology stack
   - Follow a logical learning progression from basics to advanced concepts
   - Include both theoretical understanding and practical implementation
   - Cover fundamental concepts for that technology
   - Are achievable and well-defined

3. Return your response in the milestone_generation_output schema format with:
   - core_milestones: Main milestones for the assignment
   - custom_milestones: Additional advanced milestones (optional)

Focus on creating technology-specific milestones that would be relevant for this type of assignment.`;
      } else {
        // For actual text content, use the original comprehensive prompt
        prompt = `You are an expert programming instructor analyzing a programming assignment. Please read the assignment content carefully and in detail to provide comprehensive learning milestones.

ASSIGNMENT DETAILS:
- Title: ${assignmentData.title}
- Course: ${assignmentData.courseName || "Not specified"}
- Description: ${
          assignmentData.description || "No additional description provided"
        }

ASSIGNMENT CONTENT:
${assignmentData.extractedText}

INSTRUCTIONS:
1. Read the assignment content carefully and identify:
   - The programming language(s) used (e.g., Swift, Python, Java, JavaScript, etc.)
   - The framework(s) or technology stack (e.g., SwiftUI, React, Django, etc.)
   - Key concepts and topics covered
   - Specific requirements and deliverables
   - Difficulty level and complexity

2. Create appropriate learning milestones that:
   - Are specific to the identified programming language/framework
   - Follow a logical learning progression
   - Include both theoretical understanding and practical implementation
   - Cover all major concepts mentioned in the assignment
   - Are achievable and well-defined

3. Return your response in the milestone_generation_output schema format with:
   - core_milestones: Required milestones based on the assignment content
   - custom_milestones: Additional milestones for deeper learning (if applicable)

Focus on creating milestones that are specific to the technology and concepts in the assignment, not generic programming milestones.`;
      }
    } else {
      // Last resort - title-based analysis
      prompt = `Create milestones for this assignment based on the title and course information.

Assignment: ${assignmentData.title}
Course: ${assignmentData.courseName || "Not specified"}

Please provide milestones in the milestone_generation_output format.`;
    }

    console.log("Full Prompt Being Sent:", prompt);

    try {
      let response: AIAgentResponse;

      if (
        assignmentData.lyzrAssetIds &&
        assignmentData.lyzrAssetIds.length > 0
      ) {
        // Send Lyzr asset IDs to AI agent
        console.log("Sending Lyzr asset IDs to AI agent...");
        console.log("Asset IDs:", assignmentData.lyzrAssetIds);

        // Create JSON payload with asset IDs
        const requestBody = {
          user_id: userId,
          agent_id: this.config.agentId,
          session_id: `${this.config.agentId}-${Date.now()}`,
          message: prompt,
          assets: assignmentData.lyzrAssetIds,
          assignment_title: assignmentData.title,
          course_name: assignmentData.courseName || "Not specified",
        };

        const response_data = await fetch(this.config.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response_data.ok) {
          console.error(
            `Lyzr asset request failed: ${response_data.status} ${response_data.statusText}`
          );
          const errorText = await response_data.text();
          console.error("Error response:", errorText);
          throw new Error(
            `AI agent Lyzr asset request failed: ${response_data.status} ${response_data.statusText}`
          );
        }

        const data = await response_data.json();

        // Handle different response formats
        if (data.response) {
          response = {
            response: data.response,
            session_id:
              data.session_id || `${this.config.agentId}-${Date.now()}`,
            status: data.status || "success",
          };
        } else if (data.message) {
          response = {
            response: data.message,
            session_id:
              data.session_id || `${this.config.agentId}-${Date.now()}`,
            status: data.status || "success",
          };
        } else {
          throw new Error("Unexpected response format from AI agent");
        }
      } else {
        // Send regular text message
        response = await this.sendMessage(prompt, userId);
      }

      // Debug: Log the raw response
      console.log("AI Agent Raw Response:", response.response);

      // Try to parse the response as JSON
      let analysisResult;
      try {
        analysisResult = JSON.parse(response.response);
        console.log(
          "AI Agent Parsed JSON:",
          JSON.stringify(analysisResult, null, 2)
        );
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Raw response that failed to parse:", response.response);

        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysisResult = JSON.parse(jsonMatch[0]);
            console.log(
              "AI Agent Parsed JSON (extracted):",
              JSON.stringify(analysisResult, null, 2)
            );
          } catch (extractError) {
            throw new Error(
              `Could not parse JSON from AI agent response: ${extractError}`
            );
          }
        } else {
          throw new Error("Could not find JSON in AI agent response");
        }
      }

      // Validate the response structure
      if (
        !analysisResult.core_milestones ||
        !Array.isArray(analysisResult.core_milestones)
      ) {
        console.error(
          "Invalid structure - analysisResult:",
          JSON.stringify(analysisResult, null, 2)
        );
        throw new Error(
          "Invalid analysis result structure from AI agent - missing core_milestones array"
        );
      }

      // Transform the AI agent response to match our expected format
      return this.transformAnalysisResult(analysisResult);
    } catch (error) {
      console.error("Assignment analysis error:", error);
      throw error;
    }
  }

  private transformAnalysisResult(agentResult: any) {
    console.log(
      "Transforming AI Agent Result:",
      JSON.stringify(agentResult, null, 2)
    );

    // Combine core and custom milestones
    const allMilestones = [
      ...(agentResult.core_milestones || []),
      ...(agentResult.custom_milestones || []),
    ];

    console.log("All Milestones:", JSON.stringify(allMilestones, null, 2));

    // Extract unique concepts from all milestones
    const allConcepts = new Set<string>();
    allMilestones.forEach((milestone: any) => {
      if (milestone.key_concepts && Array.isArray(milestone.key_concepts)) {
        milestone.key_concepts.forEach((concept: string) =>
          allConcepts.add(concept)
        );
      }
    });

    // Transform milestones to our expected format
    const transformedMilestones = allMilestones.map(
      (milestone: any, index: number) => ({
        title: milestone.title || `Milestone ${index + 1}`,
        description: milestone.description || "Complete this milestone",
        competency_check: this.generateCompetencyCheck(milestone),
        points_reward: this.calculatePointsReward(milestone, index),
      })
    );

    // Generate difficulty based on milestone complexity
    const difficulty = this.calculateDifficulty(allMilestones);

    // Estimate hours based on number and complexity of milestones
    const estimated_hours = Math.max(
      2,
      Math.min(8, transformedMilestones.length * 1.5)
    );

    // Use the AI agent's actual response instead of hardcoded values
    const finalResult = {
      concepts: Array.from(allConcepts),
      languages: agentResult.languages || ["Unknown"], // Use AI agent's languages
      difficulty: agentResult.difficulty_score || difficulty, // Use AI agent's difficulty_score
      prerequisites: agentResult.prerequisites || ["Unknown prerequisites"], // Use AI agent's prerequisites
      estimated_hours: estimated_hours,
      milestones: transformedMilestones,
    };

    console.log(
      "Final Transformed Result:",
      JSON.stringify(finalResult, null, 2)
    );
    return finalResult;
  }

  private generateCompetencyCheck(milestone: any): string {
    if (milestone.type === "code") {
      return "Demonstrate working code that solves the problem";
    } else if (milestone.type === "user_customized") {
      return "Complete the custom milestone as specified";
    } else {
      return "Explain your understanding and approach";
    }
  }

  private calculatePointsReward(milestone: any, index: number): number {
    // Base points on milestone type and order
    if (milestone.type === "code") {
      return Math.min(25, 15 + index * 2);
    } else if (milestone.type === "user_customized") {
      return 20;
    } else {
      return Math.min(20, 10 + index * 2);
    }
  }

  private calculateDifficulty(milestones: any[]): number {
    // Calculate difficulty based on milestone types and concepts
    let complexityScore = 0;

    milestones.forEach((milestone) => {
      if (milestone.type === "code") {
        complexityScore += 2;
      } else if (milestone.type === "user_customized") {
        complexityScore += 1.5;
      } else {
        complexityScore += 1;
      }

      if (milestone.key_concepts && milestone.key_concepts.length > 3) {
        complexityScore += 0.5;
      }
    });

    // Convert to 1-10 scale
    return Math.max(1, Math.min(10, Math.round(complexityScore)));
  }

  async gradeMilestone(
    context: {
      assignmentTitle: string;
      milestoneTitle: string;
      competencyRequirement: string;
      expectedConcepts: string[];
      studentAnswer: string;
      attemptNumber: number;
    },
    userId: string = "milestack-user"
  ): Promise<any> {
    const prompt = `
Please grade this student's milestone response. Return ONLY valid JSON in this exact format:

{
  "context_relevance_score": 85,
  "understanding_depth_score": 80,
  "completeness_score": 75,
  "final_score": 80,
  "passed": true,
  "feedback_type": "good_progress",
  "concepts_identified": ["concept1", "concept2"],
  "detailed_feedback": {
    "context_feedback": "Good understanding of the assignment context and requirements.",
    "understanding_feedback": "Your response shows good understanding of the concepts.",
    "completeness_feedback": "Your response covers the key points well.",
    "suggestions": ["Great work! You're ready for the next milestone."],
    "encouragement": "Excellent progress! Keep up the great work."
  },
  "improvement_suggestions": ["Continue building on this understanding for the next milestone."],
  "learning_indicators": {
    "concept_grasp": "solid",
    "application_skill": "intermediate",
    "critical_thinking": "developing"
  },
  "next_steps": ["Move on to the next milestone", "Apply this understanding to practice problems"]
}

Grading Context:
- Assignment: ${context.assignmentTitle}
- Milestone: ${context.milestoneTitle}
- Competency Requirement: ${context.competencyRequirement}
- Expected Concepts: ${context.expectedConcepts.join(", ")}
- Student Answer: ${context.studentAnswer}
- Attempt Number: ${context.attemptNumber}

Grading Criteria:
- Context Relevance (40% weight): Does the response address the assignment requirements?
- Understanding Depth (35% weight): Does it show understanding of the concepts?
- Completeness (25% weight): Does it cover the key points?
- Pass if final_score >= 70 AND context_relevance_score >= 60

Return ONLY JSON, no markdown formatting.
`;

    try {
      const response = await this.sendMessage(prompt, userId);

      // Try to parse the response as JSON
      let gradingResult;
      try {
        gradingResult = JSON.parse(response.response);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          gradingResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse JSON from AI agent response");
        }
      }

      // Validate the response structure
      if (
        typeof gradingResult.final_score !== "number" ||
        typeof gradingResult.passed !== "boolean"
      ) {
        throw new Error("Invalid grading result structure from AI agent");
      }

      return gradingResult;
    } catch (error) {
      console.error("Milestone grading error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiAgentClient = new AIAgentClient();
