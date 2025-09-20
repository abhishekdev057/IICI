"use client"

import { useState, useCallback } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

export const pillarTwoIndicators = [
  {
    id: "2.1.1",
    shortName: "Innovation Budget",
    description: "Percentage of total budget allocated to innovation activities.",
    howToCalculate: "Calculate as (Innovation Budget / Total Budget) × 100",
    measurementUnit: "Percentage (%)",
    remark: "Include R&D, new product development, and process innovation budgets.",
    example: "A company with $10M total budget and $1M innovation budget scores 10%",
    evidenceRequired: "Budget documents showing innovation allocation",
    maxScore: 100,
  },
  {
    id: "2.1.2",
    shortName: "R&D Investment",
    description: "Percentage of revenue invested in research and development.",
    howToCalculate: "Calculate as (R&D Expenditure / Total Revenue) × 100",
    measurementUnit: "Percentage (%)",
    remark: "Include all R&D activities, personnel, and equipment costs.",
    example: "A company with $50M revenue and $5M R&D investment scores 10%",
    evidenceRequired: "Financial statements showing R&D expenditure",
    maxScore: 100,
  },
  {
    id: "2.1.3",
    shortName: "Innovation ROI",
    description: "Return on investment from innovation activities.",
    howToCalculate: "Rate the overall return on innovation investments from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider both financial returns and strategic value.",
    example: "A company with strong innovation returns and strategic value scores 5",
    evidenceRequired: "ROI analysis and innovation impact reports",
    maxScore: 5,
  },
  {
    id: "2.2.1",
    shortName: "Innovation Team Size",
    description: "Number of dedicated innovation team members.",
    howToCalculate: "Count full-time equivalent innovation team members",
    measurementUnit: "Number",
    remark: "Include dedicated innovation roles, not part-time assignments.",
    example: "A company with 15 dedicated innovation team members",
    evidenceRequired: "Organizational chart and role descriptions",
    maxScore: 200,
  },
  {
    id: "2.2.2",
    shortName: "Innovation Training",
    description: "Percentage of employees trained in innovation methodologies.",
    howToCalculate: "Calculate as (Trained Employees / Total Employees) × 100",
    measurementUnit: "Percentage (%)",
    remark: "Include formal innovation training programs and workshops.",
    example: "A company with 200 employees and 50 trained in innovation scores 25%",
    evidenceRequired: "Training records and completion certificates",
    maxScore: 100,
  },
  {
    id: "2.2.3",
    shortName: "Training Hours",
    description: "Average innovation training hours per employee per year.",
    howToCalculate: "Calculate total training hours divided by number of employees",
    measurementUnit: "Hours per employee",
    remark: "Include all innovation-related training and development activities.",
    example: "A company with 1000 total training hours and 100 employees scores 10 hours",
    evidenceRequired: "Training logs and employee development records",
    maxScore: 40,
  },
  {
    id: "2.2.4",
    shortName: "Innovation Skills",
    description: "Assessment of organization's innovation skill level.",
    howToCalculate: "Rate overall innovation capabilities from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Consider design thinking, creativity, and innovation methodologies.",
    example: "A company with advanced innovation skills and methodologies scores 3",
    evidenceRequired: "Skill assessments and capability evaluations",
    maxScore: 3,
  },
  {
    id: "2.2.5",
    shortName: "External Expertise",
    description: "Use of external innovation consultants and experts.",
    howToCalculate: "Rate engagement with external innovation expertise from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Include consultants, advisors, and external partnerships.",
    example: "A company with regular external innovation consulting scores 3",
    evidenceRequired: "Consultant contracts and partnership agreements",
    maxScore: 3,
  },
  {
    id: "2.3.1",
    shortName: "Innovation Labs",
    description: "Quality and availability of dedicated innovation spaces.",
    howToCalculate: "Rate innovation lab quality and accessibility from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider physical spaces, equipment, and collaborative tools.",
    example: "A company with state-of-the-art innovation labs scores 5",
    evidenceRequired: "Lab descriptions, photos, and usage statistics",
    maxScore: 5,
  },
  {
    id: "2.3.2",
    shortName: "Digital Tools",
    description: "Quality of digital innovation tools and platforms.",
    howToCalculate: "Rate digital innovation infrastructure from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Include idea management, collaboration, and prototyping tools.",
    example: "A company with comprehensive digital innovation suite scores 5",
    evidenceRequired: "Tool inventory and usage analytics",
    maxScore: 5,
  },
  {
    id: "2.3.3",
    shortName: "Prototyping Equipment",
    description: "Availability and quality of prototyping and testing equipment.",
    howToCalculate: "Rate prototyping capabilities from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Include 3D printers, testing equipment, and rapid prototyping tools.",
    example: "A company with advanced prototyping capabilities scores 5",
    evidenceRequired: "Equipment inventory and capability demonstrations",
    maxScore: 5,
  },
  {
    id: "2.3.4",
    shortName: "Innovation Infrastructure",
    description: "Overall innovation infrastructure and support systems.",
    howToCalculate: "Rate comprehensive innovation infrastructure from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider all physical and digital innovation support systems.",
    example: "A company with world-class innovation infrastructure scores 5",
    evidenceRequired: "Infrastructure documentation and capability assessments",
    maxScore: 5,
  },
]

export function PillarTwoForm() {
  const { state, updateIndicator, updateEvidence } = useApplication()
  
  const application = state.application
  if (!application) return null
  
  const pillarData = application.pillarData.pillar_2 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(2, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(2, indicatorId, evidenceData)
  }, [updateEvidence])

  // Calculate completion
  const completedIndicators = pillarTwoIndicators.filter(indicator => {
    const value = pillarData.indicators?.[indicator.id]?.value
    return value !== null && value !== undefined && value !== ""
  })

  const completionPercentage = (completedIndicators.length / pillarTwoIndicators.length) * 100

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pillar 2: Resource Allocation & Infrastructure
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Evaluates the organization's resource allocation and infrastructure for innovation.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : completionPercentage > 50 ? "secondary" : "outline"}>
                {completionPercentage === 100 ? "Complete" : completionPercentage > 50 ? "In Progress" : "Started"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {completedIndicators.length} of {pillarTwoIndicators.length} indicators completed
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
        {pillarTwoIndicators.map((indicator) => (
          <CleanIndicatorInput
            key={indicator.id}
            indicator={indicator}
            pillarId={2}
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
                Congratulations! You have completed all indicators for Pillar 2.
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
