"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  retryCount: number
  isOnline: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ 
    error: Error; 
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
    retryCount: number;
    isOnline: boolean;
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Enhanced Error Boundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Update state with error info
    this.setState({ errorInfo })

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to an error reporting service
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    const handleOnline = () => this.setState({ isOnline: true })
    const handleOffline = () => this.setState({ isOnline: false })
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state
    const newRetryCount = retryCount + 1
    
    this.setState({ retryCount: newRetryCount })
    
    // Auto-retry with exponential backoff
    if (newRetryCount <= 3) {
      const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000) // Max 10 seconds
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined 
        })
      }, delay)
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    })
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error!}
            errorInfo={this.state.errorInfo}
            resetError={this.handleReset}
            retryCount={this.state.retryCount}
            isOnline={this.state.isOnline}
          />
        )
      }

      return (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">IIICI Certification Assessment</h1>
                  <p className="text-sm text-muted-foreground">
                    Application Error
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Network status */}
                  <div className="flex items-center gap-2">
                    {this.state.isOnline ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {this.state.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Something went wrong
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      An unexpected error occurred while loading the application. This could be due to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>A temporary server issue</li>
                      <li>Network connectivity problems</li>
                      <li>An unexpected application error</li>
                      <li>Browser compatibility issues</li>
                    </ul>
                  </div>

                  {!this.state.isOnline && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <strong>No Internet Connection:</strong> Please check your internet connection and try again.
                      </p>
                    </div>
                  )}

                  {this.state.retryCount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Retry Attempt {this.state.retryCount}/3:</strong> We're trying to recover from this error automatically.
                      </p>
                    </div>
                  )}
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-xs bg-muted p-4 rounded-lg">
                      <summary className="cursor-pointer font-medium mb-2 flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Error Details (Development Mode)
                      </summary>
                      <div className="space-y-2">
                        <div>
                          <strong>Error:</strong> {this.state.error.message}
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong>Stack Trace:</strong>
                            <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded border">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="mt-1 overflow-auto text-xs bg-background p-2 rounded border">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={this.handleRetry}
                      disabled={this.state.retryCount >= 3}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                    </Button>
                    
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                    
                    <Button asChild variant="outline">
                      <Link href="/" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Go Home
                      </Link>
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      If this problem persists, please contact support with the error details above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }
  }
}
