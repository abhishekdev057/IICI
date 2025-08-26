"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Target, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"
import type { PillarScore } from "@/lib/scoring-engine"

interface RecommendationsPanelProps {
  recommendations: string[]
  pillars: PillarScore[]
}

export function RecommendationsPanel({ recommendations, pillars }: RecommendationsPanelProps) {
  const priorityAreas = pillars
    .filter((pillar) => pillar.averageScore < 70)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)

  const strongAreas = pillars
    .filter((pillar) => pillar.averageScore >= 80)
    .sort((a, b) => b.averageScore - a.averageScore)

  const getActionItems = (pillarId: number) => {
    const actionsByPillar: { [key: number]: string[] } = {
      1: [
        "Develop formal innovation charter with clear objectives",
        "Establish innovation steering committee",
        "Create innovation communication strategy",
      ],
      2: [
        "Allocate dedicated innovation budget",
        "Invest in innovation infrastructure",
        "Implement resource tracking systems",
      ],
      3: [
        "Implement structured innovation processes",
        "Foster innovation culture through training",
        "Establish cross-functional innovation teams",
      ],
      4: [
        "Develop IP management strategy",
        "Implement knowledge sharing platforms",
        "Create knowledge retention programs",
      ],
      5: ["Establish market intelligence systems", "Build strategic partnerships", "Enhance external collaboration"],
      6: [
        "Implement innovation metrics and KPIs",
        "Establish continuous improvement processes",
        "Create learning from failure mechanisms",
      ],
    }
    return actionsByPillar[pillarId] || []
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Areas */}
      {priorityAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityAreas.map((pillar, index) => (
                <div key={pillar.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Priority {index + 1}
                      </Badge>
                      <h4 className="font-medium">{pillar.name}</h4>
                    </div>
                    <Badge variant="outline">{Math.round(pillar.averageScore)}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Recommended Actions:</h5>
                    <div className="space-y-1">
                      {getActionItems(pillar.id).map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strong Areas */}
      {strongAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Areas of Excellence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strongAreas.map((pillar) => (
                <div
                  key={pillar.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{pillar.name}</span>
                  </div>
                  <Badge className="bg-green-600 text-white">{Math.round(pillar.averageScore)}%</Badge>
                </div>
              ))}
              <p className="text-sm text-muted-foreground mt-3">
                These areas demonstrate strong performance. Consider leveraging these strengths to support improvement
                in other areas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>90-Day Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Days 1-30</h4>
                <Badge variant="outline" className="mb-2">
                  Immediate Actions
                </Badge>
                <ul className="text-sm space-y-1">
                  <li>• Assess current innovation processes</li>
                  <li>• Form innovation task force</li>
                  <li>• Identify quick wins</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Days 31-60</h4>
                <Badge variant="outline" className="mb-2">
                  Foundation Building
                </Badge>
                <ul className="text-sm space-y-1">
                  <li>• Develop improvement strategies</li>
                  <li>• Allocate resources</li>
                  <li>• Begin implementation</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Days 61-90</h4>
                <Badge variant="outline" className="mb-2">
                  Implementation
                </Badge>
                <ul className="text-sm space-y-1">
                  <li>• Execute improvement plans</li>
                  <li>• Monitor progress</li>
                  <li>• Prepare for reassessment</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full">Download Detailed Action Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
