"use client";

import { useState } from "react";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function AssignmentsPageContent() {
  const router = useRouter();

  // Mock assignments data
  const assignments = [
    {
      id: 1,
      title: "Build a React Todo App",
      course: "CS 2024",
      dueDate: "Oct 8, 2025",
      progress: 60,
      status: "in-progress" as const,
      points: 150,
      milestones: [
        {
          id: 1,
          title: "Setup React Environment",
          completed: true,
          points: 30,
        },
        {
          id: 2,
          title: "Create Component Structure",
          completed: true,
          points: 40,
        },
        {
          id: 3,
          title: "Implement State Management",
          completed: false,
          progress: 60,
          points: 50,
        },
        {
          id: 4,
          title: "Add CRUD Operations",
          completed: false,
          locked: true,
          points: 30,
        },
      ],
    },
    {
      id: 2,
      title: "Database Design Project",
      course: "CS 3010",
      dueDate: "Oct 5, 2025",
      progress: 100,
      status: "completed" as const,
      points: 200,
    },
    {
      id: 3,
      title: "Algorithm Analysis",
      course: "CS 2050",
      dueDate: "Oct 12, 2025",
      progress: 0,
      status: "not-started" as const,
      points: 100,
    },
    {
      id: 4,
      title: "API Development",
      course: "CS 3020",
      dueDate: "Oct 10, 2025",
      progress: 35,
      status: "in-progress" as const,
      points: 125,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onClick={() => console.log("View assignment:", assignment.title)}
          />
        ))}
      </div>
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
