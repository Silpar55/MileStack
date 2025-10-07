"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Lock,
  Play,
  Trophy,
  Users,
  Star,
  TrendingUp,
  Brain,
  Code,
  Database,
  Shield,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  Award,
} from "lucide-react";

interface Pathway {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  totalPoints: number;
  estimatedDuration: number;
  totalCheckpoints: number;
  createdAt: string;
}

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  type: string;
  order: number;
  points: number;
  timeLimit: number;
  maxAttempts: number;
  passingScore: number;
  attempts: number;
  lastAttempt: any;
  assessment: any;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Progress {
  status: string;
  currentCheckpoint: string;
  completedCheckpoints: number;
  totalCheckpoints: number;
  totalPoints: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  lastAccessedAt: string;
}

interface PathwayData {
  pathway: Pathway;
  checkpoints: Checkpoint[];
  progress: Progress;
  isLocked: boolean;
  canProceed: boolean;
}

export default function LearningPathwayPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [pathwayData, setPathwayData] = useState<PathwayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(
    null
  );

  useEffect(() => {
    fetchPathway();
  }, [params.id]);

  const fetchPathway = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/learning-path/${params.id}?userId=current-user-id`
      );
      const data = await response.json();

      if (data.success) {
        setPathwayData(data.data);
        // Find current checkpoint
        const current = data.data.checkpoints.find(
          (c: Checkpoint) => c.id === data.data.progress.currentCheckpoint
        );
        setCurrentCheckpoint(current || data.data.checkpoints[0]);
      }
    } catch (error) {
      console.error("Error fetching pathway:", error);
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

  const getCheckpointIcon = (type: string) => {
    switch (type) {
      case "concept-explanation":
        return <Brain className="w-5 h-5" />;
      case "skill-assessment":
        return <Target className="w-5 h-5" />;
      case "code-review":
        return <Code className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
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

  const handleCheckpointClick = (checkpoint: Checkpoint) => {
    if (checkpoint.isLocked) return;
    router.push(`/checkpoint/${checkpoint.id}`);
  };

  const handleStartPathway = () => {
    if (pathwayData?.isLocked) return;
    // Start the pathway
    router.push(`/checkpoint/${pathwayData?.checkpoints[0].id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pathway...</p>
        </div>
      </div>
    );
  }

  if (!pathwayData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pathway Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The learning pathway you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/learning-pathways")}>
            Browse Pathways
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(
    (pathwayData.progress.completedCheckpoints /
      pathwayData.progress.totalCheckpoints) *
      100
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/learning-pathways")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Pathways
            </Button>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {pathwayData.pathway.title}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {pathwayData.pathway.description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(pathwayData.pathway.category)}
                  <span className="capitalize">
                    {pathwayData.pathway.category.replace("-", " ")}
                  </span>
                </div>
                <Badge
                  className={getDifficultyColor(pathwayData.pathway.difficulty)}
                >
                  {pathwayData.pathway.difficulty}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span>{pathwayData.pathway.totalPoints} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{pathwayData.pathway.estimatedDuration}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Progress</h3>
                <Badge className={getStatusColor(pathwayData.progress.status)}>
                  {pathwayData.progress.status}
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Checkpoints Completed</span>
                    <span>
                      {pathwayData.progress.completedCheckpoints}/
                      {pathwayData.progress.totalCheckpoints}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {pathwayData.progress.totalPoints}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Points Earned
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {pathwayData.progress.timeSpent}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Minutes Spent
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {progressPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checkpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="checkpoints" className="space-y-6">
            {/* Current Checkpoint */}
            {currentCheckpoint && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <CardTitle className="text-primary">
                      Current Checkpoint
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {currentCheckpoint.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {currentCheckpoint.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          {getCheckpointIcon(currentCheckpoint.type)}
                          <span className="capitalize">
                            {currentCheckpoint.type.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-primary" />
                          <span>{currentCheckpoint.points} points</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{currentCheckpoint.timeLimit} min</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCheckpointClick(currentCheckpoint)}
                      disabled={currentCheckpoint.isLocked}
                    >
                      {currentCheckpoint.isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </>
                      ) : currentCheckpoint.isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Checkpoints */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">All Checkpoints</h3>
              <div className="space-y-3">
                {pathwayData.checkpoints.map((checkpoint, index) => (
                  <Card
                    key={checkpoint.id}
                    className={`cursor-pointer transition-all ${
                      checkpoint.isLocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-md"
                    } ${
                      checkpoint.id === currentCheckpoint?.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleCheckpointClick(checkpoint)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              checkpoint.isCompleted
                                ? "bg-green-100 text-green-600"
                                : checkpoint.id === currentCheckpoint?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {checkpoint.isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-bold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {checkpoint.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {checkpoint.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs">
                                <div className="flex items-center space-x-1">
                                  {getCheckpointIcon(checkpoint.type)}
                                  <span className="capitalize">
                                    {checkpoint.type.replace("-", " ")}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="w-3 h-3 text-primary" />
                                  <span>{checkpoint.points} pts</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span>{checkpoint.timeLimit} min</span>
                                </div>
                                {checkpoint.attempts > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-muted-foreground" />
                                    <span>{checkpoint.attempts} attempts</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {checkpoint.isLocked && (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              )}
                              {checkpoint.isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pathway Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {pathwayData.pathway.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {pathwayData.pathway.totalCheckpoints}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Checkpoints
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {pathwayData.pathway.totalPoints}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Points
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {pathwayData.pathway.estimatedDuration}
                      </p>
                      <p className="text-sm text-muted-foreground">Hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {pathwayData.pathway.difficulty}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Difficulty
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {progressPercentage}%
                    </div>
                    <p className="text-muted-foreground">Complete</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {pathwayData.progress.completedCheckpoints}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {pathwayData.progress.totalPoints}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Points Earned
                      </p>
                    </div>
                  </div>

                  {pathwayData.progress.startedAt && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Started:{" "}
                        {new Date(
                          pathwayData.progress.startedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {pathwayData.progress.status === "not-started" && (
            <Button
              size="lg"
              onClick={handleStartPathway}
              disabled={pathwayData.isLocked}
            >
              {pathwayData.isLocked ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Pathway Locked
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Pathway
                </>
              )}
            </Button>
          )}
          {pathwayData.progress.status === "in-progress" &&
            currentCheckpoint && (
              <Button
                size="lg"
                onClick={() => handleCheckpointClick(currentCheckpoint)}
                disabled={currentCheckpoint.isLocked}
              >
                <Play className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
            )}
          {pathwayData.progress.status === "completed" && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/learning-pathways")}
            >
              <Award className="w-5 h-5 mr-2" />
              Browse More Pathways
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
