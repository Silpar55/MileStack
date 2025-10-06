"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Clock,
  Zap,
  Brain,
  MessageSquare,
  Download,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  pointsCost?: number;
}

interface Session {
  id: string;
  title: string;
  createdAt: Date;
  totalPointsUsed: number;
  messages: Message[];
  status: "active" | "completed" | "archived";
}

export default function AISessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock session data - in real app, fetch from API
    const mockSession: Session = {
      id: sessionId,
      title: "React State Management Help",
      createdAt: new Date("2024-01-15T10:30:00Z"),
      totalPointsUsed: 15,
      messages: [
        {
          id: "1",
          type: "user",
          content:
            "I'm having trouble with React state management. Can you help me understand useState?",
          timestamp: new Date("2024-01-15T10:30:00Z"),
        },
        {
          id: "2",
          type: "ai",
          content:
            "I'd be happy to help! Let's start with the basics. What do you think happens when you call setState in a React component?",
          timestamp: new Date("2024-01-15T10:30:15Z"),
          pointsCost: 5,
        },
        {
          id: "3",
          type: "user",
          content: "I think it updates the state and re-renders the component?",
          timestamp: new Date("2024-01-15T10:31:00Z"),
        },
        {
          id: "4",
          type: "ai",
          content:
            "Exactly right! Now, here's a step-by-step guide to useState:\n\n1. Import useState from React\n2. Call useState with initial value\n3. Use the setter function to update state\n\nWould you like me to show you a practical example?",
          timestamp: new Date("2024-01-15T10:31:30Z"),
          pointsCost: 10,
        },
      ],
      status: "completed",
    };

    setTimeout(() => {
      setSession(mockSession);
      setLoading(false);
    }, 1000);
  }, [sessionId]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const downloadSession = () => {
    if (!session) return;

    const sessionData = {
      title: session.title,
      createdAt: session.createdAt,
      totalPointsUsed: session.totalPointsUsed,
      messages: session.messages,
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-session-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested AI session could not be found.
          </p>
          <Button onClick={() => router.push("/ai/ask")}>
            Back to AI Assistant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {session.createdAt.toLocaleDateString()}
                <span className="mx-2">•</span>
                <Zap className="w-4 h-4 mr-1" />
                {session.totalPointsUsed} points used
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={session.status === "active" ? "default" : "secondary"}
            >
              {session.status}
            </Badge>
            <Button variant="outline" size="sm" onClick={downloadSession}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Session Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="w-8 h-8 mx-2">
                      <AvatarFallback>
                        {message.type === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.pointsCost && (
                          <Badge variant="outline" className="text-xs">
                            -{message.pointsCost} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.messages.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {session.totalPointsUsed}
                </div>
                <p className="text-sm text-muted-foreground">Points Used</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    (session.messages.filter((m) => m.type === "ai").length /
                      session.messages.length) *
                      100
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">AI Assistance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

