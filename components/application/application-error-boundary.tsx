"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ApplicationErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "Application Error Boundary caught an error:",
      error,
      errorInfo
    );

    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with error reporting services here
      console.error("Production error:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // After max retries, reload the page
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Something went wrong with the application form. This could be
                  due to:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>A temporary network issue</li>
                  <li>Browser compatibility problems</li>
                  <li>An unexpected application error</li>
                </ul>
              </div>

              {process.env.NODE_ENV === "development" && error && (
                <details className="text-xs bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium">
                    Technical Details (Development Mode)
                  </summary>
                  <div className="mt-2 space-y-1">
                    <p>
                      <strong>Error:</strong> {error.message}
                    </p>
                    <p>
                      <strong>Retry Count:</strong> {retryCount}/
                      {this.maxRetries}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 overflow-auto text-xs bg-background p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {canRetry ? (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({retryCount + 1}/{this.maxRetries})
                  </Button>
                ) : (
                  <Button
                    onClick={this.handleReload}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please contact support with the
                  error details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useApplicationErrorHandler() {
  const { toast } = useToast();

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(
      `Application error${context ? ` in ${context}` : ""}:`,
      error
    );

    toast.error("Application Error", {
      description: "Something went wrong. Please try again.",
    });
  }, []);

  return { handleError };
}
