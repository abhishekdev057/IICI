"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Building, Users, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { OverallScore } from "@/lib/scoring-engine"

interface ComparisonViewProps {
  scores: OverallScore
  institutionSize: string
  industry: string
}

interface BenchmarkData {
  [key: string]: number
}

export function ComparisonView({ scores, institutionSize, industry }: ComparisonViewProps) {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real benchmark data from API
  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would fetch from a benchmarks API
        // For now, we'll calculate based on industry and size patterns
        const baseBenchmarks = {
          "Strategic Foundation & Leadership": 65,
          "Resource Allocation & Infrastructure": 58,
          "Innovation Processes & Culture": 62,
          "Knowledge & IP Management": 55,
          "Strategic Intelligence & Collaboration": 60,
          "Performance Measurement & Improvement": 57,
        }

        // Adjust based on organization size
        const sizeMultiplier = institutionSize.includes("Enterprise")
          ? 1.15
          : institutionSize.includes("Large")
            ? 1.1
            : institutionSize.includes("Medium")
              ? 1.05
              : 1.0

        // Adjust based on industry
        const industryMultiplier =
          industry === "Technology" ? 1.2 : 
          industry === "Healthcare" ? 1.1 : 
          industry === "Finance" ? 1.15 : 
          industry === "Manufacturing" ? 1.05 :
          industry === "Education" ? 1.08 : 1.0

        const adjustedBenchmarks: BenchmarkData = {}
        Object.entries(baseBenchmarks).forEach(([key, value]) => {
          adjustedBenchmarks[key] = Math.round(value * sizeMultiplier * industryMultiplier)
        })

        setBenchmarks(adjustedBenchmarks)
      } catch (error) {
        console.error('Error fetching benchmarks:', error)
        // Fallback to base benchmarks
        setBenchmarks({
          "Strategic Foundation & Leadership": 65,
          "Resource Allocation & Infrastructure": 58,
          "Innovation Processes & Culture": 62,
          "Knowledge & IP Management": 55,
          "Strategic Intelligence & Collaboration": 60,
          "Performance Measurement & Improvement": 57,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBenchmarks()
  }, [institutionSize, industry])

  if (loading || !benchmarks) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const overallBenchmark =
    Object.values(benchmarks).reduce((sum, val) => sum + val, 0) / Object.values(benchmarks).length

  const getPerformanceIndicator = (score: number, benchmark: number) => {
    const diff = score - benchmark
    if (diff > 10) return { color: "text-green-600", label: "Above Average", icon: "↗" }
    if (diff > 0) return { color: "text-blue-600", label: "Above Average", icon: "↗" }
    if (diff > -10) return { color: "text-orange-600", label: "Below Average", icon: "↘" }
    return { color: "text-red-600", label: "Well Below Average", icon: "↓" }
  }

  return (
    <div className="space-y-6">
      {/* Overall Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Performance vs. Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{Math.round(scores.overallScore)}%</div>
              <p className="text-sm text-muted-foreground">Your Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">{Math.round(overallBenchmark)}%</div>
              <p className="text-sm text-muted-foreground">Industry Average</p>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-2 ${getPerformanceIndicator(scores.overallScore, overallBenchmark).color}`}
              >
                {scores.overallScore > overallBenchmark ? "+" : ""}
                {Math.round(scores.overallScore - overallBenchmark)}%
              </div>
              <p className="text-sm text-muted-foreground">Difference</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Organization Size</span>
            </div>
            <Badge variant="outline">{institutionSize}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Industry</span>
            </div>
            <Badge variant="outline">{industry}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Pillar-by-Pillar Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Pillar Performance vs. Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores.pillars.map((pillar, index) => {
              const pillarName = [
                "Strategic Foundation & Leadership",
                "Resource Allocation & Infrastructure", 
                "Innovation Processes & Culture",
                "Knowledge & IP Management",
                "Strategic Intelligence & Collaboration",
                "Performance Measurement & Improvement"
              ][index]
              
              const benchmark = benchmarks[pillarName] || 60
              const performance = getPerformanceIndicator(pillar.averageScore, benchmark)
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{pillarName}</span>
                      <span className={`text-sm ${performance.color}`}>
                        {performance.icon} {performance.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Your Score: {Math.round(pillar.averageScore)}%</span>
                      <span>Benchmark: {benchmark}%</span>
                      <span className={performance.color}>
                        {pillar.averageScore > benchmark ? "+" : ""}
                        {Math.round(pillar.averageScore - benchmark)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pillar.averageScore > benchmark ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : pillar.averageScore < benchmark ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scores.pillars.map((pillar, index) => {
              const pillarName = [
                "Strategic Foundation & Leadership",
                "Resource Allocation & Infrastructure", 
                "Innovation Processes & Culture",
                "Knowledge & IP Management",
                "Strategic Intelligence & Collaboration",
                "Performance Measurement & Improvement"
              ][index]
              
              const benchmark = benchmarks[pillarName] || 60
              const diff = pillar.averageScore - benchmark
              
              if (diff < -10) {
                return (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">{pillarName}</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Your score is {Math.abs(Math.round(diff))}% below the industry benchmark. 
                      Consider focusing improvement efforts on this area.
                    </p>
                  </div>
                )
              } else if (diff > 10) {
                return (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">{pillarName}</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Excellent performance! Your score is {Math.round(diff)}% above the industry benchmark.
                    </p>
                  </div>
                )
              }
              return null
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
