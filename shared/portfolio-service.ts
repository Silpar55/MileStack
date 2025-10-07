import { db } from "./db";
import {
  learningPathways,
  pathwayProgress,
  userPoints,
  pointTransactions,
  achievements,
} from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import archiver from "archiver";
import { Readable } from "stream";

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  completionDate: string;
  pathwayCompletion: number;
  conceptsMastered: string[];
  timeInvested: string;
  aiAssistanceUsed: {
    hints: number;
    codeReviews: number;
    copilotSessions: number;
    totalPointsSpent: number;
  };
  skillsDemonstrated: string[];
  screenshots: string[];
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface SkillsMatrix {
  category: string;
  skills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    evidence: string[];
    projects: string[];
  }[];
}

export interface LearningTimeline {
  date: string;
  milestone: string;
  description: string;
  type: "concept" | "implementation" | "review" | "achievement";
  projectId?: string;
}

export interface AchievementGallery {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  points: number;
  category: string;
  icon: string;
}

export interface PortfolioExport {
  format: "pdf" | "web" | "github";
  content: {
    projects: PortfolioProject[];
    skillsMatrix: SkillsMatrix[];
    learningTimeline: LearningTimeline[];
    achievements: AchievementGallery[];
    summary: {
      totalProjects: number;
      totalTimeInvested: string;
      totalPointsEarned: number;
      totalAchievements: number;
      averageCompletionRate: number;
    };
  };
  metadata: {
    generatedAt: string;
    userId: string;
    format: string;
    size: number;
  };
}

export class PortfolioService {
  async getUserProjects(userId: string): Promise<PortfolioProject[]> {
    try {
      // Get completed pathways
      const completedPathways = await db
        .select()
        .from(pathwayProgress)
        .where(
          and(
            eq(pathwayProgress.userId, userId),
            sql`${pathwayProgress.completedCheckpoints} >= ${pathwayProgress.totalCheckpoints}`
          )
        );

      const projects: PortfolioProject[] = [];

      for (const progress of completedPathways) {
        // Get pathway details
        const pathway = await db
          .select()
          .from(learningPathways)
          .where(eq(learningPathways.id, progress.pathwayId))
          .limit(1);

        if (pathway.length === 0) continue;

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

        const hints = aiAssistance.filter(
          (t) => t.category === "conceptual_hints"
        ).length;
        const codeReviews = aiAssistance.filter(
          (t) => t.category === "code_review"
        ).length;
        const copilotSessions = aiAssistance.filter(
          (t) => t.category === "copilot_session"
        ).length;

        const totalPointsSpent = aiAssistance.reduce(
          (total, t) => total + Math.abs(t.amount),
          0
        );

        projects.push({
          id: progress.pathwayId,
          title: pathway[0].title,
          description: pathway[0].description || "",
          completionDate:
            progress.completedAt?.toISOString() || new Date().toISOString(),
          pathwayCompletion:
            progress.totalCheckpoints > 0
              ? Math.round(
                  ((progress.completedCheckpoints || 0) /
                    progress.totalCheckpoints) *
                    100
                )
              : 0,
          conceptsMastered: (pathway[0].tags as string[]) || [],
          timeInvested: this.formatTimeInvestment(progress.timeSpent || 0),
          aiAssistanceUsed: {
            hints,
            codeReviews,
            copilotSessions,
            totalPointsSpent,
          },
          skillsDemonstrated: this.extractSkillsFromConcepts(
            (pathway[0].tags as string[]) || []
          ),
          screenshots: [], // Would be populated from file system
          githubUrl: undefined, // Would be populated from GitHub integration
          portfolioUrl: undefined, // Would be populated from portfolio deployment
        });
      }

      return projects.sort(
        (a, b) =>
          new Date(b.completionDate).getTime() -
          new Date(a.completionDate).getTime()
      );
    } catch (error) {
      console.error("Error getting user projects:", error);
      throw new Error("Failed to get user projects");
    }
  }

  async getSkillsMatrix(userId: string): Promise<SkillsMatrix[]> {
    try {
      const projects = await this.getUserProjects(userId);

      // Group skills by category
      const skillsByCategory: { [key: string]: { [key: string]: any } } = {};

      for (const project of projects) {
        for (const skill of project.skillsDemonstrated) {
          const category = this.categorizeSkill(skill);
          if (!skillsByCategory[category]) {
            skillsByCategory[category] = {};
          }
          if (!skillsByCategory[category][skill]) {
            skillsByCategory[category][skill] = {
              name: skill,
              level: "beginner" as const,
              evidence: [],
              projects: [],
            };
          }
          skillsByCategory[category][skill].projects.push(project.id);
          skillsByCategory[category][skill].evidence.push(
            `${project.title} (${project.completionDate})`
          );
        }
      }

      // Convert to SkillsMatrix format
      const skillsMatrix: SkillsMatrix[] = [];
      for (const [category, skills] of Object.entries(skillsByCategory)) {
        skillsMatrix.push({
          category,
          skills: Object.values(skills).map((skill) => ({
            ...skill,
            level: this.determineSkillLevel(
              skill.projects.length,
              skill.evidence.length
            ),
          })),
        });
      }

      return skillsMatrix;
    } catch (error) {
      console.error("Error getting skills matrix:", error);
      throw new Error("Failed to get skills matrix");
    }
  }

