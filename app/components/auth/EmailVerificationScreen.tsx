"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { MilestackLogo } from "../MilestackLogo";
import { useAuth } from "@/contexts/AuthContext";

interface EmailVerificationScreenProps {
  email?: string;
  onVerified?: () => void;
  onBack?: () => void;
  autoRedirect?: boolean;
}

interface VerificationStatus {
  isVerified: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
}

export function EmailVerificationScreen({
  email,
  onVerified,
  onBack,
  autoRedirect = true,
}: EmailVerificationScreenProps) {
  const router = useRouter();
  const { user, refreshToken } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    isLoading: false,
    lastChecked: null,
  });
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Get email from props or user context
  const userEmail = email || user?.email || "";

  // Check verification status
  const checkVerificationStatus = useCallback(
    async (isInitialCheck = false) => {
      if (!userEmail) return;

      // Only show loading on initial check, not on polling
      if (isInitialCheck) {
        setStatus((prev) => ({ ...prev, isLoading: true }));
      }

      try {
        // Use the auth context's user data if available, otherwise fetch from API
        let userData;
        if (user && user.email === userEmail) {
          userData = user;
        } else {
          // Use the new check-verification endpoint that doesn't require authentication
          const response = await fetch(
            `/api/auth/check-verification?email=${encodeURIComponent(
              userEmail
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            setStatus((prev) => ({
              ...prev,
              isLoading: false,
            }));
            return;
          }

          userData = await response.json();
        }

        const isVerified = userData.isEmailVerified;

        setStatus({
          isVerified,
          isLoading: false,
          lastChecked: new Date(),
        });

        if (isVerified && autoRedirect) {
          // Refresh auth context and redirect
          if (refreshToken) {
            await refreshToken();
          }
          onVerified?.();
          router.push("/dashboard");
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [userEmail, user, refreshToken, onVerified, router, autoRedirect]
  );

  // Resend verification email
  const resendVerificationEmail = useCallback(async () => {
    if (!userEmail || resendCooldown > 0) return;

    setStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        // Start cooldown timer
        setResendCooldown(60);
        setStatus((prev) => ({ ...prev, isLoading: false }));
      } else {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [userEmail, resendCooldown]);

  // Start polling for verification status
  useEffect(() => {
    if (!userEmail || status.isVerified) return;

    // Initial check
    checkVerificationStatus(true);

    // Set up polling every 3 seconds
    const interval = setInterval(() => checkVerificationStatus(false), 3000);
    setCheckInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
        setCheckInterval(null);
      }
    };
  }, [userEmail, status.isVerified, checkVerificationStatus]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MilestackLogo size={60} />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {status.isVerified ? "Email Verified!" : "Verify Your Email"}
            </CardTitle>
            <CardDescription>
              {status.isVerified
                ? "Your email has been successfully verified."
                : "We sent a verification link to your email address."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className="text-center space-y-4">
            {status.isVerified ? (
              <div className="space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-in zoom-in-50 duration-500" />
                <p className="text-green-600 font-medium">
                  Verification Complete!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to the dashboard...
                </p>
                <Progress value={100} className="w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <Mail className="h-16 w-16 text-primary mx-auto" />
                <p className="font-medium">Check your inbox at</p>
                <p className="text-primary font-mono text-sm bg-muted px-2 py-1 rounded">
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {status.isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {status.lastChecked
                  ? "Checking verification status..."
                  : "Loading..."}
              </span>
            </div>
          )}

          {/* Verification Status Info */}
          {!status.isVerified && (
            <div className="space-y-3">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>What to do next:</strong>
                  <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>
                      Come back to this page - we'll automatically detect when
                      you're verified
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>

              {status.lastChecked && (
                <p className="text-xs text-muted-foreground text-center">
                  Last checked: {status.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {!status.isVerified && (
              <>
                <Button
                  onClick={resendVerificationEmail}
                  disabled={resendCooldown > 0 || status.isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {status.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend Verification Email"}
                    </>
                  )}
                </Button>
              </>
            )}

            {!status.isVerified && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => router.push("/help")}
                className="text-primary hover:underline"
              >
                contact support
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
