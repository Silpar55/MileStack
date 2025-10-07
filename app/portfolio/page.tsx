"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Clock,
  Star,
  Download,
  ExternalLink,
  Code,
  Brain,
  Award,
  TrendingUp,
  Users,
  Target,
  Eye,
} from "lucide-react";

interface PortfolioProject {
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
    copilotTime: string;
    totalPointsSpent: number;
  };
  skillsDemonstrated: string[];
  screenshots: string[];
  githubUrl?: string;
  portfolioUrl?: string;
}

interface SkillsMatrix {
  category: string;
  skills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    evidence: string[];
    projects: string[];
  }[];
}

interface LearningTimeline {
  date: string;
  milestone: string;
  description: string;
  type: "concept" | "implementation" | "review" | "achievement";
  projectId?: string;
}

interface AchievementGallery {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  points: number;
  category: string;
  icon: string;
}

interface PortfolioSummary {
  totalProjects: number;
  totalTimeInvested: string;
  totalPointsEarned: number;
  totalAchievements: number;
  averageCompletionRate: number;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [skillsMatrix, setSkillsMatrix] = useState<SkillsMatrix[]>([]);
  const [timeline, setTimeline] = useState<LearningTimeline[]>([]);
  const [achievements, setAchievements] = useState<AchievementGallery[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const [projectsRes, skillsRes, timelineRes, achievementsRes] =
        await Promise.all([
          fetch("/api/portfolio/projects"),
          fetch("/api/portfolio/skills"),
          fetch("/api/portfolio/timeline"),
          fetch("/api/portfolio/achievements"),
        ]);

      const [projectsData, skillsData, timelineData, achievementsData] =
        await Promise.all([
          projectsRes.json(),
          skillsRes.json(),
          timelineRes.json(),
          achievementsRes.json(),
        ]);

      setProjects(projectsData);
      setSkillsMatrix(skillsData);
      setTimeline(timelineData);
      setAchievements(achievementsData);

      // Calculate summary
      const totalTimeInvested = projectsData.reduce(
        (total: number, project: PortfolioProject) => {
          const timeStr = project.timeInvested;
          const hours = parseInt(timeStr.split(" ")[0]) || 0;
          return total + hours;
        },
        0
      );

      const totalPointsEarned = projectsData.reduce(
        (total: number, project: PortfolioProject) => {
          return total + project.aiAssistanceUsed.totalPointsSpent;
        },
        0
      );

      const averageCompletionRate =
        projectsData.length > 0
          ? projectsData.reduce(
              (total: number, project: PortfolioProject) =>
                total + project.pathwayCompletion,
              0
            ) / projectsData.length
          : 0;

      setSummary({
        totalProjects: projectsData.length,
        totalTimeInvested: `${totalTimeInvested} hours`,
        totalPointsEarned,
        totalAchievements: achievementsData.length,
        averageCompletionRate: Math.round(averageCompletionRate),
      });
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPortfolio = async (format: "pdf" | "web" | "github") => {
    try {
      const response = await fetch("/api/portfolio/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error("Failed to export portfolio");
      }

      const data = await response.json();
      console.log("Portfolio export:", data);
      // Handle export based on format
    } catch (error) {
      console.error("Error exporting portfolio:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Portfolio
          </h1>
          <p className="text-gray-600">
            Showcase your learning journey, skills, and achievements.
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {summary.totalProjects}
                    </p>
                    <p className="text-sm text-gray-600">Projects Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {summary.totalTimeInvested}
                    </p>
                    <p className="text-sm text-gray-600">Time Invested</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {summary.totalPointsEarned}
                    </p>
                    <p className="text-sm text-gray-600">Points Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {summary.totalAchievements}
                    </p>
                    <p className="text-sm text-gray-600">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Options */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Export Portfolio</CardTitle>
              <CardDescription>
                Generate professional portfolio exports in various formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => exportPortfolio("pdf")}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF Portfolio
                </Button>
                <Button
                  onClick={() => exportPortfolio("web")}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Web Portfolio
                </Button>
                <Button
                  onClick={() => exportPortfolio("github")}
                  variant="outline"
                >
                  <Code className="h-4 w-4 mr-2" />
                  GitHub Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Completion
                        </span>
                        <span className="font-medium">
                          {project.pathwayCompletion}%
                        </span>
                      </div>
                      <Progress
                        value={project.pathwayCompletion}
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Time Invested
                        </span>
                        <span className="font-medium">
                          {project.timeInvested}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Concepts</span>
                        <span className="font-medium">
                          {project.conceptsMastered.length}
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1">
                          {project.conceptsMastered
                            .slice(0, 3)
                            .map((concept, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {concept}
                              </Badge>
                            ))}
                          {project.conceptsMastered.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.conceptsMastered.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            {skillsMatrix.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.skills.map((skill, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <Badge
                            variant={
                              skill.level === "advanced"
                                ? "default"
                                : skill.level === "intermediate"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {skill.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {skill.projects.length} projects
                        </p>
                        <div className="text-xs text-gray-500">
                          {skill.evidence.slice(0, 2).map((evidence, idx) => (
                            <div key={idx} className="truncate">
                              {evidence}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.type === "achievement"
                              ? "bg-green-500"
                              : item.type === "concept"
                              ? "bg-blue-500"
                              : item.type === "implementation"
                              ? "bg-purple-500"
                              : "bg-orange-500"
                          }`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.milestone}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold mb-2">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {new Date(
                            achievement.unlockedAt
                          ).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
