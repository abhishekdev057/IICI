"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarThreeIndicators = [
  {
    id: "3.1.1",
    shortName: "Innovation Processes",
    description: "Assesses the systematic approach to managing innovation activities.",
    measurementUnit: "Score (1-5)",
    remark: "Based on ISO 56002 guidelines.",
    example: "Fully adheres to 5-stage process, maturity level 4.",
    evidenceRequired: "Process maps (PDF/images), audit reports. For <3: Basic map. For >3: ISO compliance cert.",
    maxScore: 5,
  },
  {
    id: "3.2.1",
    shortName: "Idea Capture",
    description:
      "A systematic process is used for the capture, documentation, and tracking of ideas from all levels of the organization.",
    measurementUnit: "Number",
    remark: "Process should be inclusive.",
    example: "200 ideas captured quarterly via portal.",
    evidenceRequired: "Idea logs (Excel), portal screenshots. For <100: Counts. For >100: Sample ideas.",
  },
  {
    id: "3.4.1",
    shortName: "Creative Encouragement",
    description:
      "The culture actively encourages and rewards creativity, calculated risk-taking, and cross-functional collaboration.",
    measurementUnit: "Score (1-5)",
    remark: "Rewards like bonuses.",
    example: "Culture rated 4.3/5 for rewards.",
    evidenceRequired: "Survey results, reward policies (PDF). For <3: Averages. For >3: Reward examples.",
    maxScore: 5,
  },
  {
    id: "3.4.2",
    shortName: "Psychological Safety",
    description:
      "The organization fosters open communication, values diversity of thought, and provides safe spaces for experimentation.",
    measurementUnit: "Percentage (%)",
    remark: "Key for retention.",
    example: "90% feel safe to experiment.",
    evidenceRequired: "Survey data (Excel). For <50%: Percentages. For >50%: Qualitative feedback.",
  },
]

interface PillarThreeFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarThreeForm({ onDataChange, onScoreChange, initialData }: PillarThreeFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const responses = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ""
    ).length
    const evidenceCount = Object.keys(evidence).length
    const total = pillarThreeIndicators.length
    
    let totalScore = 0
    let scoredIndicators = 0
    
    pillarThreeIndicators.forEach(indicator => {
      const value = formData[indicator.id]
      if (value !== undefined && value !== null && value !== "") {
        scoredIndicators++
        if (indicator.measurementUnit.includes("Score")) {
          const maxScore = indicator.maxScore || 5
          totalScore += (value / maxScore) * 100
        } else if (indicator.measurementUnit.includes("Percentage")) {
          totalScore += Math.min(value, 100) // Cap percentage at 100%
        } else if (indicator.measurementUnit === "Number") {
          // Normalize based on example (200 ideas = 100%)
          totalScore += Math.min((value / 200) * 100, 100)
        }
      }
    })
    
    const averageScore = scoredIndicators > 0 ? Math.min(totalScore / scoredIndicators, 100) : 0 // Cap average at 100%
    
    return {
      responses,
      evidenceCount,
      total,
      averageScore,
      completion: (responses / total) * 100
    }
  }, [formData, evidence])

  // Update parent when data changes - ONLY specific values
  useEffect(() => {
    const combinedData = {
      indicators: formData,
      evidence: evidence,
      stats: stats
    }
    onDataChange(combinedData)
    onScoreChange(stats.averageScore)
  }, [stats.averageScore, stats.completion]) // Only depend on specific numeric values

  // Handle input changes
  const handleInputChange = useCallback((indicatorId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [indicatorId]: value
    }))
  }, [])

  // Handle evidence changes
  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    setEvidence((prev: any) => ({
      ...prev,
      [indicatorId]: evidenceData
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={`border-l-4 ${stats.completion >= 80 ? 'border-l-green-500 bg-green-50/30' : stats.completion >= 50 ? 'border-l-yellow-500 bg-yellow-50/30' : 'border-l-red-500 bg-red-50/30'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Pillar 3: Innovation Processes & Culture
              {stats.completion >= 80 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {stats.responses}/{stats.total} Responses
              </Badge>
              <Badge variant="outline">
                {Math.round(stats.completion)}% Complete
              </Badge>
              <Badge variant="outline">
                Score: {Math.round(stats.averageScore)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This pillar evaluates your organization's structured innovation processes and the cultural environment that
            supports creative thinking and systematic innovation. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarThreeIndicators.map((indicator) => (
          <IndicatorInput
            key={indicator.id}
            indicator={indicator}
            value={formData[indicator.id]}
            onChange={(value) => handleInputChange(indicator.id, value)}
            onEvidenceChange={(evidenceData) => handleEvidenceChange(indicator.id, evidenceData)}
            evidence={evidence[indicator.id]}
          />
        ))}
      </div>

      {/* Completion Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span>Pillar Completion:</span>
            <span className={`font-medium ${stats.completion >= 80 ? 'text-green-600' : stats.completion >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(stats.completion)}% ({stats.responses}/{stats.total} indicators)
            </span>
          </div>
          {stats.completion < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              Complete all indicators to maximize your pillar score and certification potential.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
