import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Check if user is trying to access admin-only actions
  const isAdminAction = 
    request.nextUrl.pathname.includes("/api/") && 
    (request.nextUrl.pathname.includes("/contribution") ||
     request.nextUrl.pathname.includes("/expense")) &&
    (request.method === "POST" || request.method === "PUT" || request.method === "DELETE");

  if (isAdminAction) {
    const isAuthenticated = request.cookies.get("admin-auth")?.value === "true";
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};