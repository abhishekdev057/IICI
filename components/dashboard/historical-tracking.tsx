"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Calendar, RotateCcw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface HistoricalEntry {
  year: number
  overallScore: number
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  pillarScores: number[]
  submittedDate: string
}

interface HistoricalTrackingProps {
  history: HistoricalEntry[]
  currentScore: number
}

export function HistoricalTracking({ history, currentScore }: HistoricalTrackingProps) {
  const [showReapplyInfo, setShowReapplyInfo] = useState(false)
  const { toast } = useToast()
  
  const sortedHistory = [...history].sort((a, b) => b.year - a.year)
  const previousScore = sortedHistory[1]?.overallScore || 0
  const scoreChange = currentScore - previousScore

  const currentYear = new Date().getFullYear()
  const lastAssessmentYear = sortedHistory[0]?.year || currentYear
  const nextAssessmentYear = lastAssessmentYear + 1
  
  const canReapply = currentYear >= nextAssessmentYear
  
  const getTimeUntilNextAssessment = () => {
    if (canReapply) return null
    
    const lastAssessmentDate = new Date(sortedHistory[0]?.submittedDate || Date.now())
    const nextAssessmentDate = new Date(lastAssessmentDate.getFullYear() + 1, lastAssessmentDate.getMonth(), lastAssessmentDate.getDate())
    const now = new Date()
    
    const diffTime = nextAssessmentDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return null
    
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} and ${days} day${days > 1 ? 's' : ''}`
    }
    return `${days} day${days > 1 ? 's' : ''}`
  }
  
  const timeUntilNext = getTimeUntilNextAssessment()

  // If no history, show empty state
  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Assessment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assessment History</h3>
              <p className="text-muted-foreground mb-4">
                This is your first assessment. Complete your certification to start building your innovation history.
              </p>
              <Button asChild>
                <Link href="/application">
                  Start Assessment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-secondary" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getCertificationBadge = (level: string) => {
    switch (level) {
      case "Gold":
        return <Badge className="bg-secondary">Gold</Badge>
      case "Certified":
        return <Badge className="bg-primary">Certified</Badge>
      default:
        return <Badge variant="destructive">Not Certified</Badge>
    }
  }

  const pillarNames = [
    "Strategic Foundation",
    "Resource Allocation",
    "Innovation Processes",
    "Knowledge & IP",
    "Strategic Intelligence",
    "Performance Measurement",
  ]

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-primary">{currentScore.toFixed(1)}%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-xl md:text-2xl font-bold ${getTrendColor(scoreChange)}`}>
                {scoreChange > 0 ? "+" : ""}
                {scoreChange.toFixed(1)}%
              </div>
              <div className="text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1">
                {getTrendIcon(scoreChange)}
                <span className="hidden sm:inline">Change from Last Year</span>
                <span className="sm:hidden">Change</span>
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="text-xl md:text-2xl font-bold text-accent">{history.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Assessments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Timeline */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Assessment History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {canReapply ? (
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link href="/application">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Reapply for {nextAssessmentYear}</span>
                    <span className="sm:hidden">Reapply</span>
                  </Link>
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Next assessment available in {timeUntilNext}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedHistory.map((entry, index) => (
              <div key={entry.year} className="relative">
                {index < sortedHistory.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />}

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-bold text-primary">{entry.year}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-sm md:text-base">{entry.year} Assessment</h3>
                        {getCertificationBadge(entry.certificationLevel)}
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-base md:text-lg font-bold text-primary">{entry.overallScore.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.submittedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Pillar Scores Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                      {entry.pillarScores.map((score, pillarIndex) => {
                        const currentPillarScore = sortedHistory[0]?.pillarScores[pillarIndex] || 0
                        const pillarChange = index === 0 ? 0 : currentPillarScore - score

                        return (
                          <div key={pillarIndex} className="text-xs p-2 bg-muted/30 rounded">
                            <div className="font-medium truncate">{pillarNames[pillarIndex]}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold">{score.toFixed(1)}%</span>
                              {index > 0 && (
                                <span className={`flex items-center gap-1 ${getTrendColor(pillarChange)}`}>
                                  <span className="text-xs">
                                    {pillarChange > 0 ? "+" : ""}
                                    {pillarChange.toFixed(1)}%
                                  </span>
                                  {getTrendIcon(pillarChange)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
