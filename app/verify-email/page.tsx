"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmailVerificationScreen } from "@/components/auth/EmailVerificationScreen";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MilestackLogo } from "@/components/MilestackLogo";

type VerificationState = "loading" | "success" | "error" | "pending";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    verifyEmail,
    user,
    refreshToken,
    setUser,
    setAccessToken,
    setRefreshTokenValue,
  } = useAuth();

  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const accessToken = searchParams.get("accessToken");
  const refreshTokenParam = searchParams.get("refreshToken");
  const userParam = searchParams.get("user");
  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Handle email verification token if present
  useEffect(() => {
    const handleTokenVerification = async () => {
      if (!token) {
        setVerificationState("pending");
        return;
      }

      // If we have success/error parameters from the redirect, handle them
      if (success === "true") {
        setVerificationState("success");

        // Use the verification data from URL parameters
        if (accessToken && refreshTokenParam && userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshTokenParam);
            localStorage.setItem("user", JSON.stringify(user));

            // Update auth context
            setAccessToken(accessToken);
            setRefreshTokenValue(refreshTokenParam);
            setUser(user);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return;
      }

      if (error === "true") {
        setVerificationState("error");
        setErrorMessage("Invalid or expired verification token");
        return;
      }

      // Fallback: try to verify the token directly
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setVerificationState("success");

          // If the verification API returned tokens, store them and update context
          if (result.accessToken && result.refreshToken && result.user) {
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Update auth context
            setAccessToken(result.accessToken);
            setRefreshTokenValue(result.refreshToken);
            setUser(result.user);
          }

          // Start countdown for redirect
          const countdownInterval = setInterval(() => {
            setRedirectCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setVerificationState("error");
          setErrorMessage(result.error || "Verification failed");
        }
      } catch (error) {
        setVerificationState("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    handleTokenVerification();
  }, [
    token,
    success,
    error,
    verifyEmail,
    setAccessToken,
    setRefreshTokenValue,
    setUser,
    accessToken,
    refreshTokenParam,
    userParam,
  ]);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (verificationState === "success" && redirectCountdown === 0) {
      router.push("/dashboard");
    }
  }, [verificationState, redirectCountdown, router]);

  // If we have a token, show verification result
  if (token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <MilestackLogo size={60} />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {verificationState === "success"
                  ? "Email Verified!"
                  : verificationState === "error"
                  ? "Verification Failed"
                  : "Verifying Email..."}
              </CardTitle>
              <CardDescription>
                {verificationState === "success"
                  ? "Your email has been successfully verified."
                  : verificationState === "error"
                  ? "There was a problem verifying your email."
                  : "Please wait while we verify your email..."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              {verificationState === "loading" && (
                <div className="space-y-2">
                  <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                  <p className="text-muted-foreground">
                    Verifying your email...
                  </p>
                </div>
              )}

              {verificationState === "success" && (
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-in zoom-in-50 duration-500" />
                  <p className="text-green-600 font-medium">
                    Email Verified Successfully!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the dashboard in {redirectCountdown}{" "}
                    seconds...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${((3 - redirectCountdown) / 3) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {verificationState === "error" && (
                <div className="space-y-2">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <p className="text-red-600 font-medium">
                    Verification Failed
                  </p>
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {verificationState === "success" && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    You will be automatically redirected to the dashboard
                  </p>
                </div>
              )}

              {verificationState === "error" && (
                <>
                  <Button
                    onClick={() => router.push("/signup")}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no token, show the verification screen
  return (
    <EmailVerificationScreen email={email || undefined} autoRedirect={true} />
  );
}
