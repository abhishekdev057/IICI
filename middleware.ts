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
      // Admin routes require ADMIN or SUPER_ADMIN role
      if (pathname.startsWith("/admin")) {
        if (!token || (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN")) {
          const authUrl = new URL("/auth", req.url)
          authUrl.searchParams.set("callbackUrl", req.url)
          return NextResponse.redirect(authUrl)
        }
      }

      // All other protected routes require authentication
      if (!token) {
        const authUrl = new URL("/auth", req.url)
        authUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(authUrl)
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
      authorized: () => true
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
