"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  Brain,
  Lock,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Code,
  Target,
  Trash2,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface Assignment {
  id: string;
  title: string;
  originalFilename: string;
  analysisStatus: "pending" | "processing" | "complete" | "failed";
  analysis?: {
    concepts: string[];
    languages: string[];
    difficulty: number;
    estimated_hours: number;
    prerequisites: string[];
  };
  pathway?: {
    id: string;
    totalPoints: number;
    milestones: {
      title: string;
      description: string;
      points: number;
      competencyRequirements: string;
    }[];
  };
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const assignmentId = params.id as string;

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assignment/${assignmentId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch assignment details");
      }

      const data = await response.json();
      setAssignment(data);
    } catch (err) {
      console.error("Error fetching assignment:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/assignment/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignmentId }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      setAssignment(result.assignment);

      // Refresh the page to show updated analysis
      setTimeout(() => {
        fetchAssignmentDetails();
      }, 2000);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to start analysis");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return "bg-green-100 text-green-800";
    if (difficulty <= 6) return "bg-yellow-100 text-yellow-800";
    if (difficulty <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return "Beginner";
    if (difficulty <= 6) return "Intermediate";
    if (difficulty <= 8) return "Advanced";
    return "Expert";
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignment) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/assignment/${assignment.id}/delete?title=${encodeURIComponent(
          assignment.title
        )}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete assignment");
      }

      // Redirect to assignments page after successful deletion
      router.push("/assignments");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert(err instanceof Error ? err.message : "Failed to delete assignment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || "Assignment not found"}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-muted-foreground">
              Original file: {assignment.originalFilename}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="text-red-50 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Assignment
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              ← Back to Assignments
            </Button>
          </div>
        </div>

        {/* Analysis Status */}
        {assignment.analysisStatus === "pending" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This assignment hasn't been analyzed yet. Click "Start Analysis"
              to generate a personalized learning pathway.
            </AlertDescription>
          </Alert>
        )}

        {assignment.analysisStatus === "processing" && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              AI is analyzing your assignment and generating a learning pathway.
              This may take a few moments...
            </AlertDescription>
          </Alert>
        )}

        {assignment.analysisStatus === "failed" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analysis failed. Please try again or contact support if the issue
              persists.
            </AlertDescription>
          </Alert>
        )}

        {/* Start Analysis Button */}
        {assignment.analysisStatus === "pending" && (
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                Ready for AI Analysis
              </h3>
              <p className="text-muted-foreground mb-4">
                Our AI will analyze your assignment and create a personalized
                learning pathway with milestones and competency checks.
              </p>
              <Button onClick={startAnalysis} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {assignment.analysisStatus === "complete" && assignment.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignment Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Assignment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Difficulty Level
                      </label>
                      <div className="flex items-center mt-1">
                        <Badge
                          className={getDifficultyColor(
                            assignment.analysis.difficulty
                          )}
                        >
                          {getDifficultyLabel(assignment.analysis.difficulty)} (
                          {assignment.analysis.difficulty}/10)
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Estimated Time
                      </label>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{assignment.analysis.estimated_hours} hours</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Programming Concepts
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignment.analysis.concepts.map((concept, index) => (
                        <Badge key={index} variant="secondary">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Programming Languages
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignment.analysis.languages.map((language, index) => (
                        <Badge key={index} variant="outline">
                          <Code className="w-3 h-3 mr-1" />
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Prerequisites
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignment.analysis.prerequisites.map(
                        (prereq, index) => (
                          <Badge key={index} variant="outline">
                            {prereq}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Pathway */}
              {assignment.pathway && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Learning Pathway
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete milestones in order to master this assignment
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignment.pathway.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                              {index === 0 ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">
                                {milestone.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {milestone.points} pts
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {milestone.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <strong>Competency Check:</strong>{" "}
                              {milestone.competencyRequirements}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          Total Points Available
                        </span>
                        <span className="font-bold text-lg">
                          {assignment.pathway.totalPoints} pts
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Complete all milestones to earn the full point value
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/ide/${assignmentId}`)}
                      >
                        Begin Learning Journey
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Progress Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="text-center text-muted-foreground">
                      <p>
                        Start your learning journey to begin tracking progress
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Assignment Details
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Get AI Assistance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Code className="w-4 h-4 mr-2" />
                    Open Code Editor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={assignment.title}
          itemName="Assignment"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
