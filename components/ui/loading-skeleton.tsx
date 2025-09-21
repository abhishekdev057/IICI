"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for different use cases
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
      </div>
    </div>
  )
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function ApplicationLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <ProgressSkeleton />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6 sticky top-24">
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <ProgressSkeleton />
                
                {/* Steps Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3">
            {/* Step Header Skeleton */}
            <div className="rounded-lg border bg-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Form Content Skeleton */}
            <div className="space-y-6">
              <FormSkeleton />
            </div>

            {/* Navigation Skeleton */}
            <div className="flex justify-between pt-8">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading spinner component
export function LoadingSpinner({ size = "default", className }: { size?: "sm" | "default" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className)} />
  )
}

// Loading overlay component
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean, children: React.ReactNode }) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}