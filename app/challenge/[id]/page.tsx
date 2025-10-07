"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Star,
  Trophy,
  Lightbulb,
  Code,
  TestTube,
  TrendingUp,
  Users,
  Timer,
  Brain,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  subcategory?: string;
  points: number;
  timeLimit?: number;
  memoryLimit?: number;
  tags: string[];
  rating: number;
  ratingCount: number;
  submissionCount: number;
  solvedCount: number;
  starterCode: Record<string, string>;
  testCases: Array<{
    input: any;
    expectedOutput: any;
    description: string;
    isHidden: boolean;
  }>;
  hints: string[];
  solution?: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Submission {
  id: string;
  status: string;
  language: string;
  executionTime: number;
  pointsEarned: number;
  submittedAt: string;
}

interface ChallengeStats {
  totalSubmissions: number;
  passedSubmissions: number;
  averageExecutionTime: number;
  languages: string[];
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [relatedChallenges, setRelatedChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/challenges/${challengeId}`);
        const data = await response.json();

        if (response.ok) {
          setChallenge(data.challenge);
          setUserProgress(data.userProgress);
          setRecentSubmissions(data.recentSubmissions);
          setStats(data.stats);
          setRelatedChallenges(data.relatedChallenges);

          // Set initial code from starter code
          if (
            data.challenge.starterCode &&
            data.challenge.starterCode[selectedLanguage]
          ) {
            setCode(data.challenge.starterCode[selectedLanguage]);
          }
        } else {
          console.error("Failed to fetch challenge:", data.error);
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId, selectedLanguage]);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          userId: "user-123", // In real app, get from auth context
          code,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionResult(data);
        // Refresh challenge data to update progress
        window.location.reload();
      } else {
        console.error("Submission failed:", data.error);
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      case "expert":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested challenge could not be found.
          </p>
          <Button onClick={() => router.push("/challenge/library")}>
            Back to Challenge Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{challenge.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="outline">
                  {challenge.category.replace("-", " ")}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-1" />
                  {challenge.rating.toFixed(1)} ({challenge.ratingCount})
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4 mr-1" />
                  {challenge.points} pts
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userProgress && (
              <Badge variant="outline">
                {userProgress.status === "completed"
                  ? "Completed"
                  : userProgress.status === "in-progress"
                  ? "In Progress"
                  : "Not Started"}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{challenge.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Code Editor
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !code.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {submitting ? "Running..." : "Run Code"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your solution here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Submission Result */}
            {submissionResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getStatusIcon(submissionResult.executionResult.status)}
                    <span className="ml-2">Submission Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          submissionResult.executionResult.status === "passed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {submissionResult.executionResult.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Execution Time:</span>
                      <span>
                        {submissionResult.executionResult.executionTime}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Points Earned:</span>
                      <span className="text-primary font-bold">
                        {submissionResult.pointsEarned}
                      </span>
                    </div>
                    {submissionResult.executionResult.testResults && (
                      <div>
                        <h4 className="font-medium mb-2">Test Results:</h4>
                        <div className="space-y-2">
                          {submissionResult.executionResult.testResults.map(
                            (result: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <span className="text-sm">
                                  Test Case {index + 1}
                                </span>
                                <div className="flex items-center">
                                  {result.passed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                                  )}
                                  <span className="text-sm">
                                    {result.executionTime}ms
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Points:</span>
                  <span className="font-medium">{challenge.points}</span>
                </div>
                {challenge.timeLimit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 mr-1" />
                      <span>{Math.floor(challenge.timeLimit / 60)} min</span>
                    </div>
                  </div>
                )}
                {challenge.memoryLimit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Brain Limit:</span>
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-1" />
                      <span>{challenge.memoryLimit} MB</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Solved by:</span>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{challenge.solvedCount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submissions:</span>
                  <span>{challenge.submissionCount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hints */}
            {challenge.hints && challenge.hints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Hints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                      className="w-full"
                    >
                      {showHints ? "Hide Hints" : "Show Hints"}
                    </Button>
                    {showHints && (
                      <div className="space-y-2">
                        {challenge.hints.map((hint, index) => (
                          <div
                            key={index}
                            className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
                          >
                            <strong>Hint {index + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Submissions */}
            {recentSubmissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center">
                          {getStatusIcon(submission.status)}
                          <span className="ml-2 text-sm">
                            {submission.language}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {submission.executionTime}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenge Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">
                      {(
                        (stats.passedSubmissions / stats.totalSubmissions) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="font-medium">
                      {Math.round(stats.averageExecutionTime)}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {stats.languages.slice(0, 3).map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Challenges */}
            {relatedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {relatedChallenges.map((related) => (
                      <div
                        key={related.id}
                        className="p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => router.push(`/challenge/${related.id}`)}
                      >
                        <div className="font-medium text-sm">
                          {related.title}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{related.difficulty}</span>
                          <span>{related.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
