"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Circle,
  Clock,
  Target,
  Zap,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  points: number;
  order: number;
  competencyRequirements: string[];
  resources: any[];
  isCompleted: boolean;
  completedAt: string | null;
}

interface Pathway {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  estimatedDuration: number;
  difficultyLevel: number;
  isActive: boolean;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export default function LearningPathwayPage() {
  const params = useParams();
  const router = useRouter();
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<number>(0);

  useEffect(() => {
    if (params.id) {
      fetchPathway(params.id as string);
    }
  }, [params.id]);

  const fetchPathway = async (pathwayId: string) => {
    try {
      const response = await fetch(`/api/pathway/${pathwayId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch pathway");
      }
      const data = await response.json();
      setPathway(data);

      // Find the first incomplete milestone
      const firstIncomplete = data.milestones.findIndex(
        (milestone: Milestone) => !milestone.isCompleted
      );
      setCurrentMilestone(
        firstIncomplete >= 0 ? firstIncomplete : data.milestones.length - 1
      );
    } catch (error) {
      console.error("Error fetching pathway:", error);
      setError("Failed to load learning pathway");
    } finally {
      setLoading(false);
    }
  };

  const startMilestone = (milestoneId: string) => {
    // TODO: Implement milestone start logic
    console.log("Starting milestone:", milestoneId);
  };

  const completeMilestone = (milestoneId: string) => {
    // TODO: Implement milestone completion logic
    console.log("Completing milestone:", milestoneId);
  };

  const resetPathway = () => {
    // TODO: Implement pathway reset logic
    console.log("Resetting pathway");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading learning pathway...</p>
        </div>
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Learning pathway not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const completedMilestones = pathway.milestones.filter(
    (m) => m.isCompleted
  ).length;
  const progressPercentage =
    (completedMilestones / pathway.milestones.length) * 100;
  const earnedPoints = pathway.milestones
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.points, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{pathway.title}</h1>
          <p className="text-muted-foreground mb-4">{pathway.description}</p>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {completedMilestones}
                </div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {earnedPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Points Earned
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {pathway.totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {pathway.estimatedDuration}
                </div>
                <div className="text-sm text-muted-foreground">Days Est.</div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* Difficulty and Status */}
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>Difficulty: {pathway.difficultyLevel}/10</span>
          </Badge>
          <Badge
            variant={pathway.isActive ? "default" : "secondary"}
            className="flex items-center space-x-1"
          >
            <Circle className="w-3 h-3" />
            <span>{pathway.isActive ? "Active" : "Inactive"}</span>
          </Badge>
        </div>

        {/* Learning Milestones */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            Learning Milestones
          </h2>

          {pathway.milestones.map((milestone, index) => (
            <Card
              key={milestone.id}
              className={`${
                milestone.isCompleted
                  ? "border-green-200 bg-green-50"
                  : index === currentMilestone
                  ? "border-primary bg-primary/5"
                  : "border-muted"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Milestone Number */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      milestone.isCompleted
                        ? "bg-green-500 text-white"
                        : index === currentMilestone
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {milestone.isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Milestone Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">
                        {milestone.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{milestone.points} pts</span>
                        </Badge>
                        {milestone.isCompleted && (
                          <Badge
                            variant="default"
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {milestone.description}
                    </p>

                    {/* Competency Requirements */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">
                        Competency Requirements:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.competencyRequirements.map(
                          (requirement, reqIndex) => (
                            <Badge
                              key={reqIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {requirement}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    {milestone.resources && milestone.resources.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">
                          Learning Resources:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.resources.map((resource, resIndex) => (
                            <Button key={resIndex} variant="outline" size="sm">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {resource.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {milestone.isCompleted ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Completed on{" "}
                            {new Date(
                              milestone.completedAt!
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      ) : index === currentMilestone ? (
                        <div className="flex items-center space-x-2">
                          <Button onClick={() => startMilestone(milestone.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Milestone
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => completeMilestone(milestone.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      ) : index < currentMilestone ? (
                        <Button variant="outline" disabled>
                          <Pause className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Circle className="w-4 h-4 mr-2" />
                          Not Available
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pathway Actions */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Assignments
          </Button>
          <Button variant="outline" onClick={resetPathway}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Pathway
          </Button>
        </div>
      </div>
    </div>
  );
}
