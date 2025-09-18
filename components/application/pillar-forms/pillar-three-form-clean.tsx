"use client"

import { useState, useCallback } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

const pillarThreeIndicators = [
  {
    id: "3.1.1",
    shortName: "Process Maturity",
    description: "Assessment of innovation process maturity level.",
    howToCalculate: "Rate overall process maturity from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider process documentation, standardization, and optimization.",
    example: "A company with well-documented, standardized innovation processes scores 5",
    evidenceRequired: "Process documentation and maturity assessments",
    maxScore: 5,
  },
  {
    id: "3.1.2",
    shortName: "Process Integration",
    description: "Integration of innovation processes with business operations.",
    howToCalculate: "Rate process integration level from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider how well innovation processes are integrated with daily operations.",
    example: "A company with fully integrated innovation processes scores 5",
    evidenceRequired: "Integration documentation and workflow diagrams",
    maxScore: 5,
  },
  {
    id: "3.1.3",
    shortName: "Process Efficiency",
    description: "Efficiency and effectiveness of innovation processes.",
    howToCalculate: "Rate process efficiency from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider time-to-market, resource utilization, and outcomes.",
    example: "A company with highly efficient innovation processes scores 5",
    evidenceRequired: "Efficiency metrics and process performance data",
    maxScore: 5,
  },
  {
    id: "3.1.4",
    shortName: "Process Innovation",
    description: "Continuous improvement and innovation of processes themselves.",
    howToCalculate: "Rate process innovation capability from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider how the organization innovates its own processes.",
    example: "A company that continuously innovates its processes scores 5",
    evidenceRequired: "Process improvement records and innovation initiatives",
    maxScore: 5,
  },
  {
    id: "3.2.1",
    shortName: "Ideas Generated",
    description: "Number of innovation ideas generated per year.",
    howToCalculate: "Count total innovation ideas generated annually",
    measurementUnit: "Number",
    remark: "Include all formal and informal idea generation activities.",
    example: "A company generating 200 innovation ideas per year",
    evidenceRequired: "Idea generation logs and innovation databases",
    maxScore: 200,
  },
  {
    id: "3.2.2",
    shortName: "Idea Evaluation",
    description: "Quality of idea evaluation and selection processes.",
    howToCalculate: "Rate idea evaluation process quality from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider evaluation criteria, methodology, and decision-making.",
    example: "A company with systematic, data-driven idea evaluation scores 5",
    evidenceRequired: "Evaluation criteria and decision-making processes",
    maxScore: 5,
  },
  {
    id: "3.2.3",
    shortName: "Idea Implementation",
    description: "Success rate of idea implementation.",
    howToCalculate: "Binary: 1 if systematic implementation process exists, 0 otherwise",
    measurementUnit: "Binary (0-1)",
    remark: "Consider systematic approach to implementing selected ideas.",
    example: "A company with systematic idea implementation process scores 1",
    evidenceRequired: "Implementation processes and success metrics",
    maxScore: 1,
  },
  {
    id: "3.3.1",
    shortName: "Experimentation Culture",
    description: "Organizational culture supporting experimentation.",
    howToCalculate: "Rate experimentation culture from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider tolerance for failure, learning orientation, and risk-taking.",
    example: "A company with strong experimentation culture scores 5",
    evidenceRequired: "Culture assessments and experimentation policies",
    maxScore: 5,
  },
  {
    id: "3.3.2",
    shortName: "Experiments Conducted",
    description: "Number of innovation experiments conducted per year.",
    howToCalculate: "Count total innovation experiments conducted annually",
    measurementUnit: "Number",
    remark: "Include all formal and informal experimentation activities.",
    example: "A company conducting 50 innovation experiments per year",
    evidenceRequired: "Experiment logs and innovation project records",
    maxScore: 50,
  },
  {
    id: "3.3.3",
    shortName: "Learning Integration",
    description: "Integration of experimental learning into business practices.",
    howToCalculate: "Count number of learning integration mechanisms",
    measurementUnit: "Number",
    remark: "Consider how experimental learnings are captured and applied.",
    example: "A company with 5 systematic learning integration mechanisms",
    evidenceRequired: "Learning integration processes and documentation",
    maxScore: 5,
  },
  {
    id: "3.4.1",
    shortName: "Innovation Culture",
    description: "Overall organizational culture supporting innovation.",
    howToCalculate: "Rate innovation culture strength from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider values, behaviors, and practices supporting innovation.",
    example: "A company with strong innovation culture scores 5",
    evidenceRequired: "Culture assessments and employee surveys",
    maxScore: 5,
  },
  {
    id: "3.4.2",
    shortName: "Collaboration",
    description: "Cross-functional collaboration for innovation.",
    howToCalculate: "Rate collaboration effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider inter-departmental collaboration and knowledge sharing.",
    example: "A company with excellent cross-functional collaboration scores 5",
    evidenceRequired: "Collaboration metrics and team performance data",
    maxScore: 5,
  },
  {
    id: "3.4.3",
    shortName: "Risk Tolerance",
    description: "Organizational tolerance for innovation-related risks.",
    howToCalculate: "Rate risk tolerance level from 0-3",
    measurementUnit: "Score (0-3)",
    remark: "Consider willingness to take calculated risks for innovation.",
    example: "A company with high risk tolerance for innovation scores 3",
    evidenceRequired: "Risk management policies and innovation risk assessments",
    maxScore: 3,
  },
  {
    id: "3.4.4",
    shortName: "Innovation Recognition",
    description: "Recognition and reward systems for innovation.",
    howToCalculate: "Rate recognition system effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider formal and informal recognition for innovation efforts.",
    example: "A company with comprehensive innovation recognition scores 5",
    evidenceRequired: "Recognition programs and reward systems",
    maxScore: 5,
  },
  {
    id: "3.5.1",
    shortName: "Strategy Communication",
    description: "Effectiveness of innovation strategy communication.",
    howToCalculate: "Rate communication effectiveness from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider clarity, frequency, and reach of strategy communication.",
    example: "A company with excellent strategy communication scores 5",
    evidenceRequired: "Communication plans and employee feedback",
    maxScore: 5,
  },
  {
    id: "3.5.2",
    shortName: "Strategy Understanding",
    description: "Employee understanding of innovation strategy.",
    howToCalculate: "Rate employee understanding level from 1-5",
    measurementUnit: "Score (1-5)",
    remark: "Consider how well employees understand and align with strategy.",
    example: "A company with high employee strategy understanding scores 5",
    evidenceRequired: "Employee surveys and understanding assessments",
    maxScore: 5,
  },
]

export function PillarThreeForm() {
  const { state, updateIndicator, updateEvidence } = useApplication()
  
  const application = state.application
  if (!application) return null
  
  const pillarData = application.pillarData.pillar_3 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(3, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(3, indicatorId, evidenceData)
  }, [updateEvidence])

  // Calculate completion
  const completedIndicators = pillarThreeIndicators.filter(indicator => {
    const value = pillarData.indicators?.[indicator.id]?.value
    return value !== null && value !== undefined && value !== ""
  })

  const completionPercentage = (completedIndicators.length / pillarThreeIndicators.length) * 100

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pillar 3: Innovation Processes & Culture
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assesses the organization's innovation processes and culture.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : completionPercentage > 50 ? "secondary" : "outline"}>
                {completionPercentage === 100 ? "Complete" : completionPercentage > 50 ? "In Progress" : "Started"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {completedIndicators.length} of {pillarThreeIndicators.length} indicators completed
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
        {pillarThreeIndicators.map((indicator) => (
          <CleanIndicatorInput
            key={indicator.id}
            indicator={indicator}
            pillarId={3}
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
                Congratulations! You have completed all indicators for Pillar 3.
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
