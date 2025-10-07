"use client";

import { Navigation } from "./Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [points, setPoints] = useState(0);
  const pathname = usePathname();

  // Routes where navigation should not be displayed
  const noNavRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Hide navigation on verify-email page when redirecting (success state)
  const isVerifyEmailSuccess =
    pathname === "/verify-email" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("success") === "true";

  const shouldShowNavigation =
    !noNavRoutes.includes(pathname) && !isVerifyEmailSuccess;

  // Fetch user points when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPoints();
    }
  }, [isAuthenticated, user]);

  const fetchUserPoints = async () => {
    try {
      // For NextAuth users, we don't need to pass a token
      // The API should handle authentication via NextAuth session
      const response = await fetch("/api/points/balance");
      const data = await response.json();
      if (data.success) {
        setPoints(data.data.currentBalance);
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For auth pages, don't show navigation
  if (!shouldShowNavigation) {
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    );
  }

  // For authenticated users, show full navigation with user data
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          onLogout={handleLogout}
          points={points}
          userName={`${user.firstName} ${user.lastName}`}
          userEmail={user.email}
          isAuthenticated={true}
        />
        <main>{children}</main>
      </div>
    );
  }

  // For non-authenticated users on non-auth pages, show navigation without user data
  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onLogout={handleLogout}
        points={0}
        userName="Guest"
        userEmail=""
        isAuthenticated={false}
      />
      <main>{children}</main>
    </div>
  );
}
