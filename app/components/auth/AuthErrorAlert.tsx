"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Shield,
  Clock,
  UserX,
  Lock,
  Mail,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthError {
  type:
    | "invalid_credentials"
    | "user_not_found"
    | "wrong_password"
    | "account_locked"
    | "rate_limit"
    | "email_not_verified"
    | "email_already_registered"
    | "oauth_account_exists"
    | "generic";
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  retryable?: boolean;
}

interface AuthErrorAlertProps {
  error: AuthError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const errorConfig = {
  invalid_credentials: {
    icon: Shield,
    variant: "destructive" as const,
    title: "Invalid Credentials",
    description: "The email or password you entered is incorrect.",
    suggestion: "Please check your credentials and try again.",
    showRetry: false,
  },
  user_not_found: {
    icon: UserX,
    variant: "destructive" as const,
    title: "Account Not Found",
    description: "No account exists with this email address.",
    suggestion: "Please check your email address or sign up for a new account.",
    showRetry: false,
  },
  wrong_password: {
    icon: Lock,
    variant: "destructive" as const,
    title: "Incorrect Password",
    description: "The password you entered is incorrect.",
    suggestion: "Please check your password and try again.",
    showRetry: false,
  },
  account_locked: {
    icon: Lock,
    variant: "destructive" as const,
    title: "Account Temporarily Locked",
    description:
      "Your account has been temporarily locked due to multiple failed login attempts.",
    suggestion:
      "Please wait a few minutes before trying again, or contact support if this persists.",
    showRetry: false,
  },
  rate_limit: {
    icon: Clock,
    variant: "destructive" as const,
    title: "Too Many Attempts",
    description:
      "You've made too many login attempts. Please wait before trying again.",
    suggestion: "Wait a few minutes before attempting to log in again.",
    showRetry: false,
  },
  email_not_verified: {
    icon: Mail,
    variant: "default" as const,
    title: "Email Verification Required",
    description: "Please verify your email address before logging in.",
    suggestion:
      "Check your inbox for a verification email and click the link to verify your account.",
    showRetry: false,
  },
  email_already_registered: {
    icon: UserX,
    variant: "destructive" as const,
    title: "Email Already Registered",
    description: "An account with this email address already exists.",
    suggestion: "Please sign in instead or use a different email address.",
    showRetry: false,
  },
  oauth_account_exists: {
    icon: UserX,
    variant: "default" as const,
    title: "Account Already Exists",
    description:
      "An account with this email already exists using social login.",
    suggestion: "Please sign in with Google or GitHub instead.",
    showRetry: false,
  },
  generic: {
    icon: AlertCircle,
    variant: "destructive" as const,
    title: "Authentication Error",
    description: "Something went wrong during authentication.",
    suggestion: "Please try again or contact support if the problem persists.",
    showRetry: false,
  },
};

export function AuthErrorAlert({
  error,
  onRetry,
  onDismiss,
  className,
}: AuthErrorAlertProps) {
  const config = errorConfig[error.type];
  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={cn(
        "mb-4 animate-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon
          className={cn(
            "h-4 w-4 mt-0.5 flex-shrink-0",
            config.variant === "destructive"
              ? "text-destructive"
              : "text-primary"
          )}
        />
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-medium text-sm">
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

          <div className="flex items-center space-x-2">
            {error.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={error.action.onClick}
                className="h-7 px-3 text-xs"
              >
                {error.action.label}
              </Button>
            )}

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-7 px-3 text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Helper function to parse API errors into AuthError format
export function parseAuthError(error: any, response?: Response): AuthError {
  // Network errors
  if (!response) {
    return {
      type: "generic",
      message: "Connection Error",
      details:
        "Unable to connect to our servers. Please check your internet connection.",
      retryable: false,
    };
  }

  // Parse error response
  const status = response.status;
  const errorData = error?.error || error?.message || "An error occurred";

  switch (status) {
    case 401:
      // Check if it's a specific error type from our API
      if (error?.code === "USER_NOT_FOUND") {
        return {
          type: "user_not_found",
          message: "Account Not Found",
          details: "No account exists with this email address.",
          retryable: false,
        };
      } else if (error?.code === "WRONG_PASSWORD") {
        return {
          type: "wrong_password",
          message: "Incorrect Password",
          details: "The password you entered is incorrect.",
          retryable: false,
        };
      } else {
        return {
          type: "invalid_credentials",
          message: "Invalid Credentials",
          details: "The email or password you entered is incorrect.",
          retryable: false,
        };
      }

    case 423:
      return {
        type: "account_locked",
        message: "Account Temporarily Locked",
        details:
          "Your account has been temporarily locked due to multiple failed login attempts.",
        retryable: false,
      };

    case 429:
      return {
        type: "rate_limit",
        message: "Too Many Attempts",
        details:
          "You've made too many login attempts. Please wait before trying again.",
        retryable: false,
      };

    case 409:
      if (error?.code === "EMAIL_ALREADY_REGISTERED") {
        return {
          type: "email_already_registered",
          message: "Email Already Registered",
          details: "An account with this email address already exists.",
          retryable: false,
        };
      } else if (error?.code === "OAUTH_ACCOUNT_EXISTS") {
        return {
          type: "oauth_account_exists",
          message: "Account Already Exists",
          details: errorData,
          retryable: false,
        };
      }
      return {
        type: "generic",
        message: "Account Conflict",
        details: errorData,
        retryable: false,
      };

    case 500:
      return {
        type: "generic",
        message: "Server Error",
        details: "Our servers are experiencing issues. Please try again later.",
        retryable: false,
      };

    default:
      return {
        type: "generic",
        message: "Authentication Error",
        details: errorData,
        retryable: false,
      };
  }
}
