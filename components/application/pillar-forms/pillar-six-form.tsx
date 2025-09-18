"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarSixIndicators = [
  {
    id: "6.1.1",
    shortName: "Metric Implementation",
    description: "To what extent has the organization established and implemented specific metrics for evaluating innovation processes, outputs, and outcomes, as guided by ISO 56008?",
    howToCalculate: "Number of metrics implemented vs. recommended; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "ISO 56008 aligned.",
    example: "90% of recommended metrics in use.",
    evidenceRequired: "Metrics list (PDF), implementation evidence. For <50%: List. For >50%: Usage data.",
  },
  {
    id: "6.1.2",
    shortName: "Data-Driven Decisions",
    description: "How effectively is data from these metrics used to support and drive strategic and operational decision-making within the innovation function?",
    howToCalculate: "Percentage of decisions backed by data.",
    measurementUnit: "Percentage (%)",
    remark: "Audit decision logs.",
    example: "80% decisions data-driven.",
    evidenceRequired: "Decision logs (PDF). For <50%: %. For >50%: Backed examples.",
  },
  {
    id: "6.1.3",
    shortName: "Data Collection",
    description: "How robust and systematic are the methodologies for collecting and analyzing innovation data to ensure the accuracy and reliability of performance metrics?",
    howToCalculate: "Score methodology robustness (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Use automated tools.",
    example: "Systematic collection, scoring 4.",
    evidenceRequired: "Methodology docs (PDF), tool screenshots. For <3: Description. For >3: Reliability tests.",
    maxScore: 5,
  },
  {
    id: "6.2.1",
    shortName: "IMS Assessment",
    description: "How frequently and rigorously does the organization evaluate its overall Innovation Management System to assess its design, implementation, and effectiveness, using methodologies guided by ISO 56004?",
    howToCalculate: "Frequency score: annual=1, quarterly=3.",
    measurementUnit: "Score (0-3)",
    remark: "ISO 56004 guided.",
    example: "Quarterly evaluations, scoring 3.",
    evidenceRequired: "Evaluation reports (PDF). For 0-1: Schedule. For 2-3: Rigorous samples.",
    maxScore: 3,
  },
  {
    id: "6.2.2",
    shortName: "Formal Audits",
    description: "To what extent does the organization conduct formal internal or external audits of the IMS to identify non-conformities and ensure compliance with established standards and processes?",
    howToCalculate: "Number of audits per year.",
    measurementUnit: "Number",
    remark: "External for objectivity.",
    example: "2 audits annually.",
    evidenceRequired: "Audit reports (PDF). For <2: Counts. For ≥2: Full reports.",
  },
  {
    id: "6.2.3",
    shortName: "Maturity Assessment",
    description: "How systematically does the organization use formal criteria or tools to assess the maturity of its innovation management practices?",
    howToCalculate: "Maturity level (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Tools like maturity models.",
    example: "Assessed at level 4.",
    evidenceRequired: "Maturity assessment tools/results (PDF). For <3: Level. For >3: Tool outputs.",
    maxScore: 5,
  },
  {
    id: "6.3.1",
    shortName: "Feedback Loop",
    description: "How effectively are insights from performance measurement, evaluations, and audit findings channeled into a formal continuous improvement process for the IMS?",
    howToCalculate: "Percentage of insights actioned.",
    measurementUnit: "Percentage (%)",
    remark: "Closed-loop system.",
    example: "95% insights lead to improvements.",
    evidenceRequired: "Insight action logs (Excel). For <50%: %. For >50%: Action examples.",
  },
  {
    id: "6.3.2",
    shortName: "Corrective Actions",
    description: "How systematically does the organization implement and track corrective actions to address non-conformities or weaknesses identified during audits and assessments?",
    howToCalculate: "Completion rate of actions; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Tracked in systems.",
    example: "100% actions completed.",
    evidenceRequired: "Action tracking (PDF/Excel). For <50%: Rates. For >50%: Completion proof.",
  },
  {
    id: "6.3.3",
    shortName: "System Evolution",
    description: "To what degree is the IMS treated as a dynamic system, subject to regular reviews and updates to ensure its ongoing effectiveness and alignment with evolving strategic goals?",
    howToCalculate: "Number of updates per year.",
    measurementUnit: "Number",
    remark: "Dynamic = adaptive.",
    example: "4 updates annually.",
    evidenceRequired: "Update logs (PDF). For <2: Counts. For ≥2: Update details.",
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

  // Sync local evidence when context-provided initialData.evidence changes
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarSixIndicators.length

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

    pillarSixIndicators.forEach(indicator => {
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
          // For 6.2.2 (Formal Audits) and 6.3.3 (System Evolution), convert numbers to percentage
          if (indicator.id === '6.2.2') {
            totalScore += Math.min((value / 2) * 100, 100) // 2 audits = 100%
          } else if (indicator.id === '6.3.3') {
            totalScore += Math.min((value / 4) * 100, 100) // 4 updates = 100%
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
