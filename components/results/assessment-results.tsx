"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useApplication } from "@/contexts/application-context"
import { CertificateViewer } from "./certificate-viewer"
import { DetailedAnalysis } from "./detailed-analysis"
import { RecommendationsPanel } from "./recommendations-panel"
import { ComparisonView } from "./comparison-view"
import { Award, TrendingUp, FileText, BarChart3, Download, Share2 } from "lucide-react"

export function AssessmentResults() {
  const { state } = useApplication()
  const [activeTab, setActiveTab] = useState("overview")

  const application = state.application
  const scores = application?.scores
  const institutionData = application?.institutionData

  if (!application || !scores) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No assessment results available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallScore = scores.overallScore
  const certificationLevel = scores.certificationLevel
  const pillarScores = scores.pillars.map((p: any) => p.averageScore)

  const getCertificationColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-500 text-white"
      case "Certified":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Assessment Results</CardTitle>
              <p className="text-muted-foreground mt-1">
                {institutionData?.name} • Completed{" "}
                {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "Recently"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{Math.round(overallScore)}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <Progress value={overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <Badge className={`${getCertificationColor(certificationLevel)} text-lg px-4 py-2`}>
                {certificationLevel}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Certification Level</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {pillarScores.filter((score: any) => score >= 70).length}/6
              </div>
              <p className="text-sm text-muted-foreground">Strong Pillars</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {pillarScores.filter((score: any) => score < 50).length}
              </div>
              <p className="text-sm text-muted-foreground">Areas for Improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certificate
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Benchmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pillar Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Pillar Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scores.pillars.map((pillar: any, index: any) => (
                  <div key={pillar.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pillar.name}</span>
                      <span className={`text-sm font-bold ${getScoreColor(pillar.averageScore)}`}>
                        {Math.round(pillar.averageScore)}%
                      </span>
                    </div>
                    <Progress value={pillar.averageScore} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Strongest Area</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          scores.pillars.reduce((max: any, pillar: any) =>
                            pillar.averageScore > max.averageScore ? pillar : max,
                          ).name
                        }{" "}
                        (
                        {Math.round(
                          scores.pillars.reduce((max: any, pillar: any) =>
                            pillar.averageScore > max.averageScore ? pillar : max,
                          ).averageScore,
                        )}
                        %)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Priority for Improvement</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          scores.pillars.reduce((min: any, pillar: any) =>
                            pillar.averageScore < min.averageScore ? pillar : min,
                          ).name
                        }{" "}
                        (
                        {Math.round(
                          scores.pillars.reduce((min: any, pillar: any) =>
                            pillar.averageScore < min.averageScore ? pillar : min,
                          ).averageScore,
                        )}
                        %)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Certification Status</p>
                      <p className="text-sm text-muted-foreground">
                        {certificationLevel === "Gold"
                          ? "Excellent performance across all areas"
                          : certificationLevel === "Certified"
                            ? "Good performance with room for growth"
                            : "Significant improvement needed for certification"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificate">
          <CertificateViewer
            institutionName={institutionData?.name || ""}
            certificationLevel={certificationLevel}
            overallScore={overallScore}
            issuedDate={application.submittedAt ? new Date(application.submittedAt) : new Date()}
            expiryDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <DetailedAnalysis scores={scores} />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsPanel recommendations={scores.recommendations} pillars={scores.pillars} />
        </TabsContent>

        <TabsContent value="comparison">
          <ComparisonView
            scores={scores}
            institutionSize={institutionData?.organizationSize || ""}
            industry={institutionData?.industry || ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
