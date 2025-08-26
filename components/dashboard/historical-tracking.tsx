"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Calendar, RotateCcw } from "lucide-react"

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
  const sortedHistory = [...history].sort((a, b) => b.year - a.year)
  const previousScore = sortedHistory[1]?.overallScore || 0
  const scoreChange = currentScore - previousScore

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-secondary" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-secondary"
    if (change < 0) return "text-destructive"
    return "text-muted-foreground"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentScore.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${getTrendColor(scoreChange)}`}>
                {scoreChange > 0 ? "+" : ""}
                {scoreChange.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {getTrendIcon(scoreChange)}
                Change from Last Year
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">{history.length}</div>
              <div className="text-sm text-muted-foreground">Total Assessments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assessment History</CardTitle>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reapply for {new Date().getFullYear() + 1}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedHistory.map((entry, index) => (
              <div key={entry.year} className="relative">
                {index < sortedHistory.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{entry.year}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.year} Assessment</h3>
                        {getCertificationBadge(entry.certificationLevel)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{entry.overallScore.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.submittedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Pillar Scores Comparison */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                      {entry.pillarScores.map((score, pillarIndex) => {
                        const currentPillarScore = sortedHistory[0]?.pillarScores[pillarIndex] || 0
                        const pillarChange = index === 0 ? 0 : currentPillarScore - score

                        return (
                          <div key={pillarIndex} className="text-xs p-2 bg-muted/30 rounded">
                            <div className="font-medium truncate">{pillarNames[pillarIndex]}</div>
                            <div className="flex items-center justify-between">
                              <span>{score.toFixed(1)}%</span>
                              {index > 0 && (
                                <span className={`flex items-center gap-1 ${getTrendColor(pillarChange)}`}>
                                  {pillarChange > 0 ? "+" : ""}
                                  {pillarChange.toFixed(1)}%{getTrendIcon(pillarChange)}
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
