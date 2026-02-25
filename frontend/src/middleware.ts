import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const publicPaths = [
  "/", 
  "/login", 
  "/register", 
  "/forgotpassword", 
  "/create-new-password", 
  "/about-us", 
  "/contact-us",
  "/unauthorized",
  "/logout"
];

// Add verify-certificate route to public paths
export const isPublicPath = (path: string) => {
  // Check exact matches first
  if (publicPaths.includes(path)) return true;
  
  // Check if the path starts with /verify-certificate/
  if (path.startsWith('/verify-certificate/')) return true;
  
  return false;
};

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  teacher_id: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; 
  const pathIsPublic = isPublicPath(pathname);
  const token = request.cookies.get("access_token")?.value;

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp < Date.now() / 1000) {
        request.cookies.delete("access_token");
        request.cookies.delete("refresh_token");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to public paths regardless of authentication
  if (pathIsPublic) {
    return NextResponse.next();
  }

  // Require authentication for non-public paths
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude:
    // - api routes (/api/*)
    // - Next.js internals (_next/static/*, _next/image/*)
    // - favicon.ico
    // - all files with an extension (e.g., .svg, .png, .jpg, .css, .js, etc.)
    "/((?!api|_next/static|_next/image|favicon.ico|[\\w-]+\\.\\w+).*)",
  ],
};
