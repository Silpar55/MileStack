"use client";

import { useState, useEffect } from "react";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSession } from "next-auth/react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  progress: number;
  status: "completed" | "in-progress" | "not-started";
  points: number;
  analysisStatus?: "pending" | "processing" | "complete" | "failed";
  originalFilename?: string;
  uploadTimestamp?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
    locked?: boolean;
    points: number;
    description?: string;
  }[];
}

function AssignmentsPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAssignments();
    }
  }, [status]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/assignments");

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data.assignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (assignmentId: string, assignmentTitle: string) => {
    setAssignmentToDelete({ id: assignmentId, title: assignmentTitle });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/assignment/${
          assignmentToDelete.id
        }/delete?title=${encodeURIComponent(assignmentToDelete.title)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete assignment");
      }

      // Remove the assignment from the local state
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentToDelete.id)
      );

      // Close modal and reset state
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert(err instanceof Error ? err.message : "Failed to delete assignment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAssignmentToDelete(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAssignments}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Assignments</h1>
        <Button
          onClick={() => router.push("/assignment/upload")}
          className="bg-gradient-to-r from-primary to-blue-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Assignment
        </Button>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-blue-100">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload New Assignment
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your assignment requirements to create a personalized
            learning pathway
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/assignment/upload")}
              className="bg-gradient-to-r from-primary to-blue-400"
              data-testid="button-upload-assignment"
            >
              Choose File
            </Button>
            <span className="text-sm text-muted-foreground">
              Supports PDF, TXT, and images
            </span>
          </div>
        </CardContent>
      </Card>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first assignment to get started with AI-powered
              learning pathways
            </p>
            <Button
              onClick={() => router.push("/assignment/upload")}
              className="bg-gradient-to-r from-primary to-blue-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onClick={() => router.push(`/assignment/${assignment.id}`)}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={assignmentToDelete?.title || ""}
        itemName="Assignment"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <ProtectedRoute>
      <AssignmentsPageContent />
    </ProtectedRoute>
  );
}
