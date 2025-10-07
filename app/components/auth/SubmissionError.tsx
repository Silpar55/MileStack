"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, UserX, Lock, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmissionError {
  type:
    | "user_not_found"
    | "wrong_password"
    | "email_already_registered"
    | "generic";
  message: string;
  details?: string;
}

interface SubmissionErrorProps {
  error: SubmissionError | null;
  onDismiss?: () => void;
  className?: string;
}

const errorConfig = {
  user_not_found: {
    icon: UserX,
    title: "Account Not Found",
    description: "No account exists with this email address.",
    suggestion: "Please check your email address or sign up for a new account.",
  },
  wrong_password: {
    icon: Lock,
    title: "Incorrect Password",
    description: "The password you entered is incorrect.",
    suggestion: "Please check your password and try again.",
  },
  email_already_registered: {
    icon: UserX,
    title: "Email Already Registered",
    description: "An account with this email address already exists.",
    suggestion: "Please sign in instead or use a different email address.",
  },
  generic: {
    icon: AlertCircle,
    title: "Authentication Error",
    description: "Something went wrong during authentication.",
    suggestion: "Please try again or contact support if the problem persists.",
  },
};

export function SubmissionError({
  error,
  onDismiss,
  className,
}: SubmissionErrorProps) {
  if (!error) return null;

  const config = errorConfig[error.type];
  const Icon = config.icon;

  return (
    <Alert
      variant="destructive"
      className={cn(
        "mb-4 animate-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-medium text-sm text-destructive">
              {error.message || config.title}
            </h4>
            {error.details && (
              <p className="text-sm text-muted-foreground mt-1">
                {error.details}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {config.suggestion}
            </p>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Helper function to parse API errors into SubmissionError format
export function parseSubmissionError(
  error: any,
  status?: number,
  code?: string
): SubmissionError {
  // Network errors (no status at all)
  if (!status) {
    return {
      type: "generic",
      message: "Connection Error",
      details:
        "Unable to connect to our servers. Please check your internet connection.",
    };
  }

  // Parse error response
  const errorData =
    error?.error || error?.message || error || "An error occurred";

  switch (status) {
    case 401:
      // Check if it's a specific error type from our API
      if (code === "USER_NOT_FOUND") {
        return {
          type: "user_not_found",
          message: "Account Not Found",
          details: "No account exists with this email address.",
        };
      } else if (code === "WRONG_PASSWORD") {
        return {
          type: "wrong_password",
          message: "Incorrect Password",
          details: "The password you entered is incorrect.",
        };
      } else {
        return {
          type: "generic",
          message: "Invalid Credentials",
          details: "The email or password you entered is incorrect.",
        };
      }

    case 409:
      if (code === "EMAIL_ALREADY_REGISTERED") {
        return {
          type: "email_already_registered",
          message: "Email Already Registered",
          details: "An account with this email address already exists.",
        };
      }
      return {
        type: "generic",
        message: "Account Conflict",
        details: errorData,
      };

    case 500:
      return {
        type: "generic",
        message: "Server Error",
        details: "Our servers are experiencing issues. Please try again later.",
      };

    default:
      return {
        type: "generic",
        message: "Authentication Error",
        details: errorData,
      };
  }
}
