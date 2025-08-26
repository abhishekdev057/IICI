"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, AlertCircle } from "lucide-react"

interface ScorePreviewProps {
  overallScore: number
  pillarScores: number[]
  currentPillar: number
  certificationLevel: "Gold" | "Certified" | "Not Certified"
}

export function ScorePreview({ overallScore, pillarScores, currentPillar, certificationLevel }: ScorePreviewProps) {
  const getScoreColor = (score: number) => {
    // Cap score at 100% for display purposes
    const displayScore = Math.min(score, 100)
    if (displayScore >= 85) return "text-secondary"
    if (displayScore >= 70) return "text-primary"
    return "text-destructive"
  }

  const getProgressColor = (score: number) => {
    // Cap score at 100% for display purposes
    const displayScore = Math.min(score, 100)
    if (displayScore >= 85) return "bg-secondary"
    if (displayScore >= 70) return "bg-primary"
    return "bg-destructive"
  }

  // Helper function to format score display
  const formatScore = (score: number) => {
    if (score > 100) {
      return `${Math.round(score)}% (capped)`
    }
    return `${Math.round(score)}%`
  }

  const getCertificationBadge = () => {
    switch (certificationLevel) {
      case "Gold":
        return (
          <Badge className="bg-secondary">
            <Award className="w-3 h-3 mr-1" />
            Gold
          </Badge>
        )
      case "Certified":
        return (
          <Badge className="bg-primary">
            <Award className="w-3 h-3 mr-1" />
            Certified
          </Badge>
        )
      default:
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Certified
          </Badge>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{formatScore(overallScore)}</div>
            <TrendingUp className={`w-4 h-4 ${getScoreColor(overallScore)}`} />
          </div>
          <Progress
            value={Math.min(overallScore, 100)}
            className="mt-2"
            // @ts-ignore - Custom progress color
            style={{ "--progress-background": getProgressColor(overallScore) } as any}
          />
          {overallScore > 100 && (
            <div className="text-xs text-orange-600 mt-1">
              ⚠️ Score exceeds 100% - check calculation logic
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Pillar Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Pillar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getScoreColor(pillarScores[currentPillar] || 0)}`}>
              {formatScore(pillarScores[currentPillar] || 0)}
            </div>
            <span className="text-sm text-muted-foreground">Pillar {currentPillar + 1}</span>
          </div>
          <Progress value={Math.min(pillarScores[currentPillar] || 0, 100)} className="mt-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {pillarScores[currentPillar] > 0 ? "Score calculated from indicators" : "No data entered yet"}
          </div>
        </CardContent>
      </Card>

      {/* Certification Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-12">{getCertificationBadge()}</div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            {certificationLevel === "Gold" && "Excellent performance!"}
            {certificationLevel === "Certified" && "Good performance!"}
            {certificationLevel === "Not Certified" && "Needs improvement"}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-accent">{currentPillar + 1}/6</div>
            <span className="text-sm text-muted-foreground">Pillars</span>
          </div>
          <Progress value={((currentPillar + 1) / 6) * 100} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
