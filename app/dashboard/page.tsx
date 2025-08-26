"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, Award, AlertCircle } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { PillarDetails } from "@/components/dashboard/pillar-details"
import { ExportReports } from "@/components/dashboard/export-reports"
import { HistoricalTracking } from "@/components/dashboard/historical-tracking"

// Helper functions for indicator data
const getIndicatorShortName = (indicatorId: string): string => {
  const definitions = {
    "1.1.a": "Formal Innovation Intent",
    "1.1.b": "Strategy Alignment",
    "1.1.c": "Innovation Priorities",
    "1.1.d": "Intent Communication",
    "2.1.1": "Innovation Budget",
    "2.1.2": "IP Investment",
    "2.2.1": "Personnel Allocation",
    "2.2.2": "Dedicated Innovation Time",
    "3.1.1": "Innovation Processes",
    "3.2.1": "Idea Capture",
    "3.4.1": "Creative Encouragement",
    "3.4.2": "Psychological Safety",
    "4.1.1": "IP Strategy",
    "4.2.1": "IP Identification",
    "4.2.3": "IP Exploitation",
    "4.4.2": "Knowledge Sharing",
    "5.1.1": "Intelligence Sources",
    "5.1.3": "Informed Decisions",
    "5.2.2": "Partner Selection",
    "5.2.4": "Partnership Value",
    "6.1.1": "Performance Metrics",
    "6.1.2": "Data-Driven Decisions",
    "6.2.1": "IMS Assessment",
    "6.3.1": "Feedback Loop"
  }
  return definitions[indicatorId as keyof typeof definitions] || indicatorId
}

const getIndicatorDescription = (indicatorId: string): string => {
  const definitions = {
    "1.1.a": "Assesses whether the organization has a formal, written statement defining its innovation intent",
    "1.1.b": "Evaluates if the innovation strategy directly supports broader business goals",
    "1.1.c": "Checks for explicit listing of innovation focus areas",
    "1.1.d": "Assesses dissemination of innovation intent to employees, partners, and investors",
    "2.1.1": "Measures the sufficiency of budget allocated for developing new products, services, or internal processes",
    "2.1.2": "Evaluates the allocation of financial resources dedicated to protecting and optimizing the value of intellectual property",
    "2.2.1": "Measures the extent to which adequate personnel are assigned to support innovation efforts",
    "2.2.2": "Evaluates the provision of dedicated time for employees to conduct experiments, test ideas, and engage in creative development",
    "3.1.1": "Assesses the systematic approach to managing innovation activities",
    "3.2.1": "A systematic process is used for the capture, documentation, and tracking of ideas",
    "3.4.1": "The culture actively encourages and rewards creativity, calculated risk-taking, and cross-functional collaboration",
    "3.4.2": "The organization fosters open communication, values diversity of thought, and provides safe spaces for experimentation",
    "4.1.1": "Assesses the alignment of intellectual property strategy with overall business and innovation objectives",
    "4.2.1": "How systematic and integrated are the processes for identifying and capturing potential intellectual assets",
    "4.2.3": "To what extent does the organization actively explore and execute strategies to monetize its portfolio of intellectual assets",
    "4.4.2": "How effective and accessible are the internal systems and cultural norms for sharing knowledge, resources, and ideas",
    "5.1.1": "How diverse and comprehensive are the sources of strategic intelligence used to inform innovation decisions",
    "5.1.3": "How effectively is strategic intelligence integrated into decision-making processes",
    "5.2.2": "How well-defined and strategic is the process for identifying, evaluating, and selecting external partners",
    "5.2.4": "To what extent do external collaborations demonstrably contribute to the organization's innovation capacity",
    "6.1.1": "To what extent has the organization established and implemented specific metrics for evaluating innovation processes",
    "6.1.2": "How effectively is data from these metrics used to support and drive strategic and operational decision-making",
    "6.2.1": "How frequently and rigorously does the organization evaluate its overall Innovation Management System",
    "6.3.1": "How effectively are insights from performance measurement, evaluations, and audit findings channeled into a formal continuous improvement process"
  }
  return definitions[indicatorId as keyof typeof definitions] || "Assessment indicator"
}

