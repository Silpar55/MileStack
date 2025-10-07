"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Brain,
  Code,
  Clock,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  subcategory: string;
  points: number;
  timeLimit: number;
  memoryLimit: number;
  prerequisites: string[];
  tags: string[];
  starterCode: Record<string, string>;
  testCases: Array<{
    input: any;
    expectedOutput: any;
    description: string;
    isHidden: boolean;
  }>;
  expectedOutput: string;
  hints: string[];
  solution: string;
}

interface CustomChallengeGeneratorProps {
  onChallengeGenerated?: (challenge: GeneratedChallenge) => void;
}

export function CustomChallengeGenerator({
  onChallengeGenerated,
}: CustomChallengeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedChallenge, setGeneratedChallenge] =
    useState<GeneratedChallenge | null>(null);

  const [formData, setFormData] = useState({
    concepts: "",
    difficulty: "intermediate",
    category: "algorithms",
    subcategory: "",
    timeLimit: 30,
    language: "javascript",
  });

  const [conceptTags, setConceptTags] = useState<string[]>([]);

  const handleConceptAdd = () => {
    if (
      formData.concepts.trim() &&
      !conceptTags.includes(formData.concepts.trim())
    ) {
      setConceptTags([...conceptTags, formData.concepts.trim()]);
      setFormData({ ...formData, concepts: "" });
    }
  };

  const handleConceptRemove = (concept: string) => {
    setConceptTags(conceptTags.filter((c) => c !== concept));
  };

  const handleGenerate = async () => {
    if (conceptTags.length === 0) {
      alert("Please add at least one concept");
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/challenges/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts: conceptTags,
          difficulty: formData.difficulty,
          category: formData.category,
          subcategory: formData.subcategory,
          timeLimit: formData.timeLimit * 60, // Convert to seconds
          language: formData.language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedChallenge(data.challenge);
        setProgress(100);
        if (onChallengeGenerated) {
          onChallengeGenerated(data.challenge);
        }
      } else {
        console.error("Failed to generate challenge:", data.error);
        alert("Failed to generate challenge. Please try again.");
      }
    } catch (error) {
      console.error("Error generating challenge:", error);
      alert("Error generating challenge. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveChallenge = async () => {
    if (!generatedChallenge) return;

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...generatedChallenge,
          createdBy: "user-123", // In real app, get from auth context
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          "Challenge saved successfully! It will be reviewed before going live."
        );
        setIsOpen(false);
        setGeneratedChallenge(null);
        setConceptTags([]);
        setFormData({
          concepts: "",
          difficulty: "intermediate",
          category: "algorithms",
          subcategory: "",
          timeLimit: 30,
          language: "javascript",
        });
      } else {
        console.error("Failed to save challenge:", data.error);
        alert("Failed to save challenge. Please try again.");
      }
    } catch (error) {
      console.error("Error saving challenge:", error);
      alert("Error saving challenge. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Custom Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Challenge Generator
          </DialogTitle>
          <DialogDescription>
            Create a custom programming challenge using AI. Specify the concepts
            you want to practice, and our AI will generate a tailored challenge
            for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generation Form */}
          {!generatedChallenge && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Programming Concepts
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="e.g., arrays, recursion, dynamic programming"
                        value={formData.concepts}
                        onChange={(e) =>
                          setFormData({ ...formData, concepts: e.target.value })
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleConceptAdd()
                        }
                      />
                      <Button onClick={handleConceptAdd} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conceptTags.map((concept) => (
                        <Badge
                          key={concept}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleConceptRemove(concept)}
                        >
                          {concept} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Difficulty Level
                      </label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          setFormData({ ...formData, difficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-structures">
                            Data Structures
                          </SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="web-dev">
                            Web Development
                          </SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="system-design">
                            System Design
                          </SelectItem>
                          <SelectItem value="machine-learning">
                            Machine Learning
                          </SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="mobile-dev">
                            Mobile Development
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Time Limit (minutes)
                      </label>
                      <Input
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timeLimit: parseInt(e.target.value) || 30,
                          })
                        }
                        min="5"
                        max="180"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Preferred Language
                      </label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) =>
                          setFormData({ ...formData, language: value })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Progress */}
              {generating && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Generating Challenge...
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="w-full" />
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">
                          AI is crafting your custom challenge...
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || conceptTags.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Challenge
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Generated Challenge Preview */}
          {generatedChallenge && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Generated Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {generatedChallenge.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="outline">
                        {generatedChallenge.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {generatedChallenge.category}
                      </Badge>
                      <Badge variant="outline">
                        {generatedChallenge.points} pts
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(generatedChallenge.timeLimit / 60)} min
                      </Badge>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {generatedChallenge.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Test Cases ({generatedChallenge.testCases.length})
                    </h4>
                    <div className="space-y-2">
                      {generatedChallenge.testCases.map((testCase, index) => (
                        <div
                          key={index}
                          className="p-3 bg-muted rounded text-sm"
                        >
                          <div className="font-medium mb-1">
                            Test Case {index + 1}{" "}
                            {testCase.isHidden && "(Hidden)"}
                          </div>
                          <div className="text-muted-foreground">
                            <div>
                              <strong>Input:</strong>{" "}
                              {JSON.stringify(testCase.input)}
                            </div>
                            <div>
                              <strong>Expected:</strong>{" "}
                              {JSON.stringify(testCase.expectedOutput)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Hints ({generatedChallenge.hints.length})
                    </h4>
                    <div className="space-y-1">
                      {generatedChallenge.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm"
                        >
                          <strong>Hint {index + 1}:</strong> {hint}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Starter Code</h4>
                    <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                      <code>
                        {generatedChallenge.starterCode[formData.language] ||
                          generatedChallenge.starterCode.javascript}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedChallenge(null)}
                >
                  Generate Another
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChallenge}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Challenge
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
