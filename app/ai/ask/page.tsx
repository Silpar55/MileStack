"use client";

import { useState } from "react";
import { AIAssistantChat } from "@/components/AIAssistantChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Clock, Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AIAskPage() {
  const router = useRouter();
  const [availablePoints] = useState(25);

  const assistanceOptions = [
    {
      id: "conceptual",
      title: "Conceptual Hint",
      description: "Get a gentle nudge in the right direction",
      points: 5,
      icon: Brain,
      color: "text-blue-500",
    },
    {
      id: "pseudocode",
      title: "Pseudocode Guide",
      description: "Receive step-by-step pseudocode structure",
      points: 15,
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      id: "review",
      title: "Code Review",
      description: "Get feedback on your existing code",
      points: 25,
      icon: Shield,
      color: "text-green-500",
    },
  ];

  const recentSessions = [
    {
      id: 1,
      title: "React State Management",
      timestamp: "2 hours ago",
      pointsUsed: 10,
      type: "Conceptual Hint",
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      timestamp: "1 day ago",
      pointsUsed: 15,
      type: "Pseudocode Guide",
    },
    {
      id: 3,
      title: "API Integration",
      timestamp: "3 days ago",
      pointsUsed: 25,
      type: "Code Review",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">AI Learning Assistant</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2">
          <AIAssistantChat availablePoints={availablePoints} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Points Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Points Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {availablePoints}
                </div>
                <p className="text-sm text-muted-foreground">
                  Available for AI assistance
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => console.log("Earn more points")}
                >
                  Earn More Points
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assistance Options */}
          <Card>
            <CardHeader>
              <CardTitle>Assistance Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assistanceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => console.log("Selected:", option.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-2 ${option.color}`} />
                        <span className="font-medium">{option.title}</span>
                      </div>
                      <Badge variant="outline">{option.points} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => console.log("View session:", session.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {session.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {session.type}
                      </span>
                      <span className="text-xs text-primary">
                        -{session.pointsUsed} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => console.log("View all sessions")}
              >
                View All Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Academic Integrity */}
          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Academic Integrity
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    AI assistance is designed to guide your learning, not
                    replace your work. All interactions are logged for
                    transparency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
