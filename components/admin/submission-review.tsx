"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit3,
  Download,
  ArrowLeft,
  Save,
} from "lucide-react"

interface SubmissionReviewProps {
  submissionId: string
  onBack: () => void
}

export function SubmissionReview({ submissionId, onBack }: SubmissionReviewProps) {
  const [selectedPillar, setSelectedPillar] = useState(0)
  const [reviewComments, setReviewComments] = useState("")
  const [scoreOverrides, setScoreOverrides] = useState<{ [key: string]: number }>({})
  const [finalDecision, setFinalDecision] = useState<"approve" | "reject" | "request_evidence" | "">("")

  // Mock submission data
  const submission = {
    id: submissionId,
    organizationName: "TechInnovate Corp",
    industry: "Technology",
    organizationSize: "201-1000",
    submittedDate: "2024-12-01",
    status: "under_review",
    overallScore: 77.5,
    certificationLevel: "Certified",
    pillars: [
      {
        id: 1,
        name: "Strategic Foundation & Leadership",
        score: 80,
        indicators: [
          {
            id: "1.1.a",
            shortName: "Formal Innovation Intent",
            rawValue: 2,
            normalizedScore: 1.0,
            measurementUnit: "Score (0-2)",
            hasEvidence: true,
            evidenceFiles: ["innovation_charter.pdf"],
            evidenceLinks: [],
            reviewStatus: "verified",
            reviewComments: "Comprehensive innovation charter provided",
          },
          {
            id: "1.1.b",
            shortName: "Strategy Alignment",
            rawValue: 85,
            normalizedScore: 0.85,
            measurementUnit: "Percentage (%)",
            hasEvidence: true,
            evidenceFiles: [],
            evidenceLinks: ["https://company.com/strategy"],
            reviewStatus: "pending",
            reviewComments: "",
          },
        ],
      },
    ],
  }

  const getReviewStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-secondary" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "flagged":
        return <AlertTriangle className="w-4 h-4 text-accent" />
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const handleScoreOverride = (indicatorId: string, newScore: number) => {
    setScoreOverrides({ ...scoreOverrides, [indicatorId]: newScore })
  }

  const handleSubmitReview = () => {
    // Submit review with comments, score overrides, and final decision
    console.log({
      submissionId,
      reviewComments,
      scoreOverrides,
      finalDecision,
    })
  }

  const IndicatorReview = ({ indicator }: { indicator: any }) => {
    const [indicatorComments, setIndicatorComments] = useState(indicator.reviewComments || "")
    const [reviewStatus, setReviewStatus] = useState(indicator.reviewStatus || "pending")

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{indicator.shortName}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">
                {indicator.measurementUnit}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {getReviewStatusIcon(reviewStatus)}
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Score Information */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-xs">Raw Value</Label>
                <div className="font-medium">{indicator.rawValue || "N/A"}</div>
              </div>
              <div>
                <Label className="text-xs">Normalized Score</Label>
                <div className="font-medium">{Math.round(indicator.normalizedScore * 100)}%</div>
              </div>
              <div>
                <Label className="text-xs">Score Override</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Override %"
                  value={scoreOverrides[indicator.id] || ""}
                  onChange={(e) => handleScoreOverride(indicator.id, Number.parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>

            {/* Evidence Review */}
            {indicator.hasEvidence && (
              <div className="border-l-4 border-l-primary pl-4">
                <h4 className="font-medium text-sm mb-2">Evidence Review</h4>

                {indicator.evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Files:</Label>
                    {indicator.evidenceFiles.map((file: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {indicator.evidenceLinks.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <Label className="text-xs">Links:</Label>
                    {indicator.evidenceLinks.map((link: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                            {link}
                          </a>
                        </div>
                        <Button size="sm" variant="outline">
                          Verify
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Review Comments */}
            <div>
              <Label className="text-sm">Review Comments</Label>
              <Textarea
                placeholder="Add your review comments for this indicator..."
                value={indicatorComments}
                onChange={(e) => setIndicatorComments(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{submission.organizationName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{submission.industry}</Badge>
              <Badge variant="outline">{submission.organizationSize}</Badge>
              <Badge className="bg-primary">Under Review</Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{submission.overallScore.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Current Score</div>
        </div>
      </div>

      {/* Review Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Review Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Indicators Reviewed</span>
              <span className="text-sm font-medium">1/2 (50%)</span>
            </div>
            <Progress value={50} />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-secondary">1</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">1</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">0</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">0</div>
                <div className="text-xs text-muted-foreground">Flagged</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillar Review */}
      <Tabs value={selectedPillar.toString()} onValueChange={(value) => setSelectedPillar(Number.parseInt(value))}>
        <TabsList className="grid w-full grid-cols-6">
          {submission.pillars.map((pillar, index) => (
            <TabsTrigger key={pillar.id} value={index.toString()} className="text-xs">
              Pillar {pillar.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {submission.pillars.map((pillar, index) => (
          <TabsContent key={pillar.id} value={index.toString()}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Pillar {pillar.id}: {pillar.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary">{pillar.score}%</Badge>
                  <span className="text-sm text-muted-foreground">{pillar.indicators.length} indicators</span>
                </div>
              </CardHeader>
              <CardContent>
                {pillar.indicators.map((indicator) => (
                  <IndicatorReview key={indicator.id} indicator={indicator} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Final Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Final Review & Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Overall Review Comments</Label>
              <Textarea
                placeholder="Provide overall assessment comments..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Final Decision</Label>
              <Select value={finalDecision} onValueChange={(value: any) => setFinalDecision(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select final decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Certification</SelectItem>
                  <SelectItem value="reject">Reject Application</SelectItem>
                  <SelectItem value="request_evidence">Request Additional Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Save Draft</Button>
              <Button onClick={handleSubmitReview} disabled={!finalDecision}>
                <Save className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
