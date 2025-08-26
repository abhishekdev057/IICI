"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface SaveIndicatorProps {
  isLoading: boolean
  hasUnsavedChanges: boolean
  lastSaved?: Date
  error?: string | null
}

export function SaveIndicator({ 
  isLoading, 
  hasUnsavedChanges, 
  lastSaved, 
  error 
}: SaveIndicatorProps) {
  const getStatus = () => {
    if (error) return { variant: "destructive" as const, text: "Save Failed", icon: AlertCircle }
    if (isLoading) return { variant: "secondary" as const, text: "Saving...", icon: Loader2 }
    if (lastSaved) return { variant: "outline" as const, text: "Saved", icon: CheckCircle }
    return { variant: "outline" as const, text: "Not Saved", icon: AlertCircle }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.variant} className="flex items-center gap-1">
        {isLoading ? (
          <Icon className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        {status.text}
      </Badge>
      {lastSaved && !isLoading && (
        <span className="text-xs text-muted-foreground">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
