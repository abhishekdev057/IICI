"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { IndicatorInput } from "../indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

const pillarThreeIndicators = [
  {
    id: "3.1.1",
    shortName: "Process Maturity",
    description: "The organization demonstrates adherence to a structured, multi-stage innovation process (e.g., identifying opportunities, creating concepts, validating concepts, developing solutions, deploying solutions).",
    howToCalculate: "Audit adherence to stages; score maturity level (1-5, per CMMI-like model).",
    measurementUnit: "Score (1-5)",
    remark: "Based on ISO 56002 guidelines.",
    example: "Fully adheres to 5-stage process, maturity level 4.",
    evidenceRequired: "Process maps (PDF/images), audit reports. For <3: Basic map. For >3: ISO compliance cert.",
    maxScore: 5,
  },
  {
    id: "3.1.2",
    shortName: "Role Clarity",
    description: "Innovation processes have clearly defined stages, roles, and responsibilities for all participants.",
    howToCalculate: "Review process docs for clarity; percentage of roles defined.",
    measurementUnit: "Percentage (%)",
    remark: "Use RACI matrices.",
    example: "100% of roles defined in process maps.",
    evidenceRequired: "RACI matrices (Excel/PDF). For <50%: Partial matrix. For >50%: Full with signatures.",
  },
  {
    id: "3.1.3",
    shortName: "Progress Tracking",
    description: "Mechanisms are in place to systematically track the progress and measure the success of innovation initiatives against defined metrics.",
    howToCalculate: "Number of tracked projects divided by total; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Metrics like ROI or time-to-market.",
    example: "95% of initiatives tracked with KPIs.",
    evidenceRequired: "Tracking dashboards (links/images), KPI reports (PDF). For <50%: List. For >50%: Data samples.",
  },
  {
    id: "3.1.4",
    shortName: "Output Efficiency",
    description: "The maturity of the innovation processes directly correlates with the organization's capacity to produce valuable and high-quality innovations efficiently.",
    howToCalculate: "Average time/cost per innovation output; or quality score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Correlate with maturity assessments.",
    example: "High-quality outputs in 6 months average, scoring 4.",
    evidenceRequired: "Output reports (PDF), cost/time data (Excel). For <3: Summaries. For >3: Detailed correlations.",
    maxScore: 5,
  },
  {
    id: "3.2.1",
    shortName: "Idea Capture",
    description: "A systematic process is used for the capture, documentation, and tracking of ideas from all levels of the organization and its ecosystem partners.",
    howToCalculate: "Number of ideas captured per quarter; efficiency rate.",
    measurementUnit: "Number",
    remark: "Process should be inclusive.",
    example: "200 ideas captured quarterly via portal.",
    evidenceRequired: "Idea logs (Excel), portal screenshots. For <100: Counts. For >100: Sample ideas.",
  },
  {
    id: "3.2.2",
    shortName: "Evaluation Criteria",
    description: "Clear, consistent, and strategically aligned criteria (e.g., feasibility, potential impact, resource requirements) are used to evaluate and select the most promising ideas.",
    howToCalculate: "Percentage of ideas evaluated using criteria.",
    measurementUnit: "Percentage (%)",
    remark: "Criteria documented in policy.",
    example: "100% evaluated on 5-point criteria.",
    evidenceRequired: "Evaluation criteria doc (PDF), evaluation records. For <50%: Criteria doc. For >50%: Scored examples.",
  },
  {
    id: "3.2.3",
    shortName: "Idea Pathway",
    description: "A defined pathway exists for the development and implementation of ideas that have been selected.",
    howToCalculate: "Binary check for pathway existence; 0-1.",
    measurementUnit: "Binary (0-1)",
    remark: "Pathway includes milestones.",
    example: "Clear pathway from selection to launch, scoring 1.",
    evidenceRequired: "Pathway diagram (PDF/image). For score 1: Include milestones.",
    maxScore: 1,
  },
  {
    id: "3.3.1",
    shortName: "Hypothesis Testing",
    description: "The organization emphasizes defining and testing key assumptions and hypotheses through structured experimentation, particularly for high-risk concepts.",
    howToCalculate: "Percentage of projects with tested hypotheses.",
    measurementUnit: "Percentage (%)",
    remark: "Use A/B testing or prototypes.",
    example: "85% of high-risk ideas tested.",
    evidenceRequired: "Test reports (PDF), prototype images. For <50%: List. For >50%: Detailed results.",
  },
  {
    id: "3.3.2",
    shortName: "Concept Adaptation",
    description: "A formal process exists to adapt and refine concepts based on the learnings and data gathered from experiments.",
    howToCalculate: "Number of adaptations per project; average.",
    measurementUnit: "Number",
    remark: "Process should be iterative.",
    example: "Average 3 adaptations per concept.",
    evidenceRequired: "Adaptation logs (Excel). For <2: Averages. For >2: Per-project examples.",
  },
  {
    id: "3.3.3",
    shortName: "Continuous Iteration",
    description: "Iteration is an embedded practice that continues throughout the development and deployment phases, allowing solutions to evolve.",
    howToCalculate: "Iteration cycles per project; count.",
    measurementUnit: "Number",
    remark: "Embedded in culture.",
    example: "5 iteration cycles per deployment.",
    evidenceRequired: "Project timelines (PDF). For <3: Counts. For >3: Detailed cycle descriptions.",
  },
  {
    id: "3.4.1",
    shortName: "Creative Encouragement",
    description: "The culture actively encourages and rewards creativity, calculated risk-taking, and cross-functional collaboration.",
    howToCalculate: "Employee survey on encouragement; score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Rewards like bonuses.",
    example: "Culture rated 4.3/5 for rewards.",
    evidenceRequired: "Survey results, reward policies (PDF). For <3: Averages. For >3: Reward examples.",
    maxScore: 5,
  },
  {
    id: "3.4.2",
    shortName: "Psychological Safety",
    description: "The organization fosters open communication, values diversity of thought, and provides 'safe spaces' for experimentation without fear of failure.",
    howToCalculate: "Survey on safety perception; percentage agreeing.",
    measurementUnit: "Percentage (%)",
    remark: "Key for retention.",
    example: "90% feel safe to experiment.",
    evidenceRequired: "Survey data (Excel). For <50%: Percentages. For >50%: Qualitative feedback.",
  },
  {
    id: "3.4.3",
    shortName: "Culture Assessment",
    description: "The health of the innovation culture is periodically assessed through formal and informal means (e.g., employee surveys, interviews, feedback sessions).",
    howToCalculate: "Frequency of assessments; score 0-3 (e.g., quarterly=3).",
    measurementUnit: "Score (0-3)",
    remark: "Annual minimum.",
    example: "Quarterly surveys, scoring 3.",
    evidenceRequired: "Assessment schedules and results (PDF). For 0-1: Schedule. For 2-3: Multiple samples.",
    maxScore: 3,
  },
  {
    id: "3.4.4",
    shortName: "Process-Culture Synergy",
    description: "There is a demonstrated synergistic relationship where the supportive culture enables structured processes, and the processes reinforce the culture by valuing contributions.",
    howToCalculate: "Correlation analysis from surveys; score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Qualitative linkage.",
    example: "Synergy rated 4/5 in audits.",
    evidenceRequired: "Audit reports, survey correlations (PDF/Excel). For <3: Qualitative description. For >3: Data analysis.",
    maxScore: 5,
  },
  {
    id: "3.5.1",
    shortName: "Strategy Communication",
    description: "The organization's innovation strategy is communicated clearly and consistently to all employees and relevant stakeholders.",
    howToCalculate: "Communication coverage; percentage reached.",
    measurementUnit: "Percentage (%)",
    remark: "Multi-channel approach.",
    example: "95% reached via emails and meetings.",
    evidenceRequired: "Communication logs (files/links). For <50%: Coverage stats. For >50%: Reach metrics.",
  },
  {
    id: "3.5.2",
    shortName: "Employee Alignment",
    description: "Employees demonstrate awareness of the innovation strategy, enabling them to focus their efforts on identifying opportunities and contributing ideas that directly support strategic goals.",
    howToCalculate: "Quiz or survey on awareness; percentage correct.",
    measurementUnit: "Percentage (%)",
    remark: "Alignment boosts productivity.",
    example: "88% aware and aligned.",
    evidenceRequired: "Quiz/survey results (PDF). For <50%: Percentages. For >50%: Sample questions/responses.",
  },
]

interface PillarThreeFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarThreeForm({ onDataChange, onScoreChange, initialData }: PillarThreeFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Sync local evidence when context-provided initialData.evidence changes
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarThreeIndicators.length

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

    pillarThreeIndicators.forEach(indicator => {
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
          // Convert numbers to percentage based on reasonable benchmarks
          if (indicator.id === '3.2.1') { // Idea Capture
            totalScore += Math.min((value / 200) * 100, 100) // 200 ideas = 100%
          } else if (indicator.id === '3.3.2' || indicator.id === '3.3.3') { // Adaptations/Iterations
            totalScore += Math.min((value / 5) * 100, 100) // 5 cycles = 100%
          }
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
              Pillar 3: Innovation Processes & Culture
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
            This pillar evaluates your organization's structured innovation processes and the cultural environment that
            supports creative thinking and systematic innovation. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarThreeIndicators.map((indicator) => (
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
