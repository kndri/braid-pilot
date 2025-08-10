import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up", 
  "/pricing",
  "/features",
  "/contact",
  "/api/auth/signout",
]);

export default convexAuthNextjsMiddleware(async (request) => {
  const isAuthenticated = await isAuthenticatedNextjs();
  const path = request.nextUrl.pathname;
  
  console.log(`Middleware: Path=${path}, Authenticated=${isAuthenticated}`);
  
  // If not on a public page and not authenticated, redirect to sign-in
  if (!isPublicPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
  
  // If authenticated and on sign-in or sign-up, redirect to dashboard
  if (isAuthenticated && (path === "/sign-in" || path === "/sign-up")) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export const config = {
  // The middleware will be invoked for all routes except Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};