const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    "1.1.a": "Score (0-2)",
    "1.1.c": "Score (0-2)",
    "3.1.1": "Score (1-5)",
    "3.4.1": "Score (1-5)",
    "4.1.1": "Score (1-5)",
    "4.4.2": "Score (1-5)",
    "5.1.1": "Score (1-5)",
    "5.2.2": "Score (1-5)",
    "6.2.1": "Score (0-3)",
    "3.2.1": "Number"
  }
  return definitions[indicatorId as keyof typeof definitions] || "Percentage (%)"
}

const getNormalizedScore = (indicatorId: string, value: any): number => {
  if (!value || value === "") return 0
  
  const measurementUnit = getIndicatorMeasurementUnit(indicatorId)
  
  if (measurementUnit.includes("Score")) {
    const maxScore = measurementUnit.includes("(0-3)") ? 3 : 
                    measurementUnit.includes("(0-2)") ? 2 : 5
    return Math.min((value / maxScore) * 100, 100) // Cap at 100%
  } else if (measurementUnit.includes("Percentage")) {
    return Math.min(value, 100) // Cap at 100%
  } else if (measurementUnit === "Number") {
    return Math.min((value / 200) * 100, 100)
  }
  
  return 0
}

export default function DashboardPage() {
  const { state, calculateScores } = useData()

  const application = state.currentApplication
  const institutionData = application?.institutionData
  const scores = application?.scores
  const isLoading = state.isLoading

  useEffect(() => {
    if (application && !scores && application.pillarData) {
      calculateScores()
    }
  }, [application, scores, calculateScores])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dashboard" title="IIICI Dashboard" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                No Assessment Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven't started an IIICI certification assessment yet.
              </p>
              <a
                href="/application"
                className="btn-primary inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              >
                Start Assessment
              </a>
            </CardContent>
          </Card>
        </div>
        <Footer variant="minimal" />
      </div>
    )
  }

  // Check if application is in a state that allows dashboard access
  const canViewDashboard = application.status === "submitted" || application.status === "under_review" || application.status === "certified" || application.status === "approved"
  
  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation variant="dashboard" title="IIICI Dashboard" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Assessment Not Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your assessment is still in draft. Please complete and submit it to view your dashboard.
              </p>
              <a
                href="/application"
                className="btn-primary inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              >
                Continue Assessment
              </a>
            </CardContent>
          </Card>
        </div>
        <Footer variant="minimal" />
      </div>
    )
  }

  // Get pillar scores from database or calculate from pillar data
  const pillarScores = scores?.pillarScores || application?.pillarData ? 
    Array.from({ length: 6 }, (_, i) => {
      const pillarKey = `pillar_${i + 1}`
      const pillar = application?.pillarData?.[pillarKey]
      const score = pillar?.stats?.averageScore || 0
      return score
    }) : [0, 0, 0, 0, 0, 0]

  const overallScore = scores?.overallScore ?? 0
  
  // Calculate certification level based on overall score
        let certificationLevel = "NOT_CERTIFIED"
      if (overallScore >= 80) {
        certificationLevel = "GOLD"
      } else if (overallScore >= 60) {
        certificationLevel = "CERTIFIED"
      }

      // Convert to display format for UI
      const getDisplayCertificationLevel = (level: string) => {
        switch (level) {
          case "GOLD": return "Gold"
          case "CERTIFIED": return "Certified"
          case "NOT_CERTIFIED": 
          default: return "Not Certified"
        }
      }

  // Build comprehensive dashboard data from database
  const dashboardData = {
    overallScore,
    certificationLevel: getDisplayCertificationLevel(certificationLevel),
    pillars: Array.from({ length: 6 }, (_, i) => {
      const pillarId = i + 1
      const pillarKey = `pillar_${pillarId}`
      const pillar = application?.pillarData?.[pillarKey]
      
      const pillarNames = {
        1: "Strategic Foundation & Leadership",
        2: "Resource Allocation & Infrastructure",
        3: "Innovation Processes & Culture",
        4: "Knowledge & IP Management",
        5: "Strategic Intelligence & Collaboration",
        6: "Performance Measurement & Improvement"
      }

      return {
        id: pillarId,
        name: pillarNames[pillarId as keyof typeof pillarNames],
        score: pillar?.stats?.averageScore || 0,
        indicators: pillar?.indicators ? 
          Object.entries(pillar.indicators).map(([indicatorId, rawValue]) => {
            const evidence = pillar?.evidence?.[indicatorId] || {}
            return {
              id: indicatorId,
              shortName: getIndicatorShortName(indicatorId),
              description: getIndicatorDescription(indicatorId),
              rawValue: rawValue,
              normalizedScore: getNormalizedScore(indicatorId, rawValue as any),
              measurementUnit: getIndicatorMeasurementUnit(indicatorId),
              hasEvidence: !!(evidence.files && evidence.files.length > 0) || !!(evidence.links && evidence.links.length > 0),
              evidenceFiles: evidence.files || [],
              evidenceLinks: evidence.links || [],
              evidenceDescription: evidence.description || "",
            }
          }) : []
      }
    }),
    recommendations: scores?.recommendations || [],
    organizationName: institutionData?.name || "Your Organization",
    issuedDate: application.submittedAt
      ? new Date(application.submittedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    expiryDate: application.submittedAt
      ? new Date(new Date(application.submittedAt).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }

  const historicalData = [
    {
      year: new Date().getFullYear(),
      overallScore: overallScore,
      certificationLevel: getDisplayCertificationLevel(certificationLevel),
      pillarScores: pillarScores,
      submittedDate: dashboardData.issuedDate,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dashboard" title="IIICI Dashboard" showInstitutionBadge />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {institutionData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  {institutionData.logo ? (
                    <img
                      src={institutionData.logo || "/placeholder.svg"}
                      alt="Institution Logo"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{institutionData.name}</div>
                    <div className="text-sm text-muted-foreground">{institutionData.industry}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Founded</div>
                    <div className="text-sm text-muted-foreground">
                      {institutionData.yearFounded || "Not specified"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Organization Size</div>
                  <div className="text-sm text-muted-foreground">{institutionData.organizationSize}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Certification Level</div>
                    <Badge
                      className={
                        certificationLevel === "Gold"
                          ? "bg-yellow-500"
                          : certificationLevel === "Certified"
                            ? "bg-green-500"
                            : "bg-gray-500"
                      }
                    >
                      {certificationLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Country: </span>
                    <span className="text-muted-foreground">{institutionData.country}</span>
                  </div>
                  {institutionData.website && (
                    <div>
                      <span className="font-medium">Website: </span>
                      <a
                        href={institutionData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {institutionData.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Contact: </span>
                    <span className="text-muted-foreground">{institutionData.contactEmail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-[family-name:var(--font-space-grotesk)]">
            IIICI Certification Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your organization's innovation capability assessment and certification status
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {new Date(application.lastSaved).toLocaleString()}
            </Badge>
            {state.hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Saving changes...
              </Badge>
            )}
          </div>
        </div>

        {state.error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{state.error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Pillar Details</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewCharts
              overallScore={overallScore}
              pillarScores={pillarScores}
              certificationLevel={certificationLevel}
              issuedDate={dashboardData.issuedDate}
              expiryDate={dashboardData.expiryDate}
            />
          </TabsContent>

          <TabsContent value="details">
            <PillarDetails pillars={dashboardData.pillars} recommendations={dashboardData.recommendations} />
          </TabsContent>

          <TabsContent value="reports">
            <ExportReports
              overallScore={overallScore}
              pillarScores={pillarScores}
              certificationLevel={certificationLevel}
              organizationName={institutionData?.name || "Your Organization"}
              issuedDate={dashboardData.issuedDate}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoricalTracking history={historicalData} currentScore={overallScore} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer variant="minimal" />
    </div>
  )
}
