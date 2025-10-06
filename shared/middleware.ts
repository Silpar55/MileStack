import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";

// Authentication middleware
export function withAuth(
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authorization header missing or invalid" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const tokenData = verifyAccessToken(token);

      if (!tokenData) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      return await handler(request, tokenData.userId);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

// Optional authentication middleware (doesn't fail if no token)
export function withOptionalAuth(
  handler: (
    request: NextRequest,
    userId: string | null
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get("authorization");
      let userId: string | null = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const tokenData = verifyAccessToken(token);
        if (tokenData) {
          userId = tokenData.userId;
        }
      }

      return await handler(request, userId);
    } catch (error) {
      console.error("Optional auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  keyGenerator?: (request: NextRequest) => string
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const key = keyGenerator
        ? keyGenerator(request)
        : request.ip || "unknown";
      const now = Date.now();

      // Clean up expired entries
      for (const [k, v] of requests.entries()) {
        if (v.resetTime < now) {
          requests.delete(k);
        }
      }

      const current = requests.get(key);

      if (!current) {
        requests.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.resetTime < now) {
        requests.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.count >= maxRequests) {
        return NextResponse.json(
          {
            error: "Too many requests",
            message: `Rate limit exceeded. Try again in ${Math.ceil(
              (current.resetTime - now) / 1000
            )} seconds.`,
          },
          { status: 429 }
        );
      } else {
        current.count++;
      }

      return await handler(request);
    };
  };
}

// CORS middleware
export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);

    // Add CORS headers
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_APP_URL || "*"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  };
}

// Security headers middleware
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
  };
}

// Combined middleware for API routes
export function withAPIMiddleware(
  handler: (request: NextRequest, userId?: string) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: { maxRequests: number; windowMs: number };
    cors?: boolean;
    security?: boolean;
  } = {}
) {
  const {
    requireAuth = false,
    rateLimit,
    cors = true,
    security = true,
  } = options;

  let middleware = handler;

  if (security) {
    middleware = withSecurityHeaders(middleware);
  }

  if (cors) {
    middleware = withCORS(middleware);
  }

  if (rateLimit) {
    middleware = withRateLimit(
      rateLimit.maxRequests,
      rateLimit.windowMs
    )(middleware);
  }

  if (requireAuth) {
    middleware = withAuth(middleware);
  }

  return middleware;
}
