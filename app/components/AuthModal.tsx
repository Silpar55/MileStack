import { useState } from "react";
import { Github, Mail, Globe } from "lucide-react";
import { MilestackLogo } from "./MilestackLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthModalProps {
  onAuth: () => void;
}

export function AuthModal({ onAuth }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Auth submitted:", { authMode, email, name });
    onAuth();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      data-testid="modal-auth"
    >
      <div className="bg-background rounded-2xl max-w-md w-full p-8">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-name"
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-email"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-password"
              className="mt-2"
            />
          </div>

          {authMode === "signup" && (
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" data-testid="checkbox-terms" />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Academic Integrity Policy
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-blue-400 hover-elevate"
            data-testid="button-submit-auth"
          >
            {authMode === "login" ? "Sign In" : "Create Account"}
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
              data-testid="button-auth-google"
            >
              <Mail className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="hover-elevate"
              data-testid="button-auth-github"
            >
              <Github className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="hover-elevate"
              data-testid="button-auth-sso"
            >
              <Globe className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
