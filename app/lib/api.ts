import { useAuth } from "@/contexts/AuthContext";

// Utility function for making authenticated API calls
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Hook for making authenticated API calls in React components
export function useAuthenticatedFetch() {
  const { accessToken } = useAuth();

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch };
}

// API response handler
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    ME: "/api/auth/me",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: (token: string) => `/api/auth/verify-email/${token}`,
  },

  // Points
  POINTS: {
    BALANCE: "/api/points/balance",
    EARN: "/api/points/earn",
    SPEND: "/api/points/spend",
    HISTORY: "/api/points/history",
  },

  // AI Assistance
  AI: {
    ASK: "/api/ai/ask",
    SESSION_START: "/api/ai/session/start",
    SESSION_MESSAGE: (sessionId: string) =>
      `/api/ai/session/${sessionId}/message`,
    SESSION_END: (sessionId: string) => `/api/ai/session/${sessionId}/end`,
    SESSION_TRANSCRIPT: (sessionId: string) =>
      `/api/ai/session/${sessionId}/transcript`,
  },

  // Assignments
  ASSIGNMENTS: {
    UPLOAD: "/api/assignment/upload",
    ANALYZE: "/api/assignment/analyze",
    GET: (id: string) => `/api/assignment/${id}`,
  },

  // Workspace
  WORKSPACE: {
    GET: (assignmentId: string) => `/api/workspace/${assignmentId}`,
    SAVE: "/api/workspace/save",
    EXECUTE: "/api/workspace/execute",
    HISTORY: (assignmentId: string) => `/api/workspace/history/${assignmentId}`,
  },

  // Download
  DOWNLOAD: {
    QUALIFY: (assignmentId: string) => `/api/download/${assignmentId}/qualify`,
    PREVIEW: (assignmentId: string) => `/api/download/${assignmentId}/preview`,
    GENERATE: (assignmentId: string) =>
      `/api/download/${assignmentId}/generate`,
  },

  // Achievements
  ACHIEVEMENTS: {
    GET: "/api/achievements",
    CHECK: "/api/achievements/check",
    INIT: "/api/achievements/init",
  },
} as const;
