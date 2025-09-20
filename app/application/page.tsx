"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CleanFormWizard } from "@/components/application/clean-form-wizard";
import { ApplicationProvider } from "@/contexts/application-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, Building2, Award } from "lucide-react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";

export default function ApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Add debugging
  console.log('ApplicationPage render - session:', session, 'status:', status);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setIsRedirecting(true);
      // Redirect to auth page with callback to return here
      const authUrl = new URL("/auth", window.location.origin);
      authUrl.searchParams.set("callbackUrl", "/application");
      router.push(authUrl.toString());
    }
  }, [session, status, router]);

  // Show loading state while checking authentication - OPTIMIZED for speed
  if (status === "loading" || isRedirecting) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dashboard" title="IIICI Application" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">
              {status === "loading"
                ? "Loading application..."
                : "Redirecting to login..."}
            </p>
            {/* OPTIMIZED: Faster progress indicator */}
            <div className="mt-3 w-48 bg-gray-200 rounded-full h-1.5 mx-auto">
              <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{width: '80%'}}></div>
            </div>
          </div>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  // Show authentication required message if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dashboard" title="IIICI Application" />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Authentication Required
              </CardTitle>
              <p className="text-muted-foreground">
                Please sign in to start your IIICI certification application
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  const authUrl = new URL("/auth", window.location.origin);
                  authUrl.searchParams.set("callbackUrl", "/application");
                  router.push(authUrl.toString());
                }}
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                Continue with Google
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  By continuing, you agree to our terms of service and privacy
                  policy
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <span>Need help?</span>
                  <a href="#" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer variant="minimal" />
      </div>
    );
  }

  return (
    <ApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navigation variant="dashboard" title="IIICI Application" />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
                  IIICI Certification Application
                </h1>
                <p className="text-muted-foreground">
                  Complete your institutional innovation assessment to earn your certification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Step-by-step assessment process • Industry-standard evaluation • Professional certification
              </span>
            </div>
          </div>

          {/* Application Form */}
          <CleanFormWizard />
        </div>
        <Footer variant="minimal" />
      </div>
    </ApplicationProvider>
  );
}
