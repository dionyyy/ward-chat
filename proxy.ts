import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/servers", "/me", "/settings"];

// Routes that should redirect to app if already authenticated
const authRoutes = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (Better Auth uses ward-chat.session_token)
  const sessionCookie =
    request.cookies.get("ward-chat.session_token") ||
    request.cookies.get("__Secure-ward-chat.session_token");

  const isAuthenticated = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/servers", request.url));
  }

  // Redirect unauthenticated users to login from protected pages
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};
