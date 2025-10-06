"use client";

import { Navigation } from "./Navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  // Mock user data - in a real app, this would come from authentication context
  const user = {
    name: "John Doe",
    email: "john.doe@university.edu",
    points: 420,
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log("User logged out");
    // In a real app, this would clear authentication and redirect to login
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onLogout={handleLogout}
        points={user.points}
        userName={user.name}
        userEmail={user.email}
      />
      <main>{children}</main>
    </div>
  );
}

