import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Chrome,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { MilestackLogo } from "./MilestackLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordRequirements } from "./PasswordRequirements";
import { ValidationBadge } from "./ValidationBadge";
import { EmailVerificationScreen } from "./auth/EmailVerificationScreen";
import { FieldError } from "./auth/FieldError";
import {
  SubmissionError,
  parseSubmissionError,
  type SubmissionError as SubmissionErrorType,
} from "./auth/SubmissionError";
import {
  validateSignupForm,
  validateLoginForm,
  validateEmail,
  validatePassword,
  validateName,
  getPasswordStrength,
  debounce,
  type SignupFormData,
  type LoginFormData,
} from "@/shared/validation";

interface AuthModalProps {
  onAuth: () => void;
}

export function AuthModal({ onAuth }: AuthModalProps) {
  const router = useRouter();
  const { googleLogin, githubLogin, login, signup, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Form data
  const [formData, setFormData] = useState<SignupFormData & LoginFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] =
    useState<SubmissionErrorType | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Real-time validation with debouncing (only for signup)
  const debouncedValidateEmail = useCallback(
    debounce((email: string) => {
      if (touched.email && authMode === "signup") {
        const validation = validateEmail(email);
        setFieldErrors((prev) => ({
          ...prev,
          email: validation.isValid ? "" : validation.error || "",
        }));
        setWarnings((prev) => ({
          ...prev,
          email: validation.warning || "",
        }));
      }
    }, 300),
    [touched.email, authMode]
  );

  const debouncedValidatePassword = useCallback(
    debounce((password: string) => {
      if (touched.password && authMode === "signup") {
        const validation = validatePassword(password);
        setFieldErrors((prev) => ({
          ...prev,
          password: validation.isValid ? "" : validation.error || "",
        }));
        setWarnings((prev) => ({
          ...prev,
          password: validation.warning || "",
        }));
      }
    }, 300),
    [touched.password, authMode]
  );

  // Update form data and trigger validation
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Trigger real-time validation (only for signup)
    if (authMode === "signup") {
      if (field === "email") {
        debouncedValidateEmail(value);
      } else if (field === "password") {
        debouncedValidatePassword(value);
      } else if (field === "firstName" || field === "lastName") {
        const validation = validateName(
          value,
          field === "firstName" ? "First name" : "Last name"
        );
        setFieldErrors((prev) => ({
          ...prev,
          [field]: validation.isValid ? "" : validation.error || "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setWarnings({});
    setSubmissionError(null);

    try {
      if (authMode === "login") {
        // Set field-level errors for empty fields instead of submission error
        const newFieldErrors: Record<string, string> = {};
        if (!formData.email) {
          newFieldErrors.email = "Email is required";
        }
        if (!formData.password) {
          newFieldErrors.password = "Password is required";
        }

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          return;
        }

        const result = await login(formData.email, formData.password);
        if (result.success) {
          onAuth();
        } else {
          // Special handling for unverified email
          if (result.code === "EMAIL_NOT_VERIFIED") {
            setShowVerification(true);
            return;
          }

          // Parse the error for better UX
          const parsedError = parseSubmissionError(
            result.error,
            result.status,
            result.code
          );
          setSubmissionError(parsedError);
        }
      } else {
        const validation = validateSignupForm(formData);
        if (!validation.isValid) {
          setSubmissionError({
            type: "generic",
            message: validation.errors.join(", "),
          });
          if (validation.warnings) {
            setWarnings({ general: validation.warnings.join(", ") });
          }
          return;
        }

        const result = await signup({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          termsAccepted: formData.termsAccepted,
          privacyPolicyAccepted: formData.privacyPolicyAccepted,
        });

        if (result.success) {
          // After successful signup, redirect to verification screen
          setShowVerification(true);
        } else {
          const parsedError = parseSubmissionError(
            result.error,
            result.status,
            result.code
          );
          setSubmissionError(parsedError);
        }
      }
    } catch (error) {
      setSubmissionError({
        type: "generic",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setSubmissionError(null);
      if (provider === "google") {
        await googleLogin();
      } else {
        await githubLogin();
      }
      // OAuth login will handle redirect automatically via NextAuth
      // No need to call onAuth() here
    } catch (error) {
      setSubmissionError({
        type: "generic",
        message: `Failed to login with ${provider}`,
      });
    }
  };

  const handleBackFromVerification = () => {
    setShowVerification(false);
    setSubmissionError(null);
  };

  // Get password strength for signup
  const passwordStrength =
    authMode === "signup" ? getPasswordStrength(formData.password) : null;

  // Show verification screen if needed
  if (showVerification) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        data-testid="modal-auth"
      >
        <div className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <EmailVerificationScreen
            email={formData.email}
            onVerified={onAuth}
            onBack={handleBackFromVerification}
            autoRedirect={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      data-testid="modal-auth"
    >
      <div className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-center mb-6">
          <MilestackLogo size={80} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome to Milestack
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Forge progress, one milestone at a time
        </p>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setAuthMode("login")}
            className={`flex-1 pb-2 font-medium transition-colors ${
              authMode === "login"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            data-testid="button-tab-login"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className={`flex-1 pb-2 font-medium transition-colors ${
              authMode === "signup"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            data-testid="button-tab-signup"
          >
            Sign Up
          </button>
        </div>

        {/* Submission Error Display */}
        <SubmissionError
          error={submissionError}
          onDismiss={() => setSubmissionError(null)}
        />

        {/* General warnings */}
        {warnings.general && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{warnings.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="firstName">First Name</Label>
                  {touched.firstName && formData.firstName && (
                    <ValidationBadge isValid={!fieldErrors.firstName} />
                  )}
                </div>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  data-testid="input-first-name"
                  className={`mt-2 ${
                    fieldErrors.firstName
                      ? "border-destructive"
                      : touched.firstName && !fieldErrors.firstName
                      ? "border-green-500"
                      : ""
                  }`}
                />
                <FieldError error={fieldErrors.firstName} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lastName">Last Name</Label>
                  {touched.lastName && formData.lastName && (
                    <ValidationBadge isValid={!fieldErrors.lastName} />
                  )}
                </div>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  data-testid="input-last-name"
                  className={`mt-2 ${
                    fieldErrors.lastName
                      ? "border-destructive"
                      : touched.lastName && !fieldErrors.lastName
                      ? "border-green-500"
                      : ""
                  }`}
                />
                <FieldError error={fieldErrors.lastName} />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email</Label>
              {authMode === "signup" && touched.email && formData.email && (
                <ValidationBadge
                  isValid={!fieldErrors.email}
                  hasWarning={!!warnings.email}
                />
              )}
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              data-testid="input-email"
              className={`mt-2 ${
                fieldErrors.email
                  ? "border-destructive"
                  : touched.email && !fieldErrors.email && authMode === "signup"
                  ? "border-green-500"
                  : ""
              }`}
            />
            <FieldError error={fieldErrors.email} />
            {authMode === "signup" && warnings.email && (
              <p className="text-sm text-yellow-600 mt-1">{warnings.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {authMode === "signup" &&
                touched.password &&
                formData.password && (
                  <ValidationBadge
                    isValid={!fieldErrors.password}
                    hasWarning={!!warnings.password}
                  />
                )}
            </div>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                data-testid="input-password"
                className={`pr-10 ${
                  fieldErrors.password
                    ? "border-destructive"
                    : touched.password &&
                      !fieldErrors.password &&
                      authMode === "signup"
                    ? "border-green-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError error={fieldErrors.password} />
            {authMode === "signup" && warnings.password && (
              <p className="text-sm text-yellow-600 mt-1">
                {warnings.password}
              </p>
            )}
            {authMode === "signup" && formData.password && (
              <PasswordRequirements password={formData.password} />
            )}
          </div>

          {authMode === "signup" && (
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  data-testid="checkbox-terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) =>
                    updateFormData("termsAccepted", checked)
                  }
                  className={`mt-1 ${
                    fieldErrors.termsAccepted ? "border-destructive" : ""
                  }`}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  data-testid="checkbox-privacy"
                  checked={formData.privacyPolicyAccepted}
                  onCheckedChange={(checked) =>
                    updateFormData("privacyPolicyAccepted", checked)
                  }
                  className={`mt-1 ${
                    fieldErrors.privacyPolicyAccepted
                      ? "border-destructive"
                      : ""
                  }`}
                />
                <label
                  htmlFor="privacy"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <a
                    href="/academic-integrity"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Academic Integrity Policy
                  </a>
                </label>
              </div>
              {(fieldErrors.termsAccepted ||
                fieldErrors.privacyPolicyAccepted) && (
                <FieldError error="You must accept all terms and policies to continue" />
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-blue-400 hover-elevate"
            data-testid="button-submit-auth"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? "Processing..."
              : authMode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="hover-elevate"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading || isSubmitting}
              data-testid="button-auth-google"
            >
              <Chrome className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="hover-elevate"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading || isSubmitting}
              data-testid="button-auth-github"
            >
              <Github className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="hover-elevate opacity-50 cursor-not-allowed"
              disabled={true}
              data-testid="button-auth-sso"
              title="University SSO - Coming Soon"
            >
              <Globe className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
