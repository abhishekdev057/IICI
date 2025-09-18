"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRatingInfo, renderStars } from "@/lib/utils"
import { Star } from "lucide-react"

interface RatingDisplayProps {
  score: number
  className?: string
}

export function RatingDisplay({ score, className }: RatingDisplayProps) {
  const rating = getRatingInfo(score)
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500" />
          Innovation Maturity Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-mono">
            {renderStars(rating.stars)}
          </div>
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit">
              {rating.range}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {rating.level}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Assessment Summary:</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rating.description}
          </p>
        </div>
        
        {/* Score Display */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Score:</span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(score)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for smaller spaces
export function RatingDisplayCompact({ score, className }: RatingDisplayProps) {
  const rating = getRatingInfo(score)
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${className}`}>
      <div className="text-2xl font-mono">
        {renderStars(rating.stars)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {rating.range}
          </Badge>
          <span className="text-sm font-medium">{rating.level}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {rating.description}
        </p>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-primary">
          {Math.round(score)}%
        </div>
      </div>
    </div>
  )
}
