"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, ExternalLink, ChevronDown, ChevronRight, Info } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState as useTooltipState } from "react"

interface IndicatorDetail {
  id: string
  shortName: string
  description?: string // Added description field
  rawValue: any
  normalizedScore: number
  measurementUnit: string
  hasEvidence: boolean
  evidenceFiles?: string[]
  evidenceLinks?: string[]
}

interface PillarDetail {
  id: number
  name: string
  score: number
  indicators: IndicatorDetail[]
}

interface PillarDetailsProps {
  pillars: PillarDetail[]
  recommendations: string[]
}

export function PillarDetails({ pillars = [], recommendations = [] }: PillarDetailsProps) {
  const [selectedPillar, setSelectedPillar] = useState(0)
  const [expandedIndicators, setExpandedIndicators] = useState<string[]>([])

  if (!pillars || pillars.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No pillar data available. Complete your assessment to view detailed results.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Improvement"
  }

  const toggleIndicator = (indicatorId: string) => {
    setExpandedIndicators((prev) =>
      prev.includes(indicatorId) ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId],
    )
  }

  const IndicatorCard = ({ indicator }: { indicator: IndicatorDetail }) => {
    const isExpanded = expandedIndicators.includes(indicator.id)
    const scorePercentage = Math.round(indicator.normalizedScore || 0)
    const [showTooltip, setShowTooltip] = useState(false)

    return (
      <Card className="mb-4">
        <Collapsible>
          <CollapsibleTrigger asChild onClick={() => toggleIndicator(indicator.id)}>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{indicator.shortName}</CardTitle>
                      {indicator.description && (
                        <div className="relative">
                          <Info 
                            className="h-4 w-4 text-muted-foreground cursor-help" 
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          />
                          {showTooltip && (
                            <div className="absolute z-50 left-6 top-0 bg-popover border rounded-md p-2 shadow-md max-w-sm">
                              <p className="text-sm">{indicator.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {indicator.measurementUnit}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ID: {indicator.id}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Raw:{" "}
                      {indicator.rawValue !== null && indicator.rawValue !== undefined ? indicator.rawValue : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">Score: {scorePercentage}%</div>
                  </div>
                  <div className="w-16">
                    <Progress value={scorePercentage} className="h-2" />
                    <div className="text-xs text-center mt-1">{getScoreLabel(scorePercentage)}</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                {indicator.description && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{indicator.description}</p>
                  </div>
                )}

                {/* Evidence Section */}
                {indicator.hasEvidence && (
                  <div className="border-l-4 border-l-green-500 pl-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Evidence Provided
                    </h4>

                    {indicator.evidenceFiles && indicator.evidenceFiles.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Files:</div>
                        {indicator.evidenceFiles.map((file, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {file}
                          </div>
                        ))}
                      </div>
                    )}

                    {indicator.evidenceLinks && indicator.evidenceLinks.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <div className="text-xs font-medium">Links:</div>
                        {indicator.evidenceLinks.map((link, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {link}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!indicator.hasEvidence && scorePercentage > 0 && (
                  <div className="border-l-4 border-l-yellow-500 pl-4">
                    <div className="text-xs text-muted-foreground">
                      No evidence provided - score may be subject to verification during review process
                    </div>
                  </div>
                )}

                {scorePercentage === 0 && (
                  <div className="border-l-4 border-l-red-500 pl-4">
                    <div className="text-xs text-muted-foreground">No data provided for this indicator</div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedPillar.toString()} onValueChange={(value) => setSelectedPillar(Number.parseInt(value))}>
        <TabsList className="grid w-full grid-cols-6">
          {pillars.map((pillar, index) => (
            <TabsTrigger key={pillar.id} value={index.toString()} className="text-xs">
              Pillar {pillar.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {pillars.map((pillar, index) => (
          <TabsContent key={pillar.id} value={index.toString()}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Pillar {pillar.id}: {pillar.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getScoreColor(pillar.score || 0)}>
                        {Math.round(pillar.score || 0)}% - {getScoreLabel(pillar.score || 0)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{Math.round(pillar.score || 0)}%</div>
                    <div className="text-sm text-muted-foreground">Pillar Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Indicators ({pillar.indicators?.length || 0})</h3>
                    <Progress value={pillar.score || 0} className="h-3" />
                  </div>

                  {(pillar.indicators || []).map((indicator) => (
                    <IndicatorCard key={indicator.id} indicator={indicator} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="border-l-4 border-l-blue-500 pl-4">
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
              )}
      </div>
  )
}
