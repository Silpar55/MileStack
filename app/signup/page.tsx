"use client";

import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = () => {
    setIsAuthenticated(true);
    router.push("/profile-setup");
  };

  if (isAuthenticated) {
    return null; // Will redirect to profile setup
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal onAuth={handleAuth} />
    </div>
  );
}

