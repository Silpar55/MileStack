"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Brain,
  Target,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Lock,
  Play,
  RotateCcw,
} from "lucide-react";

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  timeLimit: number;
  maxAttempts: number;
  passingScore: number;
  content: any;
  feedback: any;
}

interface Attempt {
  id: string;
  attemptNumber: number;
  score: number;
  pointsEarned: number;
  timeSpent: number;
  status: string;
  feedback: string;
  startedAt: string;
  completedAt: string;
}

interface Assessment {
  id: string;
  assessmentType: string;
  comprehensionScore: number;
  accuracyScore: number;
  overallScore: number;
  feedback: string;
  isPassed: boolean;
  submittedAt: string;
}

interface CheckpointData {
  checkpoint: Checkpoint;
  attempts: Attempt[];
  assessments: Assessment[];
  totalAttempts: number;
  maxAttempts: number;
  isCompleted: boolean;
  canRetry: boolean;
}

export default function CheckpointPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [checkpointData, setCheckpointData] = useState<CheckpointData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchCheckpoint();
  }, [params.id]);

  useEffect(() => {
    if (checkpointData?.checkpoint.timeLimit && startTime) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const remaining = checkpointData.checkpoint.timeLimit * 60 - elapsed;
        setTimeRemaining(Math.max(0, remaining));

        if (remaining <= 0) {
          handleSubmit();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [checkpointData, startTime]);

  const fetchCheckpoint = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/checkpoint/${params.id}?userId=current-user-id`
      );
      const data = await response.json();

      if (data.success) {
        setCheckpointData(data.data);
        if (data.data.checkpoint.timeLimit) {
          setTimeRemaining(data.data.checkpoint.timeLimit * 60);
        }
      }
    } catch (error) {
      console.error("Error fetching checkpoint:", error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => {
    setStartTime(new Date());
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev: any) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const timeSpent = startTime
        ? Math.floor((Date.now() - startTime.getTime()) / 60000)
        : 0;

      const response = await fetch(`/api/checkpoint/${params.id}/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "current-user-id",
          responses,
          timeSpent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh checkpoint data
        await fetchCheckpoint();
        // Show results or redirect
        if (data.data.isPassed) {
          // Show success message
          alert("Congratulations! You passed the assessment!");
        } else {
          // Show feedback
          alert(
            `Assessment completed. Score: ${data.data.assessmentResult.score}%`
          );
        }
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Error submitting assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCheckpointIcon = (type: string) => {
    switch (type) {
      case "concept-explanation":
        return <Brain className="w-6 h-6" />;
      case "skill-assessment":
        return <Target className="w-6 h-6" />;
      case "code-review":
        return <Code className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkpoint...</p>
        </div>
      </div>
    );
  }

  if (!checkpointData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Checkpoint Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The checkpoint you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/learning-pathways")}>
            Browse Pathways
          </Button>
        </div>
      </div>
    );
  }

  const {
    checkpoint,
    attempts,
    assessments,
    totalAttempts,
    maxAttempts,
    isCompleted,
    canRetry,
  } = checkpointData;
  const latestAttempt = attempts[0];
  const latestAssessment = assessments[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getCheckpointIcon(checkpoint.type)}
                <Badge className="capitalize">
                  {checkpoint.type.replace("-", " ")}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{checkpoint.title}</h1>
              <p className="text-muted-foreground text-lg mb-4">
                {checkpoint.description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span>{checkpoint.points} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{checkpoint.timeLimit} minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>{checkpoint.passingScore}% to pass</span>
                </div>
                <div className="flex items-center space-x-1">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {totalAttempts}/{maxAttempts} attempts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timer */}
          {startTime && timeRemaining > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">Time Remaining:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="w-32">
                    <Progress
                      value={
                        (timeRemaining / (checkpoint.timeLimit * 60)) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assessment Content */}
        {!startTime ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span>Assessment Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Before You Begin
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Read each question carefully</li>
                  <li>• Take your time to think through your answers</li>
                  <li>
                    • You have {checkpoint.timeLimit} minutes to complete this
                    assessment
                  </li>
                  <li>• You need {checkpoint.passingScore}% to pass</li>
                  <li>
                    • You have {maxAttempts - totalAttempts} attempts remaining
                  </li>
                </ul>
              </div>

              {checkpoint.type === "concept-explanation" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Concept Explanation Assessment
                  </h4>
                  <p className="text-sm text-green-800">
                    Explain the key concepts in your own words. Focus on
                    demonstrating your understanding of the fundamental
                    principles and how they apply to the given scenario.
                  </p>
                </div>
              )}

              {checkpoint.type === "skill-assessment" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Skill Assessment
                  </h4>
                  <p className="text-sm text-purple-800">
                    Complete the questions and exercises to demonstrate your
                    practical skills. This may include multiple choice
                    questions, code completion, or practical implementation
                    tasks.
                  </p>
                </div>
              )}

              {checkpoint.type === "code-review" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Code Review Assessment
                  </h4>
                  <p className="text-sm text-orange-800">
                    Analyze the provided code and identify issues, improvements,
                    or potential problems. Demonstrate your ability to
                    critically evaluate code quality and suggest solutions.
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <Button size="lg" onClick={startAssessment}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Assessment Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {checkpoint.type === "concept-explanation" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      {checkpoint.content.prompt}
                    </Label>
                    <Textarea
                      className="mt-2"
                      placeholder="Explain the concepts in your own words..."
                      value={responses.explanation || ""}
                      onChange={(e) =>
                        handleResponseChange("explanation", e.target.value)
                      }
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {checkpoint.type === "skill-assessment" && (
                <div className="space-y-6">
                  {checkpoint.content.questions.map(
                    (question: any, index: number) => (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-primary">
                            {index + 1}.
                          </span>
                          <Label className="text-base font-semibold flex-1">
                            {question.question}
                          </Label>
                        </div>

                        {question.type === "multiple-choice" && (
                          <RadioGroup
                            value={responses[question.id] || ""}
                            onValueChange={(value) =>
                              handleResponseChange(question.id, value)
                            }
                          >
                            {question.options.map(
                              (option: string, optionIndex: number) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`${question.id}-${optionIndex}`}
                                  />
                                  <Label
                                    htmlFor={`${question.id}-${optionIndex}`}
                                    className="flex-1"
                                  >
                                    {option}
                                  </Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        )}

                        {question.type === "code-completion" && (
                          <Textarea
                            placeholder="Complete the code..."
                            value={responses[question.id] || ""}
                            onChange={(e) =>
                              handleResponseChange(question.id, e.target.value)
                            }
                            rows={6}
                            className="font-mono"
                          />
                        )}

                        {question.type === "practical-implementation" && (
                          <Textarea
                            placeholder="Write your implementation..."
                            value={responses[question.id] || ""}
                            onChange={(e) =>
                              handleResponseChange(question.id, e.target.value)
                            }
                            rows={8}
                            className="font-mono"
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {checkpoint.type === "code-review" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      Code to Review:
                    </Label>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{checkpoint.content.codeSnippet}</code>
                    </pre>
                  </div>
                  <div>
                    <Label className="text-base font-semibold">
                      Your Analysis:
                    </Label>
                    <Textarea
                      className="mt-2"
                      placeholder="Identify issues, improvements, and provide your analysis..."
                      value={responses.analysis || ""}
                      onChange={(e) =>
                        handleResponseChange("analysis", e.target.value)
                      }
                      rows={8}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStartTime(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Previous Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {attempt.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          Attempt {attempt.attemptNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-semibold">{attempt.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{attempt.pointsEarned}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                      <Badge className={getStatusColor(attempt.status)}>
                        {attempt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {latestAssessment && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {latestAssessment.isPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Latest Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {latestAssessment.overallScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Overall Score
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {latestAssessment.comprehensionScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Comprehension
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {latestAssessment.accuracyScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>

                {latestAssessment.feedback && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Feedback</h4>
                    <p className="text-sm text-muted-foreground">
                      {latestAssessment.feedback}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
