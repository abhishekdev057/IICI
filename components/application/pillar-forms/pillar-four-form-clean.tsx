"use client"

import { useState, useCallback } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

export const pillarFourIndicators = [
  {
    id: "4.1.1",
    shortName: "IP Strategy",
    description: "Quality of intellectual property strategy.",
    howToCalculate: "Rate IP strategy quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider strategy comprehensiveness and alignment with business goals.",
    example: "A company with comprehensive IP strategy scores 5",
    evidenceRequired: "IP strategy documents and implementation plans",
    maxScore: 5,
  },
  {
    id: "4.1.2",
    shortName: "IP Portfolio Value",
    description: "Value of intellectual property portfolio.",
    howToCalculate: "Calculate as (IP Value / Total Assets) ratio",
    measurementUnit: "Ratio",
    remark: "Consider patents, trademarks, copyrights, and trade secrets.",
    example: "A company with IP worth 30% of total assets has 0.3 ratio",
    evidenceRequired: "IP valuation reports and portfolio assessments",
    maxScore: 1,
  },
  {
    id: "4.1.3",
    shortName: "IP Commercialization",
    description: "Effectiveness of IP commercialization efforts.",
    howToCalculate: "Rate commercialization effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider licensing, partnerships, and direct commercialization.",
    example: "A company with successful IP commercialization scores 5",
    evidenceRequired: "Commercialization agreements and revenue reports",
    maxScore: 5,
  },
  {
    id: "4.2.1",
    shortName: "IP Identification",
    description: "Processes for identifying and capturing IP.",
    howToCalculate: "Rate IP identification process quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider systematic approaches to IP identification.",
    example: "A company with systematic IP identification scores 5",
    evidenceRequired: "IP identification processes and training materials",
    maxScore: 5,
  },
  {
    id: "4.2.2",
    shortName: "IP Protection",
    description: "Effectiveness of IP protection measures.",
    howToCalculate: "Rate IP protection effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider patents, trademarks, and trade secret protection.",
    example: "A company with comprehensive IP protection scores 5",
    evidenceRequired: "IP protection policies and legal documentation",
    maxScore: 5,
  },
  {
    id: "4.2.3",
    shortName: "IP Enforcement",
    description: "IP enforcement and defense capabilities.",
    howToCalculate: "Rate IP enforcement capability from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider legal resources and enforcement strategies.",
    example: "A company with strong IP enforcement scores 5",
    evidenceRequired: "Enforcement policies and legal case records",
    maxScore: 5,
  },
  {
    id: "4.3.1",
    shortName: "IP Risk Assessment",
    description: "IP risk assessment and management processes.",
    howToCalculate: "Rate risk assessment quality from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Consider systematic risk identification and mitigation.",
    example: "A company with comprehensive IP risk assessment scores 3",
    evidenceRequired: "Risk assessment reports and mitigation plans",
    maxScore: 3,
  },
  {
    id: "4.3.2",
    shortName: "IP Risk Mitigation",
    description: "IP risk mitigation strategies and implementation.",
    howToCalculate: "Rate risk mitigation effectiveness from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Consider proactive risk management and contingency planning.",
    example: "A company with effective risk mitigation scores 3",
    evidenceRequired: "Mitigation strategies and implementation records",
    maxScore: 3,
  },
  {
    id: "4.4.1",
    shortName: "Knowledge Management",
    description: "Knowledge management system quality.",
    howToCalculate: "Rate knowledge management system from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider capture, storage, and retrieval of knowledge.",
    example: "A company with excellent knowledge management scores 5",
    evidenceRequired: "Knowledge management system documentation",
    maxScore: 5,
  },
  {
    id: "4.4.2",
    shortName: "Knowledge Sharing",
    description: "Knowledge sharing culture and practices.",
    howToCalculate: "Rate knowledge sharing effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider cross-functional knowledge sharing and collaboration.",
    example: "A company with strong knowledge sharing culture scores 5",
    evidenceRequired: "Knowledge sharing programs and collaboration metrics",
    maxScore: 5,
  },
  {
    id: "4.4.3",
    shortName: "Knowledge Application",
    description: "Application of knowledge in innovation activities.",
    howToCalculate: "Rate knowledge application effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider how knowledge is applied to drive innovation.",
    example: "A company with effective knowledge application scores 5",
    evidenceRequired: "Knowledge application examples and impact assessments",
    maxScore: 5,
  },
]

export function PillarFourForm() {
  const { state, updateIndicator, updateEvidence } = useApplication()
  
  const application = state.application
  if (!application) return null
  
  const pillarData = application.pillarData.pillar_4 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(4, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(4, indicatorId, evidenceData)
  }, [updateEvidence])

  // Calculate completion
  const completedIndicators = pillarFourIndicators.filter(indicator => {
    const value = pillarData.indicators?.[indicator.id]?.value
    return value !== null && value !== undefined && value !== ""
  })

  const completionPercentage = (completedIndicators.length / pillarFourIndicators.length) * 100

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pillar 4: Knowledge & IP Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Evaluates knowledge management and intellectual property practices.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : completionPercentage > 50 ? "secondary" : "outline"}>
                {completionPercentage === 100 ? "Complete" : completionPercentage > 50 ? "In Progress" : "Started"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {completedIndicators.length} of {pillarFourIndicators.length} indicators completed
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
        {pillarFourIndicators.map((indicator) => (
          <CleanIndicatorInput
            key={indicator.id}
            indicator={indicator}
            pillarId={4}
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
                Congratulations! You have completed all indicators for Pillar 4.
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
