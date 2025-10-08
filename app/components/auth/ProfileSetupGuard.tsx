"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileSetupGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProfileSetupGuard({
  children,
  fallback,
}: ProfileSetupGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Routes that don't require profile setup check
  const skipProfileCheckRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/profile-setup",
    "/",
  ];

  useEffect(() => {
    const checkProfileSetup = async () => {
      if (isLoading) return;

      // Skip check for non-authenticated users or specific routes
      if (!isAuthenticated || skipProfileCheckRoutes.includes(pathname)) {
        setIsCheckingProfile(false);
        return;
      }

      // Skip check for profile-setup page itself
      if (pathname === "/profile-setup") {
        setIsCheckingProfile(false);
        return;
      }

      try {
        // Check if user has completed profile setup
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add Authorization header only if we have a JWT token (for manual login users)
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/profile/status", {
          method: "GET",
          headers,
          credentials: "include", // Include NextAuth session cookies for OAuth users
        });

        if (response.ok) {
          const data = await response.json();

          // If profile setup is not completed, redirect to profile setup
          if (!data.hasVisitedProfileSetup) {
            router.push("/profile-setup");
            return;
          }
        } else if (response.status === 401) {
          // Token expired or invalid, redirect to login
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error checking profile setup status:", error);
        // On error, allow access (fail open for better UX)
      }

      setIsCheckingProfile(false);
    };

    checkProfileSetup();
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || isCheckingProfile) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Checking your profile...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages that require profile setup
export function withProfileSetup<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
  } = {}
) {
  return function WithProfileSetupComponent(props: P) {
    return (
      <ProfileSetupGuard {...options}>
        <Component {...props} />
      </ProfileSetupGuard>
    );
  };
}
