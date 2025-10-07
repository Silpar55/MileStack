"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IDE } from "@/components/ide/IDE";
import { useAuth } from "@/contexts/AuthContext";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
  isSelected?: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  isOnline: boolean;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

export default function IDEPage() {
  const params = useParams();
  const { user } = useAuth();
  const assignmentId = params.assignment_id as string;

  const [workspace, setWorkspace] = useState<{
    files: FileNode[];
    collaborators: Collaborator[];
    settings: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentId && user) {
      loadWorkspace();
    }
  }, [assignmentId, user]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/workspace/${assignmentId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await response.json();

      if (data.success) {
        setWorkspace({
          files: data.workspace.files || [],
          collaborators: data.workspace.collaborators || [],
          settings: data.workspace.settings || {},
        });
      } else {
        setError(data.error || "Failed to load workspace");
      }
    } catch (err) {
      setError("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (files: FileNode[]) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/workspace/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          assignmentId,
          files,
          isAutoSave: true,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Save failed:", data.error);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleExecute = async (
    code: string,
    language: string
  ): Promise<ExecutionResult> => {
    try {
      const response = await fetch("/api/workspace/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          assignmentId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error || "Execution failed");
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Execution failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in
          </h1>
          <p className="text-gray-600">
            You need to be logged in to access the IDE.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900">
            Loading IDE...
          </h2>
          <p className="text-gray-600">Setting up your coding environment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadWorkspace}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Workspace not found
          </h1>
          <p className="text-gray-600">
            The requested workspace could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <IDE
        assignmentId={assignmentId}
        initialFiles={workspace.files}
        onSave={handleSave}
        onExecute={handleExecute}
        collaborators={workspace.collaborators}
        currentUser={{
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: "owner",
          isOnline: true,
        }}
        className="h-full"
      />
    </div>
  );
}
