"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

export const pillarOneIndicators = [
  {
    id: "1.1.1",
    shortName: "Formal Innovation Intent",
    description: "Assesses whether the organization has a formal, written statement defining its innovation intent, such as goals for creativity and novelty in operations.",
    howToCalculate: "Review organizational documents for the presence of a defined innovation intent. Score based on completeness: 0 (absent), 1 (partially defined), 2 (fully defined and documented).",
    measurementUnit: "Score (0-2)",
    remark: "This is a foundational qualitative indicator; evidence must be verifiable through audits.",
    example: "A tech company has a 5-page innovation charter in its strategic plan, outlining intent for AI-driven products, scoring 2.",
    evidenceRequired: "Upload strategy document or charter (PDF/file). For score 0-1: Basic excerpt. For score 2: Full document with date/signature.",
    maxScore: 2,
  },
  {
    id: "1.1.2", 
    shortName: "Strategy Alignment",
    description: "Evaluates if the innovation strategy directly supports broader business goals, such as market expansion or efficiency gains.",
    howToCalculate: "Cross-reference innovation strategy documents with business strategy; count alignment points (e.g., shared objectives). Score as percentage of aligned elements (e.g., 80% if 4/5 objectives match).",
    measurementUnit: "Percentage (%)",
    remark: "Requires document analysis; misalignment may indicate siloed planning.",
    example: "A manufacturing firm's innovation strategy for sustainable materials aligns with 90% of its green business objectives, scoring 90%.",
    evidenceRequired: "Business and innovation strategy docs (PDFs). For <50%: Summary. For >50%: Detailed cross-reference table or auditor-verified link.",
  },
  {
    id: "1.1.3",
    shortName: "Innovation Priorities", 
    description: "Checks for explicit listing of innovation focus areas, like product development or process improvements.",
    howToCalculate: "Analyze strategy documents for listed priorities; assign score based on clarity and detail: 0 (none), 1 (vague), 2 (detailed with examples).",
    measurementUnit: "Score (0-2)",
    remark: "Priorities should be prioritized and ranked for better assessment.",
    example: "A retail company outlines priorities like 'digital transformation' and 'new e-commerce models' in a dedicated section, scoring 2.",
    evidenceRequired: "Strategy document excerpt (PDF/image). For score 0-1: Basic list. For score 2: Ranked list with examples (file/link).",
    maxScore: 2,
  },
  {
    id: "1.1.4",
    shortName: "Intent Communication",
    description: "Assesses dissemination of innovation intent to employees, partners, and investors.",
    howToCalculate: "Survey stakeholders on awareness; calculate percentage who confirm receipt and understanding.",
    measurementUnit: "Percentage (%)",
    remark: "Use anonymous surveys to avoid bias; include evidence like emails or meetings.",
    example: "85% of employees and partners report receiving the innovation intent via town halls and newsletters, scoring 85%.",
    evidenceRequired: "Survey results (Excel/PDF), email logs or meeting minutes (files/links). For <70%: Aggregate data. For >70%: Raw anonymized responses.",
  },
  {
    id: "1.2.1",
    shortName: "IMS Champion",
    description: "Verifies if a senior executive (e.g., C-level) is officially designated as IMS champion.",
    howToCalculate: "Check organizational charts or appointment letters; binary score: 0 (no), 1 (yes).",
    measurementUnit: "Binary (0-1)",
    remark: "Role should include defined responsibilities for accountability.",
    example: "The CEO is named IMS champion in the annual report, scoring 1.",
    evidenceRequired: "Org chart or appointment letter (PDF/image). For score 1: Include role description.",
    maxScore: 1,
  },
  {
    id: "1.2.2",
    shortName: "Leadership Engagement",
    description: "Looks for proof of leadership involvement in innovation activities.",
    howToCalculate: "Count instances of engagement (e.g., meetings attended) over a year; score as number of evidences divided by expected (e.g., 8/10 = 80%).",
    measurementUnit: "Percentage (%)",
    remark: "Evidence includes minutes, emails, or project logs.",
    example: "Top management attended 9 out of 12 innovation reviews, scoring 75%.",
    evidenceRequired: "Meeting minutes, emails, or logs (files/links). For <50%: Summary list. For >50%: Full records with dates.",
  },
  {
    id: "1.2.3",
    shortName: "Budget Allocation",
    description: "Assesses if innovation funding is distributed department-wide.",
    howToCalculate: "Review budget allocations; calculate percentage of total budget dedicated to innovation across departments.",
    measurementUnit: "Percentage (%)",
    remark: "Should be proportional to departmental needs.",
    example: "5% of the overall budget is allocated to innovation, split across R&D (3%) and marketing (2%), scoring 5%.",
    evidenceRequired: "Budget reports or financial statements (PDF/Excel). For <5%: Aggregate figures. For >5%: Audited breakdowns.",
  },
  {
    id: "1.2.4",
    shortName: "Innovation Mindset Promotion",
    description: "Evaluates if leaders exemplify innovation through actions and communications.",
    howToCalculate: "Employee survey on perceived leadership promotion; average Likert scale responses (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Consistency over time is key; annual surveys recommended.",
    example: "Employees rate leadership's innovation promotion at 4.2/5 based on regular motivational speeches.",
    evidenceRequired: "Survey results (PDF/Excel), speech transcripts (files/links). For <3: Averages. For >3: Raw data.",
    maxScore: 5,
  },
  {
    id: "1.3.1",
    shortName: "Innovation Policy",
    description: "Checks for a written policy covering innovation and risks.",
    howToCalculate: "Audit policy document for completeness; score 0-3 based on sections covered (e.g., policy, risks, implementation).",
    measurementUnit: "Score (0-3)",
    remark: "Must include risk tolerance levels.",
    example: "A comprehensive 10-page policy document includes risk matrices, scoring 3.",
    evidenceRequired: "Full policy document (PDF). For 0-1: Excerpts. For 2-3: Signed/dated full version.",
    maxScore: 3,
  },
  {
    id: "1.3.2",
    shortName: "Policy Communication",
    description: "Assesses communication of the policy to internal and external parties.",
    howToCalculate: "Survey participants on awareness; percentage who confirm understanding.",
    measurementUnit: "Percentage (%)",
    remark: "Track via training sessions or acknowledgments.",
    example: "92% of ecosystem partners acknowledge receipt via signed forms, scoring 92%.",
    evidenceRequired: "Communication logs, acknowledgments (files/links). For <70%: Summary. For >70%: Individual confirmations.",
  },
  {
    id: "1.3.3",
    shortName: "IP Strategy Presence",
    description: "Verifies existence of a defined IP strategy.",
    howToCalculate: "Review for presence and detail; binary with bonus for depth: 0 (no), 1 (basic), 2 (detailed).",
    measurementUnit: "Score (0-2)",
    remark: "Should cover creation and protection.",
    example: "A standalone IP strategy document exists with guidelines, scoring 2.",
    evidenceRequired: "IP strategy document (PDF). For score 1: Basic outline. For score 2: Comprehensive with examples.",
    maxScore: 2,
  },
  {
    id: "1.3.4",
    shortName: "IP Alignment",
    description: "Evaluates alignment and comprehensiveness of IP guidelines.",
    howToCalculate: "Map IP strategy to business goals; percentage of alignment.",
    measurementUnit: "Percentage (%)",
    remark: "Guidelines should be actionable.",
    example: "IP strategy aligns with 95% of innovation goals, including exploitation via licensing.",
    evidenceRequired: "Alignment mapping (Excel/file), strategy docs. For <50%: Simple map. For >50%: Detailed with execution evidence.",
  },
  {
    id: "1.4.1",
    shortName: "Internal Feedback Process",
    description: "Assesses processes for internal feedback collection.",
    howToCalculate: "Check for tools like surveys or forums; score based on frequency and structure: 0-3.",
    measurementUnit: "Score (0-3)",
    remark: "Process should be documented.",
    example: "Quarterly employee surveys on strategy, scoring 3.",
    evidenceRequired: "Process description (PDF), survey tools (links/images). For 0-1: Description. For 2-3: Sample outputs.",
    maxScore: 3,
  },
  {
    id: "1.4.2",
    shortName: "External Intelligence Gathering",
    description: "Evaluates collection of external data. (specify data like market trends)",
    howToCalculate: "Count sources and analyses per year; percentage of coverage against key trends.",
    measurementUnit: "Percentage (%)",
    remark: "Use tools like market reports.",
    example: "Analyzes 80% of major trends via subscriptions, scoring 80%.",
    evidenceRequired: "Reports or analysis logs (files/links). For <50%: List of sources. For >50%: Full reports.",
  },
  {
    id: "1.4.3",
    shortName: "Strategy Adjustment Mechanism",
    description: "Checks for adjustment processes.",
    howToCalculate: "Review mechanism documentation; binary: 0 (no), 1 (yes).",
    measurementUnit: "Binary (0-1)",
    remark: "Should include review cycles.",
    example: "Annual strategy adjustment committee exists, scoring 1.",
    evidenceRequired: "Mechanism document (PDF). For score 1: Include meeting evidence.",
    maxScore: 1,
  },
  {
    id: "1.4.4",
    shortName: "Strategic Pivot Example",
    description: "Looks for evidence of adaptive changes.",
    howToCalculate: "Evaluate example for recency and impact; score 0 (none), 1 (one example), 2 (multiple with impact).",
    measurementUnit: "Score (0-2)",
    remark: "Example must be within the last year.",
    example: "Pivoted to remote tools post-pandemic feedback, scoring 2.",
    evidenceRequired: "Case study or report (PDF/file), before/after images. For score 1: Summary. For score 2: Detailed impact analysis.",
    maxScore: 2,
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

  // Sync local evidence when context-provided initialData.evidence changes (post-save optimistic/refresh)
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarOneIndicators.length

    // Helper: check persisted evidence for an indicator (from DB)
    const hasPersistedEvidence = (indicatorId: string) => {
      const ev = (evidence as any)?.[indicatorId]
      if (!ev) return false
      return !!(
        (ev.text?._persisted && ev.text.description && ev.text.description.trim() !== '') ||
        (ev.link?._persisted && ev.link.url && ev.link.url.trim() !== '') ||
        (ev.file?._persisted && ev.file.fileName)
      )
    }

    // Responses: count only indicators from this pillar with either a filled value or persisted evidence
    let responses = 0
    let totalScore = 0
    let scoredIndicators = 0

    pillarOneIndicators.forEach(indicator => {
      const value = (formData as any)[indicator.id]
      const hasValue = value !== undefined && value !== null && value !== ''
      const responded = hasValue || hasPersistedEvidence(indicator.id)
      if (responded) responses++

      if (hasValue) {
        scoredIndicators++
        if (indicator.measurementUnit.includes('Score')) {
          const maxScore = indicator.maxScore || 2
          totalScore += (value / maxScore) * 100
        } else if (indicator.measurementUnit.includes('Percentage')) {
          totalScore += Math.min(value, 100) // Cap percentage at 100%
        } else if (indicator.measurementUnit.includes('Binary')) {
          const maxScore = indicator.maxScore || 1
          totalScore += (value / maxScore) * 100
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
    console.log('Pillar form sending combined data:', combinedData);
    console.log('Evidence object being sent:', evidence);
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
    setEvidence((prev: any) => {
      const newEvidence = {
        ...prev,
        [indicatorId]: evidenceData
      }
      console.log('Updated evidence state:', newEvidence);
      return newEvidence;
    })
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
        {pillarOneIndicators.map((indicator) => {
          return (
            <IndicatorInput
              key={indicator.id}
              indicator={indicator}
              value={formData[indicator.id]}
              onChange={(value) => handleInputChange(indicator.id, value)}
              onEvidenceChange={(evidenceData) => handleEvidenceChange(indicator.id, evidenceData)}
              evidence={evidence[indicator.id]}
            />
          );
        })}
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