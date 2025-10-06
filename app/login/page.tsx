"use client";

import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = () => {
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal onAuth={handleAuth} />
    </div>
  );
}

