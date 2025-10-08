import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime compatible JWT verification
async function verifyAccessTokenEdge(
  token: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

    // Split the token
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;

    // Decode the payload
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Check if token is expired
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      return null;
    }

    // Check token type
    if (decodedPayload.type !== "access") {
      return null;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = Uint8Array.from(
      atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );
    const data = encoder.encode(`${header}.${payload}`);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      data
    );

    if (!isValid) {
      return null;
    }

    return { userId: decodedPayload.userId, email: decodedPayload.email };
  } catch (error) {
    console.log("Edge JWT verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for NextAuth session cookie (updated for newer NextAuth versions)
  const nextAuthSessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");
  const isNextAuthAuthenticated = !!nextAuthSessionCookie;

  // Check for JWT token in cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  let isJWTAuthenticated = false;

  console.log("Middleware debug:", {
    pathname,
    hasNextAuthSession: isNextAuthAuthenticated,
    hasAccessTokenCookie: !!accessToken,
    accessTokenLength: accessToken?.length || 0,
    allCookies: request.cookies.getAll().map((c) => c.name),
  });

  if (accessToken) {
    try {
      const tokenData = await verifyAccessTokenEdge(accessToken);
      isJWTAuthenticated = !!tokenData;
      console.log("JWT token verification:", {
        success: !!tokenData,
        userId: tokenData?.userId,
      });
    } catch (error) {
      console.log("JWT token verification failed:", error);
      isJWTAuthenticated = false;
    }
  }

  const isAuthenticated = isNextAuthAuthenticated || isJWTAuthenticated;
  console.log("Final authentication status:", {
    isNextAuthAuthenticated,
    isJWTAuthenticated,
    isAuthenticated,
  });

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/",
    "/help",
    "/honor-code",
    "/verify-email",
  ];

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/assignments",
    "/leaderboard",
    "/portfolio",
    "/points-dashboard",
    "/learning-dashboard",
    "/learning-pathways",
    "/challenge",
    "/checkpoint",
    "/ide",
    "/assignment",
    "/download",
    "/ai",
    "/ai-assistance",
    "/ai-copilot",
    "/academic-integrity",
    "/honor",
    "/profile-setup",
    "/rewards",
  ];

  // Define auth routes (login/signup) that should redirect if already authenticated
  const authRoutes = ["/login", "/signup"];

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is not authenticated and on root path, redirect to login
  if (!isAuthenticated && pathname === "/") {
    console.log("Redirecting unauthenticated user from root to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and on root path, redirect to dashboard
  if (isAuthenticated && pathname === "/") {
    console.log("Redirecting authenticated user from root to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
