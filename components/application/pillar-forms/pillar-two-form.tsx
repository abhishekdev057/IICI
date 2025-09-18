"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useApplication } from "@/contexts/application-context"

const pillarTwoIndicators = [
  {
    id: "2.1.1",
    shortName: "Innovation Budget",
    description: "Measures the sufficiency of budget allocated for developing new products, services, or internal processes.",
    howToCalculate: "Divide innovation budget by total operating budget; multiply by 100 for percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Benchmark against industry averages (e.g., 5-10% for tech firms).",
    example: "$500k innovation budget out of $10M total, scoring 5%.",
    evidenceRequired: "Financial statements or budget plans (PDF/Excel). For <5%: Aggregate figures. For >5%: Audited breakdowns.",
  },
  {
    id: "2.1.2",
    shortName: "IP Investment",
    description: "Evaluates the allocation of financial resources dedicated to protecting and optimizing the value of intellectual property (e.g., patent filings, legal support).",
    howToCalculate: "Sum IP-related expenses; divide by total innovation budget for percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Includes legal fees and filings.",
    example: "$100k on IP from $500k innovation budget, scoring 20%.",
    evidenceRequired: "Expense breakdowns (Excel), invoices (files). For <10%: Summary. For >10%: Itemized invoices.",
  },
  {
    id: "2.1.3",
    shortName: "Funding Accessibility",
    description: "Assesses the clarity and accessibility of mechanisms for employees to request and secure funding for promising ideas.",
    howToCalculate: "Survey employees on ease of access; average Likert scale (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Mechanisms like online portals improve scores.",
    example: "Employees rate funding request process at 4.5/5 due to a simple app.",
    evidenceRequired: "Survey data (PDF), portal screenshots (images/links). For <3: Averages. For >3: Raw responses.",
    maxScore: 5,
  },
  {
    id: "2.2.1",
    shortName: "Personnel Allocation",
    description: "Measures the extent to which adequate personnel are assigned to support innovation efforts.",
    howToCalculate: "Number of full-time equivalent (FTE) staff on innovation divided by total staff; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Should reflect project needs.",
    example: "20 FTE out of 200 total staff, scoring 10%.",
    evidenceRequired: "HR reports or staffing charts (PDF/Excel). For <5%: List. For >5%: Detailed assignments.",
  },
  {
    id: "2.2.2",
    shortName: "Dedicated Innovation Time",
    description: "Evaluates the provision of dedicated time for employees to conduct experiments, test ideas, and engage in creative development.",
    howToCalculate: "Average hours per employee per month dedicated to innovation; divide by total work hours for percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Inspired by models like Google's 20% time.",
    example: "8 hours/month per employee out of 160, scoring 5%.",
    evidenceRequired: "Time tracking logs (Excel), policy docs (PDF). For <5%: Policy. For >5%: Tracked data.",
  },
  {
    id: "2.2.3",
    shortName: "Training Programs",
    description: "Assesses the availability and effectiveness of training programs designed to equip employees with skills for innovation.",
    howToCalculate: "Number of training hours per employee per year; or participation rate.",
    measurementUnit: "Hours per employee",
    remark: "Effectiveness via post-training surveys.",
    example: "40 hours of innovation training per employee annually.",
    evidenceRequired: "Training records (Excel), certificates (images). For <20 hours: Participation list. For >20 hours: Effectiveness surveys.",
  },
  {
    id: "2.2.4",
    shortName: "Competency Assessment",
    description: "Measures the existence of processes to continuously assess innovation-related competencies and identify skill gaps.",
    howToCalculate: "Frequency of assessments (e.g., annual); score 0-3 based on coverage.",
    measurementUnit: "Score (0-3)",
    remark: "Use tools like 360-degree feedback.",
    example: "Bi-annual assessments identifying gaps in AI skills, scoring 3.",
    evidenceRequired: "Assessment reports (PDF), tools used (links). For 0-1: Process description. For 2-3: Sample results.",
    maxScore: 3,
  },
  {
    id: "2.2.5",
    shortName: "Skill Gap Strategy",
    description: "Evaluates the organization's strategy for addressing identified competency gaps, whether through internal development or external collaboration.",
    howToCalculate: "Number of gaps addressed divided by total identified; percentage.",
    measurementUnit: "Percentage (%)",
    remark: "Strategy should be documented.",
    example: "80% of gaps filled via training partnerships.",
    evidenceRequired: "Gap analysis and action plans (PDF/Excel). For <50%: Plan. For >50%: Proof of closure (e.g., hires).",
  },
  {
    id: "2.3.1",
    shortName: "IMS Tools Adoption",
    description: "Assesses the investment in and adoption of correct software, methodologies, and processes to manage innovation (e.g., project management tools).",
    howToCalculate: "Adoption rate among teams; percentage of users.",
    measurementUnit: "Percentage (%)",
    remark: "Tools like Trello or Asana.",
    example: "90% of teams use dedicated IMS software.",
    evidenceRequired: "Usage reports (Excel), software licenses (files/links). For <50%: Adoption stats. For >50%: User logs.",
  },
  {
    id: "2.3.2",
    shortName: "Idea Tracking Effectiveness",
    description: "Measures the effectiveness of centralized repositories or platforms for capturing, tracking, and managing ideas.",
    howToCalculate: "Number of ideas captured annually; or user satisfaction score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Effectiveness via usage metrics.",
    example: "Platform captures 500 ideas/year, rated 4/5.",
    evidenceRequired: "Platform dashboards (images/links), metrics reports (PDF). For <3: Basic metrics. For >3: Satisfaction surveys.",
    maxScore: 5,
  },
  {
    id: "2.3.3",
    shortName: "Physical Infrastructure",
    description: "Evaluates the provision of physical spaces and equipment necessary to support experimentation and collaborative development.",
    howToCalculate: "Square footage or equipment value dedicated; percentage of total infrastructure.",
    measurementUnit: "Percentage (%)",
    remark: "Includes labs or co-working spaces.",
    example: "15% of office space as innovation labs.",
    evidenceRequired: "Floor plans (images/PDF), inventory lists (Excel). For <10%: Descriptions. For >10%: Photos/valuations.",
  },
  {
    id: "2.3.4",
    shortName: "Management Resource Support",
    description: "Assesses the active role of top management in ensuring all essential resources (time, knowledge, budget, IP support, infrastructure) are provided.",
    howToCalculate: "Survey on perceived support; average score (1-5).",
    measurementUnit: "Score (1-5)",
    remark: "Cross-referenced with allocation data.",
    example: "Management support rated 4.8/5 for resource provision.",
    evidenceRequired: "Survey results (PDF), allocation docs. For <3: Averages. For >3: Cross-referenced evidence.",
    maxScore: 5,
  },
]

interface PillarTwoFormProps {
  onDataChange: (data: any) => void
  onScoreChange: (score: number) => void
  initialData: any
}

export function PillarTwoForm({ onDataChange, onScoreChange, initialData }: PillarTwoFormProps) {
  const [formData, setFormData] = useState(initialData?.indicators || {})
  const [evidence, setEvidence] = useState(initialData?.evidence || {})

  // Sync local evidence when context-provided initialData.evidence changes
  useEffect(() => {
    setEvidence(initialData?.evidence || {})
  }, [initialData?.evidence])

  // Calculate completion and score - MEMOIZED
  const stats = useMemo(() => {
    const total = pillarTwoIndicators.length

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

    pillarTwoIndicators.forEach(indicator => {
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
        } else if (indicator.measurementUnit.includes('Hours per employee')) {
          // Convert hours to percentage (assuming 40 hours is 100%)
          totalScore += Math.min((value / 40) * 100, 100)
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
              Pillar 2: Resource Allocation & Infrastructure
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
            This pillar assesses how your organization allocates financial resources, personnel, and infrastructure to
            support innovation activities effectively. Complete all indicators with supporting evidence.
          </p>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="space-y-4">
        {pillarTwoIndicators.map((indicator) => (
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
