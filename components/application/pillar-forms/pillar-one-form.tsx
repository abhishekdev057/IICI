"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarOneIndicators = [
  {
    id: "1.1.a",
    shortName: "Formal Innovation Intent",
    description: "Assesses whether the organization has a formal, written statement defining its innovation intent, such as goals for creativity and novelty in operations.",
    measurementUnit: "Score (0-2)",
    remark: "This is a foundational qualitative indicator; evidence must be verifiable through audits.",
    example: "A tech company has a 5-page innovation charter in its strategic plan, outlining intent for AI-driven products, scoring 2.",
    evidenceRequired: "Upload strategy document or charter (PDF/file). For score 0-1: Basic excerpt. For score 2: Full document with date/signature.",
    maxScore: 2,
  },
  {
    id: "1.1.b", 
    shortName: "Strategy Alignment",
    description: "Evaluates if the innovation strategy directly supports broader business goals, such as market expansion or efficiency gains.",
    measurementUnit: "Percentage (%)",
    remark: "Requires document analysis; misalignment may indicate siloed planning.",
    example: "A manufacturing firm's innovation strategy for sustainable materials aligns with 90% of its green business objectives, scoring 90%.",
    evidenceRequired: "Business and innovation strategy docs (PDFs). For <50%: Summary. For >50%: Detailed cross-reference table or auditor-verified link.",
  },
  {
    id: "1.1.c",
    shortName: "Innovation Priorities", 
    description: "Checks for explicit listing of innovation focus areas, like product development or process improvements.",
    measurementUnit: "Score (0-2)",
    remark: "Priorities should be prioritized and ranked for better assessment.",
    example: "A retail company outlines priorities like 'digital transformation' and 'new e-commerce models' in a dedicated section, scoring 2.",
    evidenceRequired: "Strategy document excerpt (PDF/image). For score 0-1: Basic list. For score 2: Ranked list with examples (file/link).",
    maxScore: 2,
  },
  {
    id: "1.1.d",
    shortName: "Intent Communication",
    description: "Assesses dissemination of innovation intent to employees, partners, and investors.",
    measurementUnit: "Percentage (%)",
    remark: "Use anonymous surveys to avoid bias; include evidence like emails or meetings.",
    example: "85% of employees and partners report receiving the innovation intent via town halls and newsletters, scoring 85%.",
    evidenceRequired: "Survey results (Excel/PDF), email logs or meeting minutes (files/links). For <70%: Aggregate data. For >70%: Raw anonymized responses.",
  },
]

interface PillarOneFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarOneForm({ onDataChange, onScoreChange, initialData }: PillarOneFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const responses = Object.keys(formData).length
    const evidenceCount = Object.keys(evidence).length
    const total = pillarOneIndicators.length
    
    let totalScore = 0
    let scoredIndicators = 0
    
    pillarOneIndicators.forEach(indicator => {
      const value = formData[indicator.id]
      if (value !== undefined && value !== null && value !== "") {
        scoredIndicators++
        if (indicator.measurementUnit.includes("Score")) {
          const maxScore = indicator.maxScore || 2
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
    console.log('Pillar form sending combined data:', combinedData);
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
    console.log(`Evidence changed for indicator ${indicatorId}:`, evidenceData);
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
              Pillar 1: Strategic Foundation & Leadership
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
            This pillar evaluates your organization's formal commitment to innovation through documented strategies,
            leadership engagement, and systematic resource allocation. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarOneIndicators.map((indicator) => (
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