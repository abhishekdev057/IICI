"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarFiveIndicators = [
  {
    id: "5.1.1",
    shortName: "Intelligence Gathering",
    description: "To what extent does the organization systematically collect relevant data and information from diverse external sources (e.g., market trends, competitor analysis, technological developments)?",
    howToCalculate: "Number of sources used; score (1-5) based on diversity.",
    measurementUnit: "Score (1-5)",
    remark: "Diverse sources reduce bias.",
    example: "Uses 10+ sources, scoring 5.",
    evidenceRequired: "Source lists (Excel), sample data (files). For <3: List. For >3: Diverse samples.",
    maxScore: 5,
  },
  {
    id: "5.1.2",
    shortName: "Analysis Synthesis",
    description: "How rigorous and effective are the processes for analyzing and synthesizing raw information to generate meaningful and actionable insights that can inform innovation strategy?",
    howToCalculate: "Percentage of data leading to insights.",
    measurementUnit: "Percentage (%)",
    remark: "Use analytics tools.",
    example: "70% data synthesized into actions.",
    evidenceRequired: "Analysis reports (PDF). For <50%: Percentages. For >50%: Insight examples.",
  },
  {
    id: "5.1.3",
    shortName: "Informed Decisions",
    description: "How effectively is strategic intelligence integrated into decision-making processes to ensure strategic choices are aligned with innovation goals and informed by external realities?",
    howToCalculate: "Percentage of decisions using intelligence.",
    measurementUnit: "Percentage (%)",
    remark: "Track in minutes.",
    example: "90% decisions informed.",
    evidenceRequired: "Decision minutes (PDF). For <50%: Stats. For >50%: Linked minutes.",
  },
  {
    id: "5.1.4",
    shortName: "Proactive Foresight",
    description: "To what degree does the strategic intelligence function enable the organization to anticipate market shifts, identify nascent opportunities, and foresee potential threats proactively?",
    howToCalculate: "Number of foreseen events acted upon.",
    measurementUnit: "Number",
    remark: "Predictive analytics.",
    example: "Foreseen 5 market shifts.",
    evidenceRequired: "Foresight reports (PDF). For <3: Counts. For >3: Action examples.",
  },
  {
    id: "5.1.5",
    shortName: "Monitoring Adaptation",
    description: "How agile is the organization in continuously monitoring the external environment and adapting its innovation strategies in response to new intelligence?",
    howToCalculate: "Adaptation frequency; score 0-3 (monthly=3).",
    measurementUnit: "Score (0-3)",
    remark: "Agility key in volatile markets.",
    example: "Monthly adaptations, scoring 3.",
    evidenceRequired: "Adaptation logs (Excel). For 0-1: Frequency. For 2-3: Examples.",
    maxScore: 3,
  },
  {
    id: "5.2.1",
    shortName: "Competency Analysis",
    description: "How systematically does the organization assess its internal competencies, identify gaps, and determine where external collaboration is a necessary or advantageous strategy?",
    howToCalculate: "Percentage of competencies assessed annually.",
    measurementUnit: "Percentage (%)",
    remark: "Leads to partnerships.",
    example: "100% assessed, identifying 3 gaps.",
    evidenceRequired: "Assessment reports (PDF). For <50%: %. For >50%: Gap details.",
  },
  {
    id: "5.2.2",
    shortName: "Partner Selection",
    description: "How well-defined and strategic is the process for identifying, evaluating, and selecting external partners who align with the organization's innovation needs and collaborative goals?",
    howToCalculate: "Score process definition (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "ISO 56003 guided.",
    example: "Defined process with criteria, scoring 4.",
    evidenceRequired: "Partner selection process doc (PDF). For <3: Description. For >3: Criteria examples.",
    maxScore: 5,
  },
  {
    id: "5.2.3",
    shortName: "Partnership Management",
    description: "How effectively does the organization utilize best practices (as guided by ISO 56003) for managing innovation partnerships, including defining collaboration models, governance, and processes for joint value creation?",
    howToCalculate: "Success rate of partnerships; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Governance includes contracts.",
    example: "85% successful partnerships.",
    evidenceRequired: "Partnership contracts (redacted PDF), success metrics. For <50%: Rates. For >50%: Case studies.",
  },
  {
    id: "5.2.4",
    shortName: "Partnership Value",
    description: "To what extent do external collaborations demonstrably contribute to the organization's innovation capacity by accessing diverse knowledge, accelerating development, de-risking projects, or creating mutual value?",
    howToCalculate: "Value added (e.g., revenue) from partnerships; percentage increase.",
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

  // Sync local evidence when context-provided initialData.evidence changes
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarFiveIndicators.length

    const hasPersistedEvidence = (indicatorId: string) => {
      const ev = (evidence as any)?.[indicatorId]
      if (!ev) return false
      return !!(
        (ev.text?._persisted && ev.text.description && ev.text.description.trim() !== '') ||
        (ev.link?._persisted && ev.link.url && ev.link.url.trim() !== '') ||
        (ev.file?._persisted && ev.file.fileName)
      )
    }

    let responses = 0
    let totalScore = 0
    let scoredIndicators = 0

    pillarFiveIndicators.forEach(indicator => {
      const value = (formData as any)[indicator.id]
      const hasValue = value !== undefined && value !== null && value !== ''
      const responded = hasValue || hasPersistedEvidence(indicator.id)
      if (responded) responses++

      if (hasValue) {
        scoredIndicators++
        if (indicator.measurementUnit.includes('Score')) {
          const maxScore = indicator.maxScore || 5
          totalScore += (value / maxScore) * 100
        } else if (indicator.measurementUnit.includes('Percentage')) {
          totalScore += Math.min(value, 100)
        } else if (indicator.measurementUnit === 'Number') {
          // For 5.1.4 (Proactive Foresight), convert number of foreseen events to percentage
          if (indicator.id === '5.1.4') {
            totalScore += Math.min((value / 5) * 100, 100) // 5 events = 100%
          }
        }
      }
    })

    responses = Math.min(responses, total)
    const averageScore = scoredIndicators > 0 ? Math.min(totalScore / scoredIndicators, 100) : 0
    const completion = Math.min((responses / total) * 100, 100)

    return {
      responses,
      evidenceCount: Object.keys(evidence || {}).length,
      total,
      averageScore,
      completion
    }
  }, [formData, evidence])

  // Update parent when data changes - FIXED TO PREVENT INFINITE LOOPS
  useEffect(() => {
    const combinedData = {
      indicators: formData,
      evidence: evidence,
      stats: stats
    }
    onDataChange(combinedData)
    onScoreChange(stats.averageScore)
  }, [stats.averageScore, stats.completion]) // FIXED: Only depend on numeric values, not objects

  // Handle input changes
  const handleInputChange = useCallback((indicatorId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [indicatorId]: value
    }))
  }, [])

  // Handle evidence changes - FIXED TO PREVENT RENDER CONFLICTS
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
