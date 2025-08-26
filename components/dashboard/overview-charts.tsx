"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OverviewChartsProps {
  overallScore: number
  pillarScores: number[]
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  issuedDate?: string
  expiryDate?: string
}

export function OverviewCharts({
  overallScore,
  pillarScores,
  certificationLevel,
  issuedDate,
  expiryDate,
}: OverviewChartsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 70) return "bg-green-50"
    if (score >= 50) return "bg-yellow-50"
    return "bg-red-50"
  }

  const pillarNames = [
    "Strategic Foundation",
    "Resource Allocation",
    "Innovation Processes",
    "Knowledge & IP",
    "Strategic Intelligence",
    "Performance Measurement",
  ]

  const CircularProgress = ({ score, size = 120 }: { score: number; size?: number }) => {
    const safeScore = isNaN(score) || !isFinite(score) ? 0 : Math.max(0, Math.min(100, score))
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (safeScore / 100) * circumference



    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={safeScore >= 70 ? "text-green-600" : safeScore >= 50 ? "text-yellow-600" : "text-red-600"}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(safeScore)}`}>{Math.round(safeScore)}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        </div>
      </div>
    )
  }

  const getCertificationBadge = () => {
    switch (certificationLevel) {
      case "Gold":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Award className="w-3 h-3 mr-1" />
            Gold Certified
          </Badge>
        )
      case "Certified":
        return (
          <Badge className="bg-green-500 text-white">
            <Award className="w-3 h-3 mr-1" />
            Certified
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500 text-white">Not Certified</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${getScoreBackground(overallScore)}`} />
        <CardHeader className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">Innovation Maturity Score</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {getCertificationBadge()}
                {issuedDate && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Issued {new Date(issuedDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <CircularProgress score={overallScore} size={120} />
              <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#reports">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {expiryDate && (
            <div className="text-sm text-muted-foreground">
              Certification expires on {new Date(expiryDate).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pillar Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillarScores.map((score, index) => {
          const safeScore = isNaN(score) || !isFinite(score) ? 0 : Math.max(0, Math.min(100, score))
          const hasData = safeScore > 0
          
          return (
            <Card key={index} className={`hover:shadow-lg transition-shadow cursor-pointer ${!hasData ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Pillar {index + 1}</span>
                  <TrendingUp className={`w-4 h-4 ${getScoreColor(safeScore)}`} />
                </CardTitle>
                <div className="text-xs text-muted-foreground">{pillarNames[index]}</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CircularProgress score={safeScore} size={80} />
                  <div className="text-center sm:text-right">
                    <div className={`text-xl font-bold ${getScoreColor(safeScore)}`}>
                      {Math.round(safeScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {safeScore >= 70 ? "Excellent" : safeScore >= 50 ? "Good" : hasData ? "Needs Work" : "No Data"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
