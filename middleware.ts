import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session
  const session = await auth();
  const isAuthenticated = !!session?.user;

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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and on root path, redirect to dashboard
  if (isAuthenticated && pathname === "/") {
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
