"use client";

import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Redirect if already authenticated and email is verified
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.isEmailVerified) {
      // Use replace to avoid back button issues and ensure redirect happens
      router.replace("/dashboard");

      // Fallback: if router doesn't work, use window.location
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          window.location.href = "/dashboard";
        }
      }, 100);

      // Additional fallback: force reload if still on login page after 500ms
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          window.location.reload();
        }
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Check if user is authenticated but email not verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!isLoading && isAuthenticated && user && !user.isEmailVerified) {
        setIsCheckingVerification(true);
        // Redirect to verification screen with user's email
        router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }
    };

    checkVerificationStatus();
  }, [isAuthenticated, isLoading, user, router]);

  const handleAuth = () => {
    // Redirect to dashboard after successful authentication
    // Use replace to avoid back button issues
    router.replace("/dashboard");

    // Fallback: if router doesn't work, use window.location
    setTimeout(() => {
      if (window.location.pathname === "/login") {
        window.location.href = "/dashboard";
      }
    }, 100);

    // Additional fallback: force reload if still on login page after 500ms
    setTimeout(() => {
      if (window.location.pathname === "/login") {
        window.location.reload();
      }
    }, 500);
  };

  // Show loading while checking authentication status or verification
  if (isLoading || isCheckingVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {isCheckingVerification
              ? "Checking verification status..."
              : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if authenticated and verified (will redirect)
  if (isAuthenticated && user?.isEmailVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal onAuth={handleAuth} />
    </div>
  );
}
