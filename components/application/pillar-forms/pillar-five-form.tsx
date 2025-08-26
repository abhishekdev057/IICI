"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarFiveIndicators = [
  {
    id: "5.1.1",
    shortName: "Intelligence Sources",
    description:
      "How diverse and comprehensive are the sources of strategic intelligence used to inform innovation decisions?",
    measurementUnit: "Score (1-5)",
    remark: "Diverse sources reduce bias.",
    example: "Uses 10+ sources, scoring 5.",
    evidenceRequired: "Source lists (Excel), sample data (files). For <3: List. For >3: Diverse samples.",
    maxScore: 5,
  },
  {
    id: "5.1.3",
    shortName: "Informed Decisions",
    description:
      "How effectively is strategic intelligence integrated into decision-making processes to ensure strategic choices are aligned with innovation goals?",
    measurementUnit: "Percentage (%)",
    remark: "Track in minutes.",
    example: "90% decisions informed.",
    evidenceRequired: "Decision minutes (PDF). For <50%: Stats. For >50%: Linked minutes.",
  },
  {
    id: "5.2.2",
    shortName: "Partner Selection",
    description:
      "How well-defined and strategic is the process for identifying, evaluating, and selecting external partners?",
    measurementUnit: "Score (1-5)",
    remark: "ISO 56003 guided.",
    example: "Defined process with criteria, scoring 4.",
    evidenceRequired: "Partner selection process doc (PDF). For <3: Description. For >3: Criteria examples.",
    maxScore: 5,
  },
  {
    id: "5.2.4",
    shortName: "Partnership Value",
    description:
      "To what extent do external collaborations demonstrably contribute to the organization's innovation capacity?",
    measurementUnit: "Percentage (%)",
    remark: "Mutual value emphasized.",
    example: "30% capacity increase from partners.",
    evidenceRequired: "Value reports (Excel), partnership outcomes. For <20%: Increases. For >20%: Quantified impacts.",
  },
]

interface PillarFiveFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarFiveForm({ onDataChange, onScoreChange, initialData }: PillarFiveFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const responses = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ""
    ).length
    const evidenceCount = Object.keys(evidence).length
    const total = pillarFiveIndicators.length
    
    let totalScore = 0
    let scoredIndicators = 0
    
    pillarFiveIndicators.forEach(indicator => {
      const value = formData[indicator.id]
      if (value !== undefined && value !== null && value !== "") {
        scoredIndicators++
        if (indicator.measurementUnit.includes("Score")) {
          const maxScore = indicator.maxScore || 5
          totalScore += (value / maxScore) * 100
        } else if (indicator.measurementUnit.includes("Percentage")) {
          totalScore += Math.min(value, 100) // Cap percentage at 100%
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
              Pillar 5: Strategic Intelligence & Collaboration
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
            This pillar evaluates your organization's ability to gather external intelligence and leverage strategic
            partnerships to enhance innovation capabilities. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarFiveIndicators.map((indicator) => (
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
