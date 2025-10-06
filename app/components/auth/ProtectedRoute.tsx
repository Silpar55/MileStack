"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  requireEmailVerification = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requireEmailVerification && user && !user.isEmailVerified) {
        router.push("/verify-email");
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requireEmailVerification,
    router,
    redirectTo,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be logged in to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requireEmailVerification && user && !user.isEmailVerified) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Email Verification Required</h1>
            <p className="text-muted-foreground">
              Please verify your email address to continue.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireEmailVerification?: boolean;
    redirectTo?: string;
    fallback?: React.ReactNode;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
