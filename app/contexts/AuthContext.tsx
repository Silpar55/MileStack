"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<void>;
  githubLogin: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  gdprConsent?: {
    marketing?: boolean;
    analytics?: boolean;
    personalization?: boolean;
  };
  ferpaConsent?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null
  );

  const isAuthenticated = !!user && !!accessToken;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        const storedUser = localStorage.getItem("user");

        if (storedAccessToken && storedRefreshToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshTokenValue(storedRefreshToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedAccessToken}`,
            },
          });

          if (!response.ok) {
            // Try to refresh token
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Clear invalid tokens
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              setAccessToken(null);
              setRefreshTokenValue(null);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setAccessToken(null);
        setRefreshTokenValue(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!refreshTokenValue) return false;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      } else {
        // Refresh token is invalid, logout
        await logout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
      return false;
    }
  }, [refreshTokenValue]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshTokenValue(data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: result.error || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (refreshTokenValue) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshTokenValue(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, [refreshTokenValue]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to send reset email",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || "Password reset failed" };
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Email verification failed",
        };
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, error: "Network error" };
    }
  }, []);

  const googleLogin = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/oauth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirect_uri: `${window.location.origin}/api/auth/oauth/google/callback`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  }, []);

  const githubLogin = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/oauth/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirect_uri: `${window.location.origin}/api/auth/oauth/github/callback`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    googleLogin,
    githubLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
