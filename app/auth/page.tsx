"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, Award, ArrowRight, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";

function AuthPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety check: validate and sanitize callback URL
  const rawCallbackUrl = searchParams.get("callbackUrl");
  let callbackUrl = "/dashboard";

  if (rawCallbackUrl) {
    try {
      // Check if the callback URL is reasonable length and valid
      if (rawCallbackUrl.length < 2000 && rawCallbackUrl.startsWith("/")) {
        callbackUrl = rawCallbackUrl;
      }
    } catch (error) {
      console.warn("Invalid callback URL:", rawCallbackUrl);
    }
  }

  // Check for error messages
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "AccessDenied":
          setError("Access denied. Please try again.");
          break;
        case "Configuration":
          setError("Authentication configuration error. Please contact support.");
          break;
        case "Verification":
          setError("Email verification failed. Please try again.");
          break;
        default:
          setError("An error occurred during sign in. Please try again.");
      }
    }
  }, [searchParams]);

  // Determine the context of why user is signing in
  const getAuthContext = () => {
    if (callbackUrl.includes("/application")) {
      return {
        title: "Start Your Certification Journey",
        subtitle: "Sign in to begin your IIICI innovation certification assessment",
        icon: <Building2 className="w-8 h-8 text-primary" />,
      };
    } else if (callbackUrl.includes("/dashboard")) {
      return {
        title: "Access Your Dashboard",
        subtitle: "Sign in to view your certification progress and results",
        icon: <Shield className="w-8 h-8 text-primary" />,
      };
    } else if (callbackUrl.includes("/admin")) {
      return {
        title: "Admin Access Required",
        subtitle: "Sign in with admin credentials to access the admin panel",
        icon: <Lock className="w-8 h-8 text-primary" />,
      };
    } else {
      return {
        title: "Welcome to IIICI",
        subtitle: "Sign in to access your innovation certification dashboard",
        icon: <Shield className="w-8 h-8 text-primary" />,
      };
    }
  };

  const authContext = getAuthContext();

  useEffect(() => {
    if (session) {
      // Redirect based on user role or callback URL
      if (session.user.role === "SUPER_ADMIN") {
        // Super admins always go to admin dashboard unless they were trying to access a specific page
        const isAdminRoute = callbackUrl.startsWith("/admin");
        router.push(isAdminRoute ? callbackUrl : "/admin");
      } else if (session.user.role === "ADMIN") {
        // Regular admins can access admin routes
        const isAdminRoute = callbackUrl.startsWith("/admin");
        router.push(isAdminRoute ? callbackUrl : "/dashboard");
      } else {
        // Regular users go to dashboard
        router.push(callbackUrl);
      }
    }
  }, [session, router, callbackUrl]);

  const handleSignIn = async (provider: string) => {
    setIsSigningIn(true);
    setError(null);

    try {
      const result = await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Sign in failed. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already signed in, show a brief message before redirect
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4">
                {authContext.icon}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {authContext.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {authContext.subtitle}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={() => handleSignIn("google")}
                  disabled={isSigningIn}
                  className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isSigningIn ? "Signing in..." : "Sign in with Google"}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Secure Authentication</h3>
                <p className="text-xs text-muted-foreground">
                  Industry-standard security protocols
                </p>
              </div>
              <div className="text-center">
                <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Innovation Assessment</h3>
                <p className="text-xs text-muted-foreground">
                  Comprehensive evaluation framework
                </p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Professional Certification</h3>
                <p className="text-xs text-muted-foreground">
                  Recognized industry credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
