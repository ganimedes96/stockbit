import {
  NextResponse,
  type MiddlewareConfig,
  type NextRequest,
} from "next/server";
import { getToken } from "next-auth/jwt";

type PublicRoute = {
  path: string;
  whenAuthed: "redirect" | "not-redirect";
  matchSubPaths?: boolean;
};

const publicRoutes: PublicRoute[] = [
  { path: "/login", whenAuthed: "redirect" },
  { path: "/register", whenAuthed: "not-redirect" },
  { path: "/", whenAuthed: "not-redirect" },
  { path: "/verify-account", whenAuthed: "not-redirect" },
  { path: "/forgot-password", whenAuthed: "not-redirect" },
  { path: "/reset-password", whenAuthed: "not-redirect" },
  { path: "/policy-and-privacy", whenAuthed: "not-redirect" },
  { path: "/terms", whenAuthed: "not-redirect" },
] as const;

// Routes that employees can access
const employeeRoutes = [
  "/verify-account",
  "/",
  "/policy-and-privacy",
  "/terms",
  "/reset-password",
  "/forgot-password",
];
const REDIRECT_WHEN_UNAUTHED = "/login";
const REDIRECT_WHEN_UNAUTHORIZED = "/dashboard";

export default async function middleware(request: NextRequest) {
  //const userAgent = request.headers.get("user-agent");
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => {
    if (route.matchSubPaths) {
      return path.startsWith(route.path + "/");
    }
    return route.path === path;
  });
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    if (publicRoute) {
      return NextResponse.next();
    } else {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_UNAUTHED;
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (publicRoute && publicRoute.whenAuthed === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      token.role === "employee" ? "/products" : "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }
  console.log("Token found:", token);
  

  const userRole = token.role as string;

  if (userRole === "admin") {
    console.log("User is an admin");
    
    // if (token.emailVerified === false && !publicRoute) {
    //   console.log("Email not verified, redirecting to verify account");
      
    //   const redirectUrl = request.nextUrl.clone();
    //   redirectUrl.pathname = "/dashboard";
    //   return NextResponse.redirect(redirectUrl);
    // }
    console.log("User is an admin and email is verified");
    
    return NextResponse.next();
  }

  if (userRole === "employee") {
    if (token.emailVerified === false && !publicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/verify-account";
      return NextResponse.redirect(redirectUrl);
    }
    const isAllowedRoute = employeeRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
    if (isAllowedRoute) {
      return NextResponse.next();
    } else {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_UNAUTHORIZED;
      return NextResponse.redirect(redirectUrl);
    }
  }
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|og.png).*)"],
};