  async getLearningTimeline(userId: string): Promise<LearningTimeline[]> {
    try {
      const projects = await this.getUserProjects(userId);
      const timeline: LearningTimeline[] = [];

      for (const project of projects) {
        // Add project completion milestone
        timeline.push({
          date: project.completionDate,
          milestone: `Completed: ${project.title}`,
          description: `Successfully completed ${project.title} with ${project.pathwayCompletion}% completion rate`,
          type: "achievement",
          projectId: project.id,
        });

        // Add concept mastery milestones
        for (const concept of project.conceptsMastered) {
          timeline.push({
            date: project.completionDate,
            milestone: `Mastered: ${concept}`,
            description: `Demonstrated understanding of ${concept} through ${project.title}`,
            type: "concept",
            projectId: project.id,
          });
        }
      }

      return timeline.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error("Error getting learning timeline:", error);
      throw new Error("Failed to get learning timeline");
    }
  }

  async getAchievementGallery(userId: string): Promise<AchievementGallery[]> {
    try {
      const userAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, userId));

      return userAchievements.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        unlockedAt:
          achievement.unlockedAt?.toISOString() || new Date().toISOString(),
        points: achievement.points || 0,
        category: achievement.category || "general",
        icon: this.getAchievementIcon(achievement.category || "general"),
      }));
    } catch (error) {
      console.error("Error getting achievement gallery:", error);
      throw new Error("Failed to get achievement gallery");
    }
  }

  async generatePortfolioExport(
    userId: string,
    format: "pdf" | "web" | "github"
  ): Promise<PortfolioExport> {
    try {
      const projects = await this.getUserProjects(userId);
      const skillsMatrix = await this.getSkillsMatrix(userId);
      const learningTimeline = await this.getLearningTimeline(userId);
      const achievements = await this.getAchievementGallery(userId);

      // Calculate summary statistics
      const totalTimeInvested = projects.reduce((total, project) => {
        const timeStr = project.timeInvested;
        const hours = parseInt(timeStr.split(" ")[0]) || 0;
        return total + hours;
      }, 0);

      const totalPointsEarned = projects.reduce((total, project) => {
        return total + project.aiAssistanceUsed.totalPointsSpent;
      }, 0);

      const averageCompletionRate =
        projects.length > 0
          ? projects.reduce(
              (total, project) => total + project.pathwayCompletion,
              0
            ) / projects.length
          : 0;

      const summary = {
        totalProjects: projects.length,
        totalTimeInvested: `${totalTimeInvested} hours`,
        totalPointsEarned,
        totalAchievements: achievements.length,
        averageCompletionRate: Math.round(averageCompletionRate),
      };

      return {
        format,
        content: {
          projects,
          skillsMatrix,
          learningTimeline,
          achievements,
          summary,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          userId,
          format,
          size: JSON.stringify({
            projects,
            skillsMatrix,
            learningTimeline,
            achievements,
          }).length,
        },
      };
    } catch (error) {
      console.error("Error generating portfolio export:", error);
      throw new Error("Failed to generate portfolio export");
    }
  }

  async syncToGitHub(
    userId: string,
    projectId: string,
    githubToken: string
  ): Promise<{ repositoryUrl: string; portfolioUrl: string }> {
    try {
      // This would integrate with GitHub API
      // For now, return mock data
      const repositoryUrl = `https://github.com/${userId}/project-${projectId}`;
      const portfolioUrl = `https://${userId}.github.io/project-${projectId}`;

      return {
        repositoryUrl,
        portfolioUrl,
      };
    } catch (error) {
      console.error("Error syncing to GitHub:", error);
      throw new Error("Failed to sync to GitHub");
    }
  }

  async generatePortfolioWebsite(
    userId: string,
    projectId: string
  ): Promise<{ html: string; css: string; js: string }> {
    try {
      const project = await this.getUserProjects(userId).then((projects) =>
        projects.find((p) => p.id === projectId)
      );

      if (!project) {
        throw new Error("Project not found");
      }

      const html = this.generatePortfolioHTML(project);
      const css = this.generatePortfolioCSS();
      const js = this.generatePortfolioJS();

      return { html, css, js };
    } catch (error) {
      console.error("Error generating portfolio website:", error);
      throw new Error("Failed to generate portfolio website");
    }
  }

  private extractSkillsFromConcepts(concepts: string[]): string[] {
    // Map concepts to skills
    const skillMap: { [key: string]: string[] } = {
      "HTTP requests": ["API Integration", "Web Development", "HTTP Protocol"],
      "HTML parsing": ["Web Scraping", "Data Extraction", "DOM Manipulation"],
      "Error handling": [
        "Debugging",
        "Exception Handling",
        "Robust Programming",
      ],
      "Data structures": [
        "Algorithm Design",
        "Data Organization",
        "Problem Solving",
      ],
      Algorithms: [
        "Algorithm Design",
        "Problem Solving",
        "Computational Thinking",
      ],
    };

    const skills: string[] = [];
    for (const concept of concepts) {
      if (skillMap[concept]) {
        skills.push(...skillMap[concept]);
      } else {
        skills.push(concept);
      }
    }

    return [...new Set(skills)]; // Remove duplicates
  }

  private categorizeSkill(skill: string): string {
    const categories: { [key: string]: string[] } = {
      Programming: [
        "API Integration",
        "Web Development",
        "HTTP Protocol",
        "Web Scraping",
        "Data Extraction",
        "DOM Manipulation",
        "Debugging",
        "Exception Handling",
        "Robust Programming",
      ],
      "Computer Science": [
        "Algorithm Design",
        "Data Organization",
        "Problem Solving",
        "Computational Thinking",
        "Data Structures",
      ],
      "Software Engineering": [
        "Code Review",
        "Testing",
        "Documentation",
        "Version Control",
      ],
    };

    for (const [category, skills] of Object.entries(categories)) {
      if (skills.includes(skill)) {
        return category;
      }
    }

    return "General";
  }

  private determineSkillLevel(
    projectCount: number,
    evidenceCount: number
  ): "beginner" | "intermediate" | "advanced" {
    if (projectCount >= 3 && evidenceCount >= 5) return "advanced";
    if (projectCount >= 2 && evidenceCount >= 3) return "intermediate";
    return "beginner";
  }

  private getAchievementIcon(category: string): string {
    const icons: { [key: string]: string } = {
      learning: "📚",
      collaboration: "🤝",
      integrity: "✅",
      points: "⭐",
      general: "🏆",
    };

    return icons[category] || icons["general"];
  }

  private formatTimeInvestment(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins} minutes`;
  }

  private generatePortfolioHTML(project: PortfolioProject): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${project.title}</h1>
        <p>${project.description}</p>
    </header>
    
    <main>
        <section class="project-overview">
            <h2>Project Overview</h2>
            <div class="stats">
                <div class="stat">
                    <span class="label">Completion Rate</span>
                    <span class="value">${project.pathwayCompletion}%</span>
                </div>
                <div class="stat">
                    <span class="label">Time Invested</span>
                    <span class="value">${project.timeInvested}</span>
                </div>
                <div class="stat">
                    <span class="label">Concepts Mastered</span>
                    <span class="value">${
                      project.conceptsMastered.length
                    }</span>
                </div>
            </div>
        </section>
        
        <section class="learning-journey">
            <h2>Learning Journey</h2>
            <div class="concepts">
                <h3>Concepts Mastered</h3>
                <ul>
                    ${project.conceptsMastered
                      .map((concept) => `<li>${concept}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <div class="ai-assistance">
                <h3>AI Assistance Summary</h3>
                <div class="assistance-stats">
                    <div class="assistance-stat">
                        <span class="label">Hints Used</span>
                        <span class="value">${
                          project.aiAssistanceUsed.hints
                        }</span>
                    </div>
                    <div class="assistance-stat">
                        <span class="label">Code Reviews</span>
                        <span class="value">${
                          project.aiAssistanceUsed.codeReviews
                        }</span>
                    </div>
                    <div class="assistance-stat">
                        <span class="label">Copilot Sessions</span>
                        <span class="value">${
                          project.aiAssistanceUsed.copilotSessions
                        }</span>
                    </div>
                    <div class="assistance-stat">
                        <span class="label">Total Points Spent</span>
                        <span class="value">${
                          project.aiAssistanceUsed.totalPointsSpent
                        }</span>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="skills">
            <h2>Skills Demonstrated</h2>
            <div class="skills-grid">
                ${project.skillsDemonstrated
                  .map(
                    (skill) => `
                    <div class="skill-item">
                        <span class="skill-name">${skill}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </section>
    </main>
    
    <footer>
        <p>Generated by MileStack Portfolio System</p>
        <p>Academic Integrity: All AI assistance was earned through demonstrated learning</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`;
  }

  private generatePortfolioCSS(): string {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.stat {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.stat .label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.stat .value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
}

.concepts ul {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
}

.concepts li {
    background: #e8f4f8;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border-left: 4px solid #3498db;
}

.assistance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.assistance-stat {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.assistance-stat .label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.assistance-stat .value {
    display: block;
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.skill-item {
    background: #e8f5e8;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
    border-left: 4px solid #27ae60;
}

.skill-name {
    font-weight: 500;
    color: #2c3e50;
}

footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 2rem;
}

footer p {
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    main {
        padding: 1rem;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    .stats,
    .assistance-stats {
        grid-template-columns: 1fr;
    }
}`;
  }

  private generatePortfolioJS(): string {
    return `// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add animation to stats
    const stats = document.querySelectorAll('.stat, .assistance-stat');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    stats.forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        stat.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(stat);
    });
});`;
  }
}

export const portfolioService = new PortfolioService();
