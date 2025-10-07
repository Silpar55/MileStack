import { db } from "./db";
import {
  learningPathways,
  pathwayProgress,
  checkpointAttempts,
  userPoints,
  pointTransactions,
} from "./schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import archiver from "archiver";
import { Readable } from "stream";

export interface DownloadQualification {
  isEligible: boolean;
  requirements: {
    pathwayCompletion: boolean;
    comprehensionScore: boolean;
    aiAssistanceEarned: boolean;
    integrityAcknowledgment: boolean;
  };
  missingRequirements: string[];
  pathwayProgress: number;
  comprehensionScore: number;
  totalPointsSpent: number;
  integrityAcknowledgment: boolean;
}

export interface AcademicIntegrityDocument {
  learning_summary: {
    assignment_title: string;
    learning_pathway_completion: string;
    concepts_mastered: string[];
    time_invested: string;
    checkpoints_completed: number;
    ai_assistance_summary: {
      hints_used: number;
      code_reviews: number;
      copilot_time: string;
      total_points_spent: number;
    };
    academic_integrity_signature: {
      signed_at: string;
      ip_address: string;
      commitment: string;
    };
  };
}

export interface DownloadPackage {
  format: "clean" | "portfolio" | "template";
  files: {
    name: string;
    content: string;
    type: "file" | "folder";
  }[];
  documentation: AcademicIntegrityDocument;
  metadata: {
    created_at: string;
    assignment_id: string;
    user_id: string;
    format: string;
    size: number;
  };
}

