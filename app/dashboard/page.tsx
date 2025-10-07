"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function DashboardPageContent() {
  const router = useRouter();

  // Mock user data
  const user = {
    id: 1,
    name: "John Doe",
    email: "john.doe@university.edu",
    points: 420,
    level: 6,
    streak: 7,
  };

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
    <Dashboard
      user={user}
      currentAssignment={assignments[0]}
      onContinueAssignment={() => router.push("/assignments")}
      onRequestAssistance={() => router.push("/ai/ask")}
    />
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
