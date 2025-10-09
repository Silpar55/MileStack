"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/Dashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileSetupGuard } from "@/components/auth/ProfileSetupGuard";

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  streak: number;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  progress: number;
  status: string;
  points: number;
  milestones?: Milestone[];
}

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  locked?: boolean;
  progress?: number;
  points: number;
}

function DashboardPageContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const profileResponse = await fetch('/api/profile/status');
      const profileData = await profileResponse.json();
      
      // Fetch points balance
      const pointsResponse = await fetch('/api/points/balance');
      const pointsData = await pointsResponse.json();
      
      // Fetch assignments
      const assignmentsResponse = await fetch('/api/assignments');
      const assignmentsData = await assignmentsResponse.json();
      
      // Fetch achievements
      const achievementsResponse = await fetch('/api/achievements');
      const achievementsData = await achievementsResponse.json();

      // Set user data
      setUser({
        id: session?.user?.id || '',
        name: profileData.name || session?.user?.name || 'User',
        email: session?.user?.email || '',
        points: pointsData.currentBalance || 0,
        level: Math.floor((pointsData.totalEarned || 0) / 100) + 1,
        streak: profileData.streak || 0,
      });

      // Set assignments data - convert string IDs to numbers for compatibility
      const processedAssignments = (assignmentsData || []).map((assignment: any) => ({
        ...assignment,
        id: parseInt(assignment.id) || assignment.id,
        milestones: assignment.milestones?.map((milestone: any) => ({
          ...milestone,
          id: parseInt(milestone.id) || milestone.id,
        })) || [],
      }));
      setAssignments(processedAssignments);
      
      // Set achievements data
      setAchievements(achievementsData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading user data...</p>
      </div>
    );
  }

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
      <ProfileSetupGuard>
        <DashboardPageContent />
      </ProfileSetupGuard>
    </ProtectedRoute>
  );
}
