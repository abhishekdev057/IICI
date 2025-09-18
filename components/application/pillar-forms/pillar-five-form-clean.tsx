"use client"

import { useState, useCallback } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

const pillarFiveIndicators = [
  {
    id: "5.1.1",
    shortName: "Market Intelligence",
    description: "Quality of market intelligence gathering.",
    howToCalculate: "Rate market intelligence quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider systematic market research and analysis.",
    example: "A company with comprehensive market intelligence scores 5",
    evidenceRequired: "Market research reports and intelligence systems",
    maxScore: 5,
  },
  {
    id: "5.1.2",
    shortName: "Technology Intelligence",
    description: "Technology trend monitoring and analysis.",
    howToCalculate: "Rate technology intelligence effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider technology scouting and trend analysis.",
    example: "A company with excellent technology intelligence scores 5",
    evidenceRequired: "Technology intelligence reports and trend analysis",
    maxScore: 5,
  },
  {
    id: "5.1.3",
    shortName: "Competitive Intelligence",
    description: "Competitive landscape monitoring and analysis.",
    howToCalculate: "Rate competitive intelligence quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider competitor analysis and benchmarking.",
    example: "A company with comprehensive competitive intelligence scores 5",
    evidenceRequired: "Competitive analysis reports and benchmarking data",
    maxScore: 5,
  },
  {
    id: "5.1.4",
    shortName: "Intelligence Sources",
    description: "Number of intelligence sources and networks.",
    howToCalculate: "Count active intelligence sources and networks",
    measurementUnit: "Number",
    remark: "Consider external partnerships, networks, and information sources.",
    example: "A company with 5 active intelligence networks",
    evidenceRequired: "Intelligence source inventory and network documentation",
    maxScore: 5,
  },
  {
    id: "5.1.5",
    shortName: "Intelligence Integration",
    description: "Integration of intelligence into decision-making.",
    howToCalculate: "Rate intelligence integration effectiveness from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Consider how intelligence informs strategic decisions.",
    example: "A company with systematic intelligence integration scores 3",
    evidenceRequired: "Decision-making processes and intelligence utilization",
    maxScore: 3,
  },
  {
    id: "5.2.1",
    shortName: "External Partnerships",
    description: "Quality and quantity of external innovation partnerships.",
    howToCalculate: "Rate partnership quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider strategic partnerships, alliances, and collaborations.",
    example: "A company with high-quality external partnerships scores 5",
    evidenceRequired: "Partnership agreements and collaboration records",
    maxScore: 5,
  },
  {
    id: "5.2.2",
    shortName: "Collaboration Management",
    description: "Effectiveness of collaboration management processes.",
    howToCalculate: "Rate collaboration management from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider project management and relationship management.",
    example: "A company with excellent collaboration management scores 5",
    evidenceRequired: "Collaboration management processes and tools",
    maxScore: 5,
  },
  {
    id: "5.2.3",
    shortName: "Knowledge Exchange",
    description: "Knowledge exchange and learning from external partners.",
    howToCalculate: "Rate knowledge exchange effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider systematic knowledge sharing and learning.",
    example: "A company with effective knowledge exchange scores 5",
    evidenceRequired: "Knowledge exchange programs and learning records",
    maxScore: 5,
  },
  {
    id: "5.2.4",
    shortName: "Innovation Ecosystem",
    description: "Participation in innovation ecosystems and networks.",
    howToCalculate: "Rate ecosystem participation from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider involvement in industry networks and innovation hubs.",
    example: "A company actively participating in innovation ecosystems scores 5",
    evidenceRequired: "Ecosystem participation records and network memberships",
    maxScore: 5,
  },
]

export function PillarFiveForm() {
  const { state, updateIndicator, updateEvidence } = useApplication()
  
  const application = state.application
  if (!application) return null
  
  const pillarData = application.pillarData.pillar_5 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(5, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(5, indicatorId, evidenceData)
  }, [updateEvidence])

  // Calculate completion
  const completedIndicators = pillarFiveIndicators.filter(indicator => {
    const value = pillarData.indicators?.[indicator.id]?.value
    return value !== null && value !== undefined && value !== ""
  })

  const completionPercentage = (completedIndicators.length / pillarFiveIndicators.length) * 100

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pillar 5: Strategic Intelligence & Collaboration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assesses external intelligence gathering and collaboration capabilities.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : completionPercentage > 50 ? "secondary" : "outline"}>
                {completionPercentage === 100 ? "Complete" : completionPercentage > 50 ? "In Progress" : "Started"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {completedIndicators.length} of {pillarFiveIndicators.length} indicators completed
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
        {pillarFiveIndicators.map((indicator) => (
          <CleanIndicatorInput
            key={indicator.id}
            indicator={indicator}
            pillarId={5}
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
                Congratulations! You have completed all indicators for Pillar 5.
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
