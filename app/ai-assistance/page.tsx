"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PointsBalance {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
}

interface AIAssistanceResponse {
  success: boolean;
  response: string;
  pointsDeducted: number;
  remainingBalance: number;
  error?: string;
}

export default function AIAssistancePage() {
  const { user } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(
    null
  );
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(1);
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState({
    assignmentType: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    topics: [] as string[],
    studentLevel: "",
  });
  const [response, setResponse] = useState<AIAssistanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPointsBalance();
    }
  }, [user]);

  const fetchPointsBalance = async () => {
    try {
      const res = await fetch("/api/points/balance");
      const data = await res.json();
      setPointsBalance(data);
    } catch (error) {
      console.error("Error fetching points balance:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          assignmentId: "current-assignment", // This would come from the current assignment context
          question: question.trim(),
          context,
          assistanceLevel: selectedLevel,
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (data.success) {
        setQuestion("");
        fetchPointsBalance(); // Refresh points balance
      }
    } catch (error) {
      console.error("Error requesting AI assistance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1:
        return {
          title: "Level 1: Conceptual Hints (5 points)",
          description:
            "Get conceptual guidance and Socratic questioning to help you think through the problem.",
          features: [
            "Concept clarification",
            "Direction guidance",
            "Socratic questioning",
            "No code solutions",
          ],
        };
      case 2:
        return {
          title: "Level 2: Pseudocode Structure (15 points)",
          description:
            "Receive high-level algorithmic approach and logical flow suggestions.",
          features: [
            "Algorithmic approach",
            "Logical flow",
            "Structure suggestions",
            "No specific code",
          ],
        };
      case 3:
        return {
          title: "Level 3: Code Review & Feedback (25 points)",
          description:
            "Get feedback on your existing code with educational explanations.",
          features: [
            "Code analysis",
            "Bug identification",
            "Refactoring suggestions",
            "Best practices",
          ],
        };
      case 4:
        return {
          title: "Level 4: AI Copilot Session (50 points)",
          description:
            "30-minute collaborative coding session with real-time guidance.",
          features: [
            "Real-time collaboration",
            "Pair programming",
            "Educational explanations",
            "Session transcript",
          ],
        };
      default:
        return { title: "", description: "", features: [] };
    }
  };

  const levelInfo = getLevelDescription(selectedLevel);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access AI assistance
          </h1>
          <p className="text-gray-600">
            You need to be logged in to use the AI assistance system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Learning Assistant
            </h1>
            <p className="text-gray-600">
              Get educational guidance without complete solutions. Choose your
              assistance level and ask your question.
            </p>
          </div>

          {/* Points Balance */}
          {pointsBalance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Your Points Balance
                  </h3>
                  <p className="text-blue-700">
                    Current: {pointsBalance.currentBalance} points | Earned:{" "}
                    {pointsBalance.totalEarned} | Spent:{" "}
                    {pointsBalance.totalSpent}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {pointsBalance.currentBalance}
                  </div>
                  <div className="text-sm text-blue-600">points available</div>
                </div>
              </div>
            </div>
          )}

          {/* Assistance Level Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Assistance Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level as 1 | 2 | 3 | 4)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedLevel === level
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      Level {level}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {level === 1 && "5 points"}
                      {level === 2 && "15 points"}
                      {level === 3 && "25 points"}
                      {level === 4 && "50 points"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getLevelDescription(level).title.split(": ")[1]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Level Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {levelInfo.title}
            </h3>
            <p className="text-gray-700 mb-3">{levelInfo.description}</p>
            <div className="flex flex-wrap gap-2">
              {levelInfo.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Question Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your question here... Be specific about what you're trying to understand or implement."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>

            {/* Context Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="assignmentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Assignment Type
                </label>
                <input
                  type="text"
                  id="assignmentType"
                  value={context.assignmentType}
                  onChange={(e) =>
                    setContext({ ...context, assignmentType: e.target.value })
                  }
                  placeholder="e.g., Algorithm Implementation, Web Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={context.difficulty}
                  onChange={(e) =>
                    setContext({
                      ...context,
                      difficulty: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="topics"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Topics (comma-separated)
              </label>
              <input
                type="text"
                id="topics"
                value={context.topics.join(", ")}
                onChange={(e) =>
                  setContext({
                    ...context,
                    topics: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t),
                  })
                }
                placeholder="e.g., recursion, data structures, algorithms"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="studentLevel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Experience Level
              </label>
              <input
                type="text"
                id="studentLevel"
                value={context.studentLevel}
                onChange={(e) =>
                  setContext({ ...context, studentLevel: e.target.value })
                }
                placeholder="e.g., First year CS student, Self-taught developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !question.trim() ||
                (pointsBalance !== null &&
                  pointsBalance.currentBalance <
                    (selectedLevel === 1
                      ? 5
                      : selectedLevel === 2
                      ? 15
                      : selectedLevel === 3
                      ? 25
                      : 50))
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Request Level ${selectedLevel} Assistance`}
            </button>
          </form>

          {/* Response */}
          {response && (
            <div className="mt-8">
              <div
                className={`p-4 rounded-lg ${
                  response.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    response.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {response.success ? "AI Response" : "Error"}
                </h3>
                {response.success ? (
                  <div>
                    <div className="text-green-800 mb-3">
                      <strong>Points deducted:</strong>{" "}
                      {response.pointsDeducted} |
                      <strong> Remaining balance:</strong>{" "}
                      {response.remainingBalance}
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <pre className="whitespace-pre-wrap text-gray-900">
                        {response.response}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-800">{response.error}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
