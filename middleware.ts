import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // Allow access to the pending page and sign-out for unapproved users
  if (pathname === "/pending" || pathname === "/api/auth/signout") {
    return;
  }

  // Redirect unapproved users to the pending approval page
  // Check explicitly for false to avoid blocking users with old session tokens missing the field
  if (req.auth?.user?.isApproved === false) {
    return Response.redirect(new URL("/pending", req.nextUrl.origin));
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|tool-icons|api/auth).*)"],
};
