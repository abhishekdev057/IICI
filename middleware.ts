import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Circuit breaker for database failures
let circuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false
}

const CIRCUIT_BREAKER_THRESHOLD = 5
const CIRCUIT_BREAKER_TIMEOUT = 60000 // 1 minute

function isCircuitBreakerOpen(): boolean {
  const now = Date.now()
  
  if (circuitBreakerState.isOpen) {
    if (now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      // Reset circuit breaker after timeout
      circuitBreakerState.isOpen = false
      circuitBreakerState.failures = 0
      console.log("🔄 Circuit breaker reset")
      return false
    }
    return true
  }
  
  return false
}

function recordCircuitBreakerFailure(): void {
  circuitBreakerState.failures++
  circuitBreakerState.lastFailureTime = Date.now()
  
  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.isOpen = true
    console.log("🚨 Circuit breaker opened due to repeated failures")
  }
}

function recordCircuitBreakerSuccess(): void {
  circuitBreakerState.failures = 0
  circuitBreakerState.isOpen = false
}

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
        // Clear any existing session cookies to force proper logout
        const response = NextResponse.redirect(authUrl)
        response.cookies.delete("next-auth.session-token")
        response.cookies.delete("next-auth.csrf-token")
        response.cookies.delete("next-auth.callback-url")
        return response
      }

      // Check if circuit breaker is open (database issues)
      if (isCircuitBreakerOpen()) {
        console.log("⚠️ Circuit breaker is open, allowing request with cached token data")
        // Allow request to proceed with cached token data
        // This prevents mass logouts during database outages
      }

      // Check if user is active (if this info is available in token)
      // Use cached data if available, otherwise check token
      const userIsActive = (token as any).userData?.isActive ?? (token as any).isActive
      
      if (userIsActive === false) {
        console.log("❌ User account is inactive, redirecting to auth")
        const authUrl = new URL("/auth", req.url)
        authUrl.searchParams.set("error", "AccountInactive")
        return NextResponse.redirect(authUrl)
      }

      // Admin routes require ADMIN or SUPER_ADMIN role
      // Use cached role data if available, otherwise fall back to token role
      const userRole = (token as any).userData?.role ?? token.role
      
      if (pathname.startsWith("/admin")) {
        if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
          console.log("❌ Insufficient permissions for admin route")
          const authUrl = new URL("/auth", req.url)
          authUrl.searchParams.set("callbackUrl", req.url)
          authUrl.searchParams.set("error", "InsufficientPermissions")
          return NextResponse.redirect(authUrl)
        }
      }

      // If ADMIN or SUPER_ADMIN, always use admin dashboard, not user dashboard/application
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
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

      // Auto-redirect from application page to dashboard if already submitted
      if (pathname.startsWith("/application")) {
        const applicationStatus = (token as any).applicationStatus as string | undefined
        const cookieSubmitted = req.cookies.get('iiici_app_submitted')?.value === 'true'
        
        // If application is submitted, under review, or approved, redirect to dashboard
        if (applicationStatus && (
          applicationStatus.toLowerCase() === 'submitted' ||
          applicationStatus.toLowerCase() === 'under_review' ||
          applicationStatus.toLowerCase() === 'approved'
        )) {
          const dashboardUrl = new URL("/dashboard", req.url)
          return NextResponse.redirect(dashboardUrl)
        }
        
        // Also redirect if cookie indicates submission
        if (cookieSubmitted) {
          const dashboardUrl = new URL("/dashboard", req.url)
          return NextResponse.redirect(dashboardUrl)
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
