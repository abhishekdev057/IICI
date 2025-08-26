"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarTwoIndicators = [
  {
    id: "2.1.1",
    shortName: "Innovation Budget",
    description:
      "Measures the sufficiency of budget allocated for developing new products, services, or internal processes.",
    measurementUnit: "Percentage (%)",
    remark: "Benchmark against industry averages (e.g., 5-10% for tech firms).",
    example: "$500k innovation budget out of $10M total, scoring 5%.",
    evidenceRequired:
      "Financial statements or budget plans (PDF/Excel). For <5%: Aggregate figures. For >5%: Audited breakdowns.",
  },
  {
    id: "2.1.2",
    shortName: "IP Investment",
    description:
      "Evaluates the allocation of financial resources dedicated to protecting and optimizing the value of intellectual property.",
    measurementUnit: "Percentage (%)",
    remark: "Includes legal fees and filings.",
    example: "$100k on IP from $500k innovation budget, scoring 20%.",
    evidenceRequired: "Expense breakdowns (Excel), invoices (files). For <10%: Summary. For >10%: Itemized invoices.",
  },
  {
    id: "2.2.1",
    shortName: "Personnel Allocation",
    description: "Measures the extent to which adequate personnel are assigned to support innovation efforts.",
    measurementUnit: "Percentage (%)",
    remark: "Should reflect project needs.",
    example: "20 FTE out of 200 total staff, scoring 10%.",
    evidenceRequired: "HR reports or staffing charts (PDF/Excel). For <5%: List. For >5%: Detailed assignments.",
  },
  {
    id: "2.2.2",
    shortName: "Dedicated Innovation Time",
    description:
      "Evaluates the provision of dedicated time for employees to conduct experiments, test ideas, and engage in creative development.",
    measurementUnit: "Percentage (%)",
    remark: "Inspired by models like Google's 20% time.",
    example: "8 hours/month per employee out of 160, scoring 5%.",
    evidenceRequired: "Time tracking logs (Excel), policy docs (PDF). For <5%: Policy. For >5%: Tracked data.",
  },
]

interface PillarTwoFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarTwoForm({ onDataChange, onScoreChange, initialData }: PillarTwoFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const responses = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ""
    ).length
    const evidenceCount = Object.keys(evidence).length
    const total = pillarTwoIndicators.length
    
    let totalScore = 0
    let scoredIndicators = 0
    
    pillarTwoIndicators.forEach(indicator => {
      const value = formData[indicator.id]
      if (value !== undefined && value !== null && value !== "") {
        scoredIndicators++
        if (indicator.measurementUnit.includes("Percentage")) {
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
              Pillar 2: Resource Allocation & Infrastructure
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
            This pillar assesses how your organization allocates financial resources, personnel, and infrastructure to
            support innovation activities effectively. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarTwoIndicators.map((indicator) => (
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
