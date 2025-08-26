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
