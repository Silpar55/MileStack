"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ProgressChart,
  LearningPathwayProgressChart,
  CompetencyPerformanceChart,
  PathwayCategoryChart,
} from "@/components/ProgressChart";
import {
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  Brain,
  Code,
  Database,
  Shield,
  Smartphone,
  Award,
  Users,
  Star,
  ArrowRight,
  Play,
  Lock,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface LearningStats {
  totalPathways: number;
  completedPathways: number;
  inProgressPathways: number;
  totalPoints: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
}

interface RecentActivity {
  id: string;
  type:
    | "pathway_started"
    | "checkpoint_completed"
    | "assessment_passed"
    | "pathway_completed";
  title: string;
  description: string;
  points: number;
  timestamp: string;
  pathwayId: string;
  checkpointId?: string;
}

interface PathwayProgress {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  progress: number;
  status: string;
  pointsEarned: number;
  timeSpent: number;
  lastAccessed: string;
  checkpoints: any[];
}

interface CompetencyAssessment {
  id: string;
  pathwayTitle: string;
  checkpointTitle: string;
  type: string;
  score: number;
  comprehensionScore: number;
  accuracyScore: number;
  isPassed: boolean;
  submittedAt: string;
}

export default function LearningDashboardPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pathwayProgress, setPathwayProgress] = useState<PathwayProgress[]>([]);
  const [competencyAssessments, setCompetencyAssessments] = useState<
    CompetencyAssessment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch learning statistics
      const statsResponse = await fetch(
        "/api/learning-dashboard/stats?userId=current-user-id"
      );
      const statsData = await statsResponse.json();

      // Fetch recent activity
      const activityResponse = await fetch(
        "/api/learning-dashboard/activity?userId=current-user-id"
      );
      const activityData = await activityResponse.json();

      // Fetch pathway progress
      const progressResponse = await fetch(
        "/api/learning-dashboard/progress?userId=current-user-id"
      );
      const progressData = await progressResponse.json();

      // Fetch competency assessments
      const assessmentsResponse = await fetch(
        "/api/learning-dashboard/assessments?userId=current-user-id"
      );
      const assessmentsData = await assessmentsResponse.json();

      if (statsData.success) setStats(statsData.data);
      if (activityData.success) setRecentActivity(activityData.data);
      if (progressData.success) setPathwayProgress(progressData.data);
      if (assessmentsData.success)
        setCompetencyAssessments(assessmentsData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "not-started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pathway_started":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "checkpoint_completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "assessment_passed":
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case "pathway_completed":
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "data-structures":
        return <Database className="w-5 h-5" />;
      case "algorithms":
        return <Code className="w-5 h-5" />;
      case "web-dev":
        return <BookOpen className="w-5 h-5" />;
      case "database":
        return <Database className="w-5 h-5" />;
      case "system-design":
        return <Target className="w-5 h-5" />;
      case "machine-learning":
        return <Brain className="w-5 h-5" />;
      case "security":
        return <Shield className="w-5 h-5" />;
      case "mobile-dev":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const createProgressChart = (type: string) => {
    const now = new Date();
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      // Generate sample data based on type
      switch (type) {
        case "progress":
          data.push(Math.floor(Math.random() * 100));
          break;
        case "performance":
          data.push(Math.floor(Math.random() * 50) + 50);
          break;
        case "completion":
          data.push(Math.floor(Math.random() * 20) + 80);
          break;
        default:
          data.push(Math.floor(Math.random() * 100));
      }
    }

    return {
      labels,
      datasets: [
        {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data,
          backgroundColor:
            type === "progress"
              ? "rgba(59, 130, 246, 0.8)"
              : type === "performance"
              ? "rgba(34, 197, 94, 0.8)"
              : "rgba(168, 85, 247, 0.8)",
          borderColor:
            type === "progress"
              ? "rgba(59, 130, 246, 1)"
              : type === "performance"
              ? "rgba(34, 197, 94, 1)"
              : "rgba(168, 85, 247, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and competency development across all learning
            pathways
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPathways}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Pathways
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.completedPathways}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPoints}</p>
                    <p className="text-sm text-muted-foreground">
                      Points Earned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.averageScore}%</p>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                activity.timestamp
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">
                              +{activity.points}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              points
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No recent activity
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {stats?.currentStreak || 0}
                    </div>
                    <p className="text-muted-foreground mb-4">Current Streak</p>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {stats?.longestStreak || 0}
                    </div>
                    <p className="text-muted-foreground">Longest Streak</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pathway Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Pathway Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathwayProgress.length > 0 ? (
                    pathwayProgress.map((pathway) => (
                      <div
                        key={pathway.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {getCategoryIcon(pathway.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{pathway.title}</h3>
                            <Badge
                              className={getDifficultyColor(pathway.difficulty)}
                            >
                              {pathway.difficulty}
                            </Badge>
                            <Badge className={getStatusColor(pathway.status)}>
                              {pathway.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{pathway.pointsEarned} points</span>
                            <span>{pathway.timeSpent} min</span>
                            <span>
                              {new Date(
                                pathway.lastAccessed
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <Progress
                            value={pathway.progress}
                            className="h-2 mt-2"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No pathways in progress
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart
                    type="bar"
                    data={createProgressChart("progress")}
                    title="Weekly Progress"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pathway Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <PathwayCategoryChart pathways={pathwayProgress} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competency Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competencyAssessments.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <CompetencyPerformanceChart
                          assessmentData={competencyAssessments}
                        />
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {
                                competencyAssessments.filter((a) => a.isPassed)
                                  .length
                              }
                            </div>
                            <p className="text-muted-foreground">
                              Assessments Passed
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {Math.round(
                                competencyAssessments.reduce(
                                  (sum, a) => sum + a.score,
                                  0
                                ) / competencyAssessments.length
                              )}
                            </div>
                            <p className="text-muted-foreground">
                              Average Score
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {competencyAssessments
                          .slice(0, 10)
                          .map((assessment) => (
                            <div
                              key={assessment.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {assessment.isPassed ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    {assessment.pathwayTitle}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {assessment.checkpointTitle}
                                  </p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {assessment.type.replace("-", " ")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <p className="font-semibold">
                                      {assessment.score}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Overall
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-blue-600">
                                      {assessment.comprehensionScore}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Comprehension
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-green-600">
                                      {assessment.accuracyScore}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Accuracy
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No assessments completed yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart
                    type="line"
                    data={createProgressChart("performance")}
                    title="Assessment Scores Over Time"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart
                    type="doughnut"
                    data={createProgressChart("completion")}
                    title="Pathway Completion"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stats?.totalTimeSpent || 0}
                    </div>
                    <p className="text-muted-foreground">
                      Minutes Spent Learning
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {
                        pathwayProgress.filter((p) => p.status === "completed")
                          .length
                      }
                    </div>
                    <p className="text-muted-foreground">Pathways Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {competencyAssessments.length}
                    </div>
                    <p className="text-muted-foreground">Assessments Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
