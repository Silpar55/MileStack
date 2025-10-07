"use client";

import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Redirect if already authenticated and email is verified
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.isEmailVerified) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Check if user is authenticated but email not verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!isLoading && isAuthenticated && user && !user.isEmailVerified) {
        setIsCheckingVerification(true);
        // Redirect to verification screen with user's email
        router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }
    };

    checkVerificationStatus();
  }, [isAuthenticated, isLoading, user, router]);

  const handleAuth = () => {
    // For new signups, redirect to email verification first
    router.push("/verify-email");
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
