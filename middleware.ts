import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/auth"]
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/admin", "/application"]
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute) {
      // Check if token exists and has valid user data
      if (!token || !token.sub) {
        console.log("❌ No valid token found, redirecting to auth")
        const authUrl = new URL("/auth", req.url)
        authUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(authUrl)
      }

      // Check if user is active (if this info is available in token)
      if ((token as any).isActive === false) {
        console.log("❌ User account is inactive, redirecting to auth")
        const authUrl = new URL("/auth", req.url)
        authUrl.searchParams.set("error", "AccountInactive")
        return NextResponse.redirect(authUrl)
      }

      // Admin routes require ADMIN or SUPER_ADMIN role
      if (pathname.startsWith("/admin")) {
        if (!token.role || (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN")) {
          console.log("❌ Insufficient permissions for admin route")
          const authUrl = new URL("/auth", req.url)
          authUrl.searchParams.set("callbackUrl", req.url)
          authUrl.searchParams.set("error", "InsufficientPermissions")
          return NextResponse.redirect(authUrl)
        }
      }

      // If ADMIN or SUPER_ADMIN, always use admin dashboard, not user dashboard/application
      if (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN') {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/application')) {
          const adminUrl = new URL('/admin', req.url)
          return NextResponse.redirect(adminUrl)
        }
      }

      // Gate dashboard until application is submitted
      if (pathname.startsWith("/dashboard")) {
        const applicationStatus = (token as any).applicationStatus as string | undefined
        const cookieSubmitted = req.cookies.get('iiici_app_submitted')?.value === 'true'
        if (!(cookieSubmitted || (applicationStatus && applicationStatus.toLowerCase() === 'submitted'))) {
          const appUrl = new URL("/application", req.url)
          return NextResponse.redirect(appUrl)
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ["/", "/auth"]
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return true
        }
        
        // For protected routes, require a valid token
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
