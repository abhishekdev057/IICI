"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarSixIndicators = [
  {
    id: "6.1.1",
    shortName: "Performance Metrics",
    description:
      "To what extent has the organization established and implemented specific metrics for evaluating innovation processes, outputs, and outcomes?",
    measurementUnit: "Percentage (%)",
    remark: "ISO 56008 aligned.",
    example: "90% of recommended metrics in use.",
    evidenceRequired: "Metrics list (PDF), implementation evidence. For <50%: List. For >50%: Usage data.",
  },
  {
    id: "6.1.2",
    shortName: "Data-Driven Decisions",
    description:
      "How effectively is data from these metrics used to support and drive strategic and operational decision-making within the innovation function?",
    measurementUnit: "Percentage (%)",
    remark: "Audit decision logs.",
    example: "80% decisions data-driven.",
    evidenceRequired: "Decision logs (PDF). For <50%: %. For >50%: Backed examples.",
  },
  {
    id: "6.2.1",
    shortName: "IMS Assessment",
    description:
      "How frequently and rigorously does the organization evaluate its overall Innovation Management System?",
    measurementUnit: "Score (0-3)",
    remark: "ISO 56004 guided.",
    example: "Quarterly evaluations, scoring 3.",
    evidenceRequired: "Evaluation reports (PDF). For 0-1: Schedule. For 2-3: Rigorous samples.",
    maxScore: 3,
  },
  {
    id: "6.3.1",
    shortName: "Feedback Loop",
    description:
      "How effectively are insights from performance measurement, evaluations, and audit findings channeled into a formal continuous improvement process?",
    measurementUnit: "Percentage (%)",
    remark: "Closed-loop system.",
    example: "95% insights lead to improvements.",
    evidenceRequired: "Insight action logs (Excel). For <50%: %. For >50%: Action examples.",
  },
]

interface PillarSixFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarSixForm({ onDataChange, onScoreChange, initialData }: PillarSixFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const responses = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ""
    ).length
    const evidenceCount = Object.keys(evidence).length
    const total = pillarSixIndicators.length
    
    let totalScore = 0
    let scoredIndicators = 0
    
    pillarSixIndicators.forEach(indicator => {
      const value = formData[indicator.id]
      if (value !== undefined && value !== null && value !== "") {
        scoredIndicators++
        if (indicator.measurementUnit.includes("Score")) {
          const maxScore = indicator.maxScore || 3
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
              Pillar 6: Performance Measurement & Improvement
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
            This pillar assesses your organization's systematic approach to measuring innovation performance and
            implementing continuous improvement processes. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarSixIndicators.map((indicator) => (
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
