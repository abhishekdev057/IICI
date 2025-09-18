"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarFourIndicators = [
  {
    id: "4.1.1",
    shortName: "IP Strategy Formalization",
    description: "To what extent has the organization documented a formal IP strategy that is explicitly and demonstrably aligned with its core business and innovation objectives?",
    howToCalculate: "Review alignment; score (1-5) based on documentation depth.",
    measurementUnit: "Score (1-5)",
    remark: "Based on ISO 56005.",
    example: "Fully aligned document, scoring 5.",
    evidenceRequired: "IP strategy doc (PDF). For <3: Basic outline. For >3: Aligned with business plans.",
    maxScore: 5,
  },
  {
    id: "4.1.2",
    shortName: "Proactive IP Value",
    description: "How effectively is IP management positioned and utilized as a proactive tool for strategic investment and value creation (e.g., building future revenue, creating competitive barriers), rather than a purely reactive legal or compliance function?",
    howToCalculate: "Number of proactive IP actions (e.g., filings) vs. reactive; ratio.",
    measurementUnit: "Ratio",
    remark: "Proactive > reactive ideal.",
    example: "70:30 proactive to reactive ratio.",
    evidenceRequired: "Action logs (Excel), filing records. For <50: Ratio calc. For >50: Action examples.",
  },
  {
    id: "4.1.3",
    shortName: "Environmental IP Integration",
    description: "How systematically does the IP strategy incorporate and adapt to analysis of the external market, technological landscape, and legal/political factors?",
    howToCalculate: "Percentage of strategy updated with external analysis.",
    measurementUnit: "Percentage (%)",
    remark: "Annual reviews.",
    example: "80% integrated with market scans.",
    evidenceRequired: "Update logs, market analyses (PDF). For <50%: Logs. For >50%: Integrated reports.",
  },
  {
    id: "4.2.1",
    shortName: "IP Identification",
    description: "How systematic and integrated are the processes for identifying and capturing potential intellectual assets that arise from innovation activities?",
    howToCalculate: "Percentage of innovations with IP captured.",
    measurementUnit: "Percentage (%)",
    remark: "Integrated into processes.",
    example: "90% of projects capture IP.",
    evidenceRequired: "Capture process docs, project records (PDF/Excel). For <50%: Process doc. For >50%: Captured examples.",
  },
  {
    id: "4.2.2",
    shortName: "IP Protection Process",
    description: "How robust and well-defined is the decision-making process for selecting and securing the most appropriate forms of IP protection (e.g., patents, trademarks, copyrights, trade secrets) for innovation outcomes?",
    howToCalculate: "Score process robustness (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Decision trees useful.",
    example: "Robust process with guidelines, scoring 4.",
    evidenceRequired: "Decision trees (PDF/images). For <3: Description. For >3: Applied examples.",
    maxScore: 5,
  },
  {
    id: "4.2.3",
    shortName: "IP Exploitation",
    description: "To what extent does the organization actively explore and execute strategies (e.g., licensing, partnerships, new ventures) to monetize its portfolio of intellectual assets?",
    howToCalculate: "Revenue from IP divided by total IP value; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Track monetization deals.",
    example: "25% of IP portfolio monetized via licensing.",
    evidenceRequired: "Revenue reports, deal contracts (PDF, redacted). For <20%: Summary. For >20%: Deal examples.",
  },
  {
    id: "4.3.1",
    shortName: "IP Risk Assessment",
    description: "How systematically does the organization identify and assess IP-related risks, including potential infringement (by or against the organization), counterfeiting, and disputes?",
    howToCalculate: "Frequency of risk assessments; score 0-3.",
    measurementUnit: "Score (0-3)",
    remark: "Use risk matrices.",
    example: "Quarterly assessments, scoring 3.",
    evidenceRequired: "Risk matrices (Excel), assessment reports. For 0-1: Schedule. For 2-3: Samples.",
    maxScore: 3,
  },
  {
    id: "4.3.2",
    shortName: "IP Risk Mitigation",
    description: "What formal strategies and processes are in place to actively manage and mitigate identified IP risks (e.g., freedom-to-operate analyses, competitive monitoring, enforcement policies)?",
    howToCalculate: "Percentage of risks with mitigation plans.",
    measurementUnit: "Percentage (%)",
    remark: "Enforcement key.",
    example: "95% risks mitigated.",
    evidenceRequired: "Mitigation plans (PDF). For <50%: Plans. For >50%: Execution proof.",
  },
  {
    id: "4.4.1",
    shortName: "Intelligence Management",
    description: "How effectively does the organization gather, analyze, and use strategic intelligence to inform and guide its innovation and IP decisions (as guided by ISO 56006)?",
    howToCalculate: "Usage rate in decisions; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "ISO 56006 aligned.",
    example: "85% decisions informed by intelligence.",
    evidenceRequired: "Decision logs, intelligence reports (PDF). For <50%: Rates. For >50%: Linked examples.",
  },
  {
    id: "4.4.2",
    shortName: "Knowledge Sharing",
    description: "How effective and accessible are the internal systems and cultural norms for sharing knowledge, resources, and ideas (as guided by ISO 56007) to fuel innovation?",
    howToCalculate: "Survey accessibility; score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Platforms like intranets.",
    example: "Sharing systems rated 4.2/5.",
    evidenceRequired: "Survey results, system screenshots (images/links). For <3: Scores. For >3: Usage metrics.",
    maxScore: 5,
  },
  {
    id: "4.4.3",
    shortName: "Knowledge-IP Integration",
    description: "How seamlessly are the knowledge management processes (e.g., idea flow, intelligence gathering) integrated with the IP management processes (e.g., IP capture, protection) to ensure valuable knowledge is converted into protected assets?",
    howToCalculate: "Integration audit score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Seamless = automated links.",
    example: "Fully integrated, scoring 5.",
    evidenceRequired: "Integration diagrams (PDF/images), audit reports. For <3: Description. For >3: Workflow examples.",
    maxScore: 5,
  },
]

interface PillarFourFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarFourForm({ onDataChange, onScoreChange, initialData }: PillarFourFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Sync local evidence when context-provided initialData.evidence changes
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarFourIndicators.length

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

    pillarFourIndicators.forEach(indicator => {
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
        } else if (indicator.measurementUnit === 'Ratio') {
          // For ratio indicators, convert to percentage (assuming higher ratio is better)
          // For 4.1.2, a 70:30 ratio would be 70% proactive
          if (typeof value === 'string' && value.includes(':')) {
            const [proactive, reactive] = value.split(':').map(Number)
            const total = proactive + reactive
            const percentage = (proactive / total) * 100
            totalScore += Math.min(percentage, 100)
          } else {
            totalScore += Math.min(value, 100)
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
              Pillar 4: Knowledge & IP Management
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
            This pillar assesses your organization's approach to managing intellectual property, knowledge sharing, and
            systematic value creation from innovation assets. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarFourIndicators.map((indicator) => (
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
