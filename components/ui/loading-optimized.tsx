"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

interface LoadingOptimizedProps {
  message?: string
  subMessage?: string
  progress?: number
  showProgress?: boolean
  variant?: "default" | "success" | "error"
}

export function LoadingOptimized({ 
  message = "Loading...", 
  subMessage,
  progress = 0,
  showProgress = true,
  variant = "default"
}: LoadingOptimizedProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev >= progress) return progress
          return prev + Math.random() * 10
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [progress, showProgress])

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-500" />
      default:
        return <Clock className="h-8 w-8 animate-spin text-primary" />
    }
  }

  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {message}
        </h2>
        
        {subMessage && (
          <p className="text-muted-foreground mb-6">
            {subMessage}
          </p>
        )}
        
        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(displayProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round(displayProgress)}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton loading component for better perceived performance
export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

// Progressive loading component
export function ProgressiveLoader({ 
  steps, 
  currentStep = 0 
}: { 
  steps: string[]
  currentStep?: number 
}) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            index < currentStep 
              ? 'bg-green-500 text-white' 
              : index === currentStep 
                ? 'bg-primary text-white animate-pulse' 
                : 'bg-gray-200 text-gray-500'
          }`}>
            {index < currentStep ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </div>
          <span className={`text-sm ${
            index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  )
}