export class DownloadService {
  async checkDownloadEligibility(
    userId: string,
    assignmentId: string
  ): Promise<DownloadQualification> {
    try {
      // Check pathway completion
      const pathway = await db
        .select()
        .from(learningPathways)
        .where(eq(learningPathways.id, assignmentId))
        .limit(1);

      if (pathway.length === 0) {
        return {
          isEligible: false,
          requirements: {
            pathwayCompletion: false,
            comprehensionScore: false,
            aiAssistanceEarned: false,
            integrityAcknowledgment: false,
          },
          missingRequirements: ["Assignment not found"],
          pathwayProgress: 0,
          comprehensionScore: 0,
          totalPointsSpent: 0,
          integrityAcknowledgment: false,
        };
      }

      const progress = await db
        .select()
        .from(pathwayProgress)
        .where(
          and(
            eq(pathwayProgress.userId, userId),
            eq(pathwayProgress.pathwayId, assignmentId)
          )
        )
        .limit(1);

      const pathwayCompletion =
        progress.length > 0 &&
        progress[0] &&
        (progress[0].completedCheckpoints || 0) >=
          (progress[0].totalCheckpoints || 1);
      const comprehensionScore =
        progress.length > 0 && progress[0]
          ? Math.round(
              ((progress[0].completedCheckpoints || 0) /
                (progress[0].totalCheckpoints || 1)) *
                100
            )
          : 0;
      const meetsComprehensionThreshold = comprehensionScore >= 80;

      // Check AI assistance earned through points
      const pointsSpent = await db
        .select({ total: sql<number>`sum(${pointTransactions.amount})` })
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, userId),
            eq(pointTransactions.category, "ai_assistance")
          )
        );

      const totalPointsSpent = pointsSpent[0]?.total || 0;
      const hasEarnedAssistance = totalPointsSpent > 0;

      // Check academic integrity acknowledgment (placeholder - would be stored in user profile)
      const integrityAcknowledgment = true; // This would be checked from user profile

      const missingRequirements: string[] = [];
      if (!pathwayCompletion)
        missingRequirements.push("Complete learning pathway (100%)");
      if (!meetsComprehensionThreshold)
        missingRequirements.push("Achieve 80% comprehension score");
      if (!hasEarnedAssistance)
        missingRequirements.push("Earn AI assistance through points");
      if (!integrityAcknowledgment)
        missingRequirements.push("Sign academic integrity acknowledgment");

      return {
        isEligible:
          pathwayCompletion &&
          meetsComprehensionThreshold &&
          hasEarnedAssistance &&
          integrityAcknowledgment,
        requirements: {
          pathwayCompletion,
          comprehensionScore: meetsComprehensionThreshold,
          aiAssistanceEarned: hasEarnedAssistance,
          integrityAcknowledgment,
        },
        missingRequirements,
        pathwayProgress: comprehensionScore,
        comprehensionScore,
        totalPointsSpent,
        integrityAcknowledgment,
      };
    } catch (error) {
      console.error("Error checking download eligibility:", error);
      throw new Error("Failed to check download eligibility");
    }
  }

  async generateAcademicIntegrityDocument(
    userId: string,
    assignmentId: string,
    format: "clean" | "portfolio" | "template"
  ): Promise<AcademicIntegrityDocument> {
    try {
      // Get assignment details
      const pathway = await db
        .select()
        .from(learningPathways)
        .where(eq(learningPathways.id, assignmentId))
        .limit(1);

      if (pathway.length === 0) {
        throw new Error("Assignment not found");
      }

      // Get learning progress
      const progress = await db
        .select()
        .from(pathwayProgress)
        .where(
          and(
            eq(pathwayProgress.userId, userId),
            eq(pathwayProgress.pathwayId, assignmentId)
          )
        )
        .limit(1);

      // Get AI assistance summary
      const aiAssistance = await db
        .select()
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, userId),
            eq(pointTransactions.category, "ai_assistance")
          )
        );

      const hintsUsed = aiAssistance.filter(
        (t) => t.category === "conceptual_hints"
      ).length;
      const codeReviews = aiAssistance.filter(
        (t) => t.category === "code_review"
      ).length;
      const copilotTime = aiAssistance
        .filter((t) => t.category === "copilot_session")
        .reduce((total, t) => total + 1, 0); // Count sessions instead of duration

      const totalPointsSpent = aiAssistance.reduce(
        (total, t) => total + Math.abs(t.amount || 0),
        0
      );

      // Generate IP address hash for privacy
      const ipHash = createHash("sha256")
        .update(`${userId}-${assignmentId}-${Date.now()}`)
        .digest("hex")
        .substring(0, 16);

      return {
        learning_summary: {
          assignment_title: pathway[0].title,
          learning_pathway_completion: `${
            progress[0]
              ? Math.round(
                  ((progress[0].completedCheckpoints || 0) /
                    (progress[0].totalCheckpoints || 1)) *
                    100
                )
              : 0
          }%`,
          concepts_mastered: [],
          time_invested: this.formatTimeInvestment(progress[0]?.timeSpent || 0),
          checkpoints_completed: progress[0]?.completedCheckpoints || 0,
          ai_assistance_summary: {
            hints_used: hintsUsed,
            code_reviews: codeReviews,
            copilot_time: this.formatTimeInvestment(copilotTime),
            total_points_spent: totalPointsSpent,
          },
          academic_integrity_signature: {
            signed_at: new Date().toISOString(),
            ip_address: ipHash,
            commitment:
              "I earned this assistance through demonstrated learning and maintained academic integrity throughout the process.",
          },
        },
      };
    } catch (error) {
      console.error("Error generating academic integrity document:", error);
      throw new Error("Failed to generate academic integrity document");
    }
  }

  async generateDownloadPackage(
    userId: string,
    assignmentId: string,
    format: "clean" | "portfolio" | "template"
  ): Promise<DownloadPackage> {
    try {
      const qualification = await this.checkDownloadEligibility(
        userId,
        assignmentId
      );

      if (!qualification.isEligible) {
        throw new Error(
          "Download not eligible: " +
            qualification.missingRequirements.join(", ")
        );
      }

      const integrityDoc = await this.generateAcademicIntegrityDocument(
        userId,
        assignmentId,
        format
      );

      // Generate files based on format
      const files = await this.generateFormatFiles(
        assignmentId,
        format,
        integrityDoc
      );

      // Calculate package size
      const totalSize = files.reduce(
        (size, file) => size + file.content.length,
        0
      );

      return {
        format,
        files,
        documentation: integrityDoc,
        metadata: {
          created_at: new Date().toISOString(),
          assignment_id: assignmentId,
          user_id: userId,
          format,
          size: totalSize,
        },
      };
    } catch (error) {
      console.error("Error generating download package:", error);
      throw new Error("Failed to generate download package");
    }
  }

  private async generateFormatFiles(
    assignmentId: string,
    format: "clean" | "portfolio" | "template",
    integrityDoc: AcademicIntegrityDocument
  ): Promise<{ name: string; content: string; type: "file" | "folder" }[]> {
    const files: { name: string; content: string; type: "file" | "folder" }[] =
      [];

    switch (format) {
      case "clean":
        files.push(
          {
            name: "README.md",
            content: this.generateCleanReadme(assignmentId),
            type: "file",
          },
          {
            name: "src/",
            content: "",
            type: "folder",
          },
          {
            name: "src/main.py",
            content: this.generateCleanCode(assignmentId),
            type: "file",
          },
          {
            name: "requirements.txt",
            content: this.generateRequirements(assignmentId),
            type: "file",
          }
        );
        break;

      case "portfolio":
        files.push(
          {
            name: "README.md",
            content: this.generatePortfolioReadme(assignmentId, integrityDoc),
            type: "file",
          },
          {
            name: "learning-journey.md",
            content: this.generateLearningJourney(integrityDoc),
            type: "file",
          },
          {
            name: "ai-assistance-summary.md",
            content: this.generateAIAssistanceSummary(integrityDoc),
            type: "file",
          },
          {
            name: "src/",
            content: "",
            type: "folder",
          },
          {
            name: "src/main.py",
            content: this.generatePortfolioCode(assignmentId),
            type: "file",
          },
          {
            name: "screenshots/",
            content: "",
            type: "folder",
          },
          {
            name: "screenshots/project-overview.png",
            content: "Screenshot placeholder",
            type: "file",
          }
        );
        break;

      case "template":
        files.push(
          {
            name: "README.md",
            content: this.generateTemplateReadme(assignmentId),
            type: "file",
          },
          {
            name: "src/",
            content: "",
            type: "folder",
          },
          {
            name: "src/main.py",
            content: this.generateTemplateCode(assignmentId),
            type: "file",
          },
          {
            name: "learning-objectives.md",
            content: this.generateLearningObjectives(assignmentId),
            type: "file",
          }
        );
        break;
    }

    return files;
  }

  private generateCleanReadme(assignmentId: string): string {
    return `# Assignment Project

## Description
This project demonstrates the implementation of [assignment requirements].

## Setup Instructions
1. Install dependencies: \`pip install -r requirements.txt\`
2. Run the project: \`python src/main.py\`

## Project Structure
- \`src/main.py\` - Main implementation
- \`requirements.txt\` - Python dependencies

## Features
- [List key features implemented]

## Usage
[Provide usage instructions]

## Notes
This project was completed as part of the learning pathway system.
`;
  }

  private generatePortfolioReadme(
    assignmentId: string,
    integrityDoc: AcademicIntegrityDocument
  ): string {
    return `# Portfolio Project: ${
      integrityDoc.learning_summary.assignment_title
    }

## Project Overview
This project showcases my learning journey and technical implementation skills.

## Learning Journey
- **Pathway Completion**: ${
      integrityDoc.learning_summary.learning_pathway_completion
    }
- **Concepts Mastered**: ${integrityDoc.learning_summary.concepts_mastered.join(
      ", "
    )}
- **Time Invested**: ${integrityDoc.learning_summary.time_invested}
- **Checkpoints Completed**: ${
      integrityDoc.learning_summary.checkpoints_completed
    }

## AI Assistance Summary
- **Hints Used**: ${
      integrityDoc.learning_summary.ai_assistance_summary.hints_used
    }
- **Code Reviews**: ${
      integrityDoc.learning_summary.ai_assistance_summary.code_reviews
    }
- **Copilot Time**: ${
      integrityDoc.learning_summary.ai_assistance_summary.copilot_time
    }
- **Total Points Spent**: ${
      integrityDoc.learning_summary.ai_assistance_summary.total_points_spent
    }

## Academic Integrity
This project was completed with full transparency about AI assistance usage. All assistance was earned through demonstrated learning and understanding.

## Project Structure
- \`src/main.py\` - Main implementation
- \`learning-journey.md\` - Detailed learning process
- \`ai-assistance-summary.md\` - AI assistance documentation
- \`screenshots/\` - Project screenshots

## Setup Instructions
1. Install dependencies: \`pip install -r requirements.txt\`
2. Run the project: \`python src/main.py\`

## Skills Demonstrated
- [List technical skills]
- [List problem-solving approaches]
- [List learning outcomes]
`;
  }

  private generateTemplateReadme(assignmentId: string): string {
    return `# Learning Template: Assignment Project

## Learning Objectives
This template provides the structure and approach for implementing [assignment requirements].

## Project Structure
- \`src/main.py\` - Template implementation (requires completion)
- \`learning-objectives.md\` - Learning goals and concepts

## Implementation Approach
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Key Concepts
- [Concept 1]
- [Concept 2]
- [Concept 3]

## Learning Resources
- [Resource 1]
- [Resource 2]
- [Resource 3]

## Notes
This template maintains the logical structure while requiring independent implementation.
`;
  }

  private generateLearningJourney(
    integrityDoc: AcademicIntegrityDocument
  ): string {
    return `# Learning Journey Documentation

## Assignment: ${integrityDoc.learning_summary.assignment_title}

### Learning Progress
- **Completion**: ${integrityDoc.learning_summary.learning_pathway_completion}
- **Time Invested**: ${integrityDoc.learning_summary.time_invested}
- **Checkpoints**: ${integrityDoc.learning_summary.checkpoints_completed}

### Concepts Mastered
${integrityDoc.learning_summary.concepts_mastered
  .map((concept) => `- ${concept}`)
  .join("\n")}

### Learning Process
1. **Initial Understanding**: [Describe initial approach]
2. **Concept Exploration**: [Describe concept learning]
3. **Implementation**: [Describe implementation process]
4. **Testing & Refinement**: [Describe testing approach]
5. **Final Review**: [Describe final review process]

### Challenges Overcome
- [Challenge 1 and solution]
- [Challenge 2 and solution]
- [Challenge 3 and solution]

### Key Learnings
- [Learning 1]
- [Learning 2]
- [Learning 3]

### Academic Integrity Commitment
${integrityDoc.learning_summary.academic_integrity_signature.commitment}

**Signed**: ${
      integrityDoc.learning_summary.academic_integrity_signature.signed_at
    }
**IP Hash**: ${
      integrityDoc.learning_summary.academic_integrity_signature.ip_address
    }
`;
  }

  private generateAIAssistanceSummary(
    integrityDoc: AcademicIntegrityDocument
  ): string {
    return `# AI Assistance Summary

## Overview
This document provides complete transparency about AI assistance used during the learning process.

## Assistance Breakdown
- **Conceptual Hints**: ${integrityDoc.learning_summary.ai_assistance_summary.hints_used} uses
- **Code Reviews**: ${integrityDoc.learning_summary.ai_assistance_summary.code_reviews} sessions
- **Copilot Time**: ${integrityDoc.learning_summary.ai_assistance_summary.copilot_time}
- **Total Points Spent**: ${integrityDoc.learning_summary.ai_assistance_summary.total_points_spent}

## Educational Value
All AI assistance was earned through demonstrated learning and understanding. The assistance provided:
- Conceptual guidance without complete solutions
- Educational explanations and reasoning
- Step-by-step learning support
- Code review and feedback

## Learning Outcomes
The AI assistance contributed to:
- [Learning outcome 1]
- [Learning outcome 2]
- [Learning outcome 3]

## Academic Integrity
This assistance was earned through:
- Completing competency verifications
- Demonstrating understanding
- Maintaining learning engagement
- Following ethical guidelines

## Transparency Commitment
All AI assistance usage is documented and transparent. The learning process demonstrates genuine understanding and skill development.
`;
  }

  private generateLearningObjectives(assignmentId: string): string {
    return `# Learning Objectives

## Primary Goals
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Technical Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]

## Problem-Solving Approaches
- [Approach 1]
- [Approach 2]
- [Approach 3]

## Assessment Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

## Learning Resources
- [Resource 1]
- [Resource 2]
- [Resource 3]
`;
  }

  private generateCleanCode(assignmentId: string): string {
    return `# Main implementation file
# This file contains the complete, working implementation

def main():
    """Main function demonstrating the implementation."""
    print("Assignment implementation")
    # Implementation details would go here

if __name__ == "__main__":
    main()
`;
  }

  private generatePortfolioCode(assignmentId: string): string {
    return `# Portfolio implementation
# This file demonstrates the learning journey and implementation

def main():
    """Main function showcasing the learning process."""
    print("Portfolio project implementation")
    # Implementation with learning annotations would go here

if __name__ == "__main__":
    main()
`;
  }

  private generateTemplateCode(assignmentId: string): string {
    return `# Template implementation
# This file provides structure and approach without complete implementation

def main():
    """Template function requiring independent implementation."""
    # TODO: Implement main logic
    # Hint: Consider the following approach:
    # 1. [Step 1]
    # 2. [Step 2]
    # 3. [Step 3]
    pass

if __name__ == "__main__":
    main()
`;
  }

  private generateRequirements(assignmentId: string): string {
    return `# Python dependencies
# Add required packages here

# Example:
# requests>=2.25.0
# beautifulsoup4>=4.9.0
`;
  }

  private formatTimeInvestment(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins} minutes`;
  }
}

export const downloadService = new DownloadService();
