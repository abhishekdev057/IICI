"use client"

import { useState, useCallback } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

const pillarSixIndicators = [
  {
    id: "6.1.1",
    shortName: "Innovation Impact",
    description: "Measurable impact of innovation activities.",
    howToCalculate: "Rate innovation impact from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider business impact, market success, and strategic value.",
    example: "A company with significant innovation impact scores 5",
    evidenceRequired: "Impact assessments and success metrics",
    maxScore: 5,
  },
  {
    id: "6.1.2",
    shortName: "Revenue from Innovation",
    description: "Percentage of revenue from new products/services.",
    howToCalculate: "Calculate as (New Product Revenue / Total Revenue) × 100",
    measurementUnit: "Percentage (%)",
    remark: "Consider revenue from products/services launched in last 3 years.",
    example: "A company with 30% revenue from new products scores 30%",
    evidenceRequired: "Revenue reports and product launch records",
    maxScore: 100,
  },
  {
    id: "6.1.3",
    shortName: "Market Share Growth",
    description: "Market share growth from innovation.",
    howToCalculate: "Rate market share growth from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider market share expansion through innovation.",
    example: "A company with significant market share growth scores 5",
    evidenceRequired: "Market share analysis and growth reports",
    maxScore: 5,
  },
  {
    id: "6.1.4",
    shortName: "Customer Satisfaction",
    description: "Customer satisfaction with innovative products/services.",
    howToCalculate: "Rate customer satisfaction from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider customer feedback and satisfaction scores.",
    example: "A company with high customer satisfaction scores 5",
    evidenceRequired: "Customer satisfaction surveys and feedback",
    maxScore: 5,
  },
  {
    id: "6.2.1",
    shortName: "Process Improvements",
    description: "Number of process improvements implemented.",
    howToCalculate: "Count process improvements implemented annually",
    measurementUnit: "Number",
    remark: "Consider systematic process innovation and optimization.",
    example: "A company implementing 20 process improvements per year",
    evidenceRequired: "Process improvement records and implementation logs",
    maxScore: 20,
  },
  {
    id: "6.2.2",
    shortName: "Efficiency Gains",
    description: "Efficiency improvements from innovation.",
    howToCalculate: "Rate efficiency improvement from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider productivity and efficiency gains.",
    example: "A company with significant efficiency gains scores 5",
    evidenceRequired: "Efficiency metrics and productivity reports",
    maxScore: 5,
  },
  {
    id: "6.2.3",
    shortName: "Cost Reduction",
    description: "Cost reduction from innovation activities.",
    howToCalculate: "Rate cost reduction effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider cost savings from innovation initiatives.",
    example: "A company with significant cost reduction scores 5",
    evidenceRequired: "Cost reduction reports and savings documentation",
    maxScore: 5,
  },
  {
    id: "6.2.4",
    shortName: "Quality Improvements",
    description: "Quality improvements from innovation.",
    howToCalculate: "Rate quality improvement from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider product/service quality enhancements.",
    example: "A company with significant quality improvements scores 5",
    evidenceRequired: "Quality metrics and improvement reports",
    maxScore: 5,
  },
  {
    id: "6.3.1",
    shortName: "Innovation Awards",
    description: "Recognition and awards for innovation.",
    howToCalculate: "Count innovation awards and recognition received",
    measurementUnit: "Number",
    remark: "Consider industry awards, patents, and recognition.",
    example: "A company with 5 innovation awards in the last year",
    evidenceRequired: "Award certificates and recognition documentation",
    maxScore: 10,
  },
  {
    id: "6.3.2",
    shortName: "Industry Recognition",
    description: "Industry recognition for innovation leadership.",
    howToCalculate: "Rate industry recognition from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider thought leadership and industry standing.",
    example: "A company recognized as innovation leader scores 5",
    evidenceRequired: "Industry recognition and thought leadership evidence",
    maxScore: 5,
  },
  {
    id: "6.3.3",
    shortName: "Innovation Reputation",
    description: "External reputation for innovation.",
    howToCalculate: "Rate innovation reputation from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider brand perception and market reputation.",
    example: "A company with strong innovation reputation scores 5",
    evidenceRequired: "Brand perception studies and reputation assessments",
    maxScore: 5,
  },
  {
    id: "6.3.4",
    shortName: "Innovation Influence",
    description: "Influence on industry innovation trends.",
    howToCalculate: "Rate industry influence from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider thought leadership and trend-setting capabilities.",
    example: "A company that influences industry innovation scores 5",
    evidenceRequired: "Thought leadership content and industry influence metrics",
    maxScore: 5,
  },
]

export function PillarSixForm() {
  const { state, updateIndicator, updateEvidence } = useApplication()
  
  const application = state.application
  if (!application) return null
  
  const pillarData = application.pillarData.pillar_6 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(6, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(6, indicatorId, evidenceData)
  }, [updateEvidence])

  // Calculate completion
  const completedIndicators = pillarSixIndicators.filter(indicator => {
    const value = pillarData.indicators?.[indicator.id]?.value
    return value !== null && value !== undefined && value !== ""
  })

  const completionPercentage = (completedIndicators.length / pillarSixIndicators.length) * 100

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pillar 6: Innovation Impact & Recognition
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Measures the impact and recognition of innovation activities.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : completionPercentage > 50 ? "secondary" : "outline"}>
                {completionPercentage === 100 ? "Complete" : completionPercentage > 50 ? "In Progress" : "Started"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {completedIndicators.length} of {pillarSixIndicators.length} indicators completed
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(completionPercentage)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarSixIndicators.map((indicator) => (
          <CleanIndicatorInput
            key={indicator.id}
            indicator={indicator}
            pillarId={6}
            value={pillarData.indicators?.[indicator.id]?.value || null}
            evidence={pillarData.indicators?.[indicator.id]?.evidence || {}}
            onChange={(value) => handleIndicatorChange(indicator.id, value)}
            onEvidenceChange={(evidenceData) => handleEvidenceChange(indicator.id, evidenceData)}
          />
        ))}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">
                Congratulations! You have completed all indicators for Pillar 6.
              </p>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Complete all indicators to maximize your pillar score and certification potential.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
