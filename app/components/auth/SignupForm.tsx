"use client";

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import {
  Loader2,
  Eye,
  EyeOff,
  Github,
  Chrome,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignupForm({ onSuccess, redirectTo }: SignupFormProps) {
  const { signup, googleLogin, githubLogin, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    termsAccepted: false,
    privacyPolicyAccepted: false,
    gdprConsent: {
      marketing: false,
      analytics: false,
      personalization: false,
    },
    ferpaConsent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/\d/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      errors.push("One special character");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    // Validate required consents
    if (!formData.termsAccepted || !formData.privacyPolicyAccepted) {
      setError("You must accept the terms and conditions and privacy policy");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        termsAccepted: formData.termsAccepted,
        privacyPolicyAccepted: formData.privacyPolicyAccepted,
        gdprConsent: formData.gdprConsent,
        ferpaConsent: formData.ferpaConsent,
      });

      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        await googleLogin();
      } else {
        await githubLogin();
      }
    } catch (error) {
      setError(`Failed to sign up with ${provider}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleGdprChange = (
    field: keyof typeof formData.gdprConsent,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      gdprConsent: {
        ...prev.gdprConsent,
        [field]: checked,
      },
    }));
  };

  const passwordErrors = validatePassword(formData.password);

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a verification link to {formData.email}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create account
        </CardTitle>
        <CardDescription className="text-center">
          Sign up for your MileStack account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.password && passwordErrors.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside">
                  {passwordErrors.map((err, index) => (
                    <li key={index} className="text-red-500">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, termsAccepted: !!checked }))
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="termsAccepted" className="text-sm">
                I accept the{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </Link>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacyPolicyAccepted"
                checked={formData.privacyPolicyAccepted}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    privacyPolicyAccepted: !!checked,
                  }))
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="privacyPolicyAccepted" className="text-sm">
                I accept the{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                GDPR Consent (Optional)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.gdprConsent.marketing}
                    onCheckedChange={(checked) =>
                      handleGdprChange("marketing", !!checked)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="marketing" className="text-sm">
                    Marketing communications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="analytics"
                    checked={formData.gdprConsent.analytics}
                    onCheckedChange={(checked) =>
                      handleGdprChange("analytics", !!checked)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="analytics" className="text-sm">
                    Analytics and usage data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personalization"
                    checked={formData.gdprConsent.personalization}
                    onCheckedChange={(checked) =>
                      handleGdprChange("personalization", !!checked)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="personalization" className="text-sm">
                    Personalized content
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ferpaConsent"
                checked={formData.ferpaConsent}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, ferpaConsent: !!checked }))
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="ferpaConsent" className="text-sm">
                I consent to FERPA data sharing for educational purposes
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading || passwordErrors.length > 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin("google")}
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin("github")}
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
