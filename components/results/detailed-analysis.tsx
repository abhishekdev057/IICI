"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Target, CheckCircle, AlertCircle } from "lucide-react"
import type { OverallScore } from "@/lib/scoring-engine"

interface DetailedAnalysisProps {
  scores: OverallScore
}

export function DetailedAnalysis({ scores }: DetailedAnalysisProps) {
  const getIndicatorStatus = (score: number) => {
    if (score >= 0.8) return { icon: CheckCircle, color: "text-green-500", label: "Excellent" }
    if (score >= 0.6) return { icon: Target, color: "text-blue-500", label: "Good" }
    if (score >= 0.4) return { icon: AlertCircle, color: "text-orange-500", label: "Fair" }
    return { icon: AlertCircle, color: "text-red-500", label: "Needs Improvement" }
  }

  const getTrendIcon = (score: number) => {
    if (score >= 0.7) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (score >= 0.4) return <Minus className="h-4 w-4 text-orange-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {scores.pillars.map((pillar) => (
        <Card key={pillar.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{pillar.name}</CardTitle>
              <div className="flex items-center gap-2">
                {getTrendIcon(pillar.averageScore / 100)}
                <Badge variant={pillar.averageScore >= 70 ? "default" : "secondary"}>
                  {Math.round(pillar.averageScore)}%
                </Badge>
              </div>
            </div>
            <Progress value={pillar.averageScore} className="mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pillar.subPillars.map((subPillar) => (
                <div key={subPillar.id} className="space-y-3">
                  <h4 className="font-medium text-sm">{subPillar.name} Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subPillar.indicators.map((indicator) => {
                      const status = getIndicatorStatus(indicator.normalizedScore)
                      const StatusIcon = status.icon

                      return (
                        <div key={indicator.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <StatusIcon className={`h-4 w-4 ${status.color}`} />
                                <span className="text-sm font-medium">{indicator.id}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {status.label}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">{Math.round(indicator.normalizedScore * 100)}%</div>
                              <div className="text-xs text-muted-foreground">{indicator.measurementUnit}</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Raw Value:</span>
                              <span className="font-mono">{indicator.rawValue || "N/A"}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Evidence:</span>
                              <span className={indicator.hasEvidence ? "text-green-600" : "text-orange-600"}>
                                {indicator.hasEvidence ? "Provided" : "Missing"}
                              </span>
                            </div>
                          </div>
                          <Progress value={indicator.normalizedScore * 100} className="mt-2 h-1" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
