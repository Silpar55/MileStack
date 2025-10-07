"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CopilotMessage {
  id: string;
  timestamp: Date;
  sender: "student" | "ai";
  content: string;
  messageType:
    | "question"
    | "explanation"
    | "guidance"
    | "code_review"
    | "suggestion";
}

interface CopilotSession {
  sessionId: string;
  isActive: boolean;
  startTime: Date;
  duration: number;
}

export default function AICopilotPage() {
  const { user } = useAuth();
  const [session, setSession] = useState<CopilotSession | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      // Check if there's an active session
      checkActiveSession();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session && session.isActive) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - session.startTime.getTime();
        const remaining = Math.max(0, 30 * 60 * 1000 - elapsed); // 30 minutes in milliseconds
        setTimeRemaining(remaining);

        if (remaining === 0) {
          endSession();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkActiveSession = async () => {
    // This would check for existing active sessions
    // For now, we'll assume no active sessions
  };

  const startSession = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          assignmentId: "current-assignment", // This would come from the current assignment context
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSession({
          sessionId: data.sessionId,
          isActive: true,
          startTime: new Date(),
          duration: 0,
        });
        setMessages([
          {
            id: "welcome",
            timestamp: new Date(),
            sender: "ai",
            content: data.response,
            messageType: "guidance",
          },
        ]);
      } else {
        alert(data.error || "Failed to start copilot session");
      }
    } catch (error) {
      console.error("Error starting copilot session:", error);
      alert("Failed to start copilot session");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!session || !newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/ai/session/${session.sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Add student message
        const studentMessage: CopilotMessage = {
          id: `msg_${Date.now()}`,
          timestamp: new Date(),
          sender: "student",
          content: newMessage.trim(),
          messageType: "question",
        };
        setMessages((prev) => [...prev, studentMessage]);

        // Add AI response
        const aiMessage: CopilotMessage = {
          id: `msg_${Date.now() + 1}`,
          timestamp: new Date(),
          sender: "ai",
          content: data.response,
          messageType: "guidance",
        };
        setMessages((prev) => [...prev, aiMessage]);

        setNewMessage("");
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/ai/session/${session.sessionId}/end`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setSession(null);
        setMessages([]);
        setTimeRemaining(0);
        alert(data.response);
      } else {
        alert(data.error || "Failed to end session");
      }
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access AI copilot
          </h1>
          <p className="text-gray-600">
            You need to be logged in to use the AI copilot system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Copilot Session
                </h1>
                <p className="text-gray-600">
                  30-minute collaborative coding session
                </p>
              </div>
              {session && (
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-500">remaining</div>
                </div>
              )}
            </div>
          </div>

          {/* Session Controls */}
          <div className="px-6 py-4 bg-gray-50">
            {!session ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Start a 30-minute AI copilot session to get real-time coding
                  guidance.
                </p>
                <button
                  onClick={startSession}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Starting..."
                    : "Start Copilot Session (50 points)"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-green-600 font-semibold">
                  Session Active
                </div>
                <button
                  onClick={endSession}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Ending..." : "End Session"}
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {session && (
            <div className="h-96 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "student"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === "student"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.sender === "student" ? "You" : "AI Assistant"}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === "student"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Message Input */}
          {session && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !loading && sendMessage()
                  }
                  placeholder="Ask your question or share your code..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}

          {/* Session Info */}
          {session && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Session ID:</strong> {session.sessionId}
                </p>
                <p className="mb-2">
                  <strong>Started:</strong> {session.startTime.toLocaleString()}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {Math.round(
                    (Date.now() - session.startTime.getTime()) / 1000 / 60
                  )}{" "}
                  minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
