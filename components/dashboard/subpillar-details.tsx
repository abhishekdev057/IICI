"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Target, TrendingUp } from "lucide-react"
import { useState } from "react"
import { PILLAR_STRUCTURE, type SubPillar } from "@/lib/pillar-structure"

interface IndicatorData {
  id: string
  shortName: string
  description: string
  rawValue: any
  normalizedScore: number
  measurementUnit: string
  hasEvidence: boolean
  evidenceFiles: any[]
  evidenceLinks: any[]
  evidenceDescription: string
}

interface SubPillarDetailsProps {
  pillarId: number
  indicators: IndicatorData[]
  className?: string
}

export function SubPillarDetails({ pillarId, indicators, className }: SubPillarDetailsProps) {
  const [expandedSubPillars, setExpandedSubPillars] = useState<Set<string>>(new Set())
  
  const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === pillarId)
  if (!pillarStructure) return null

  const toggleSubPillar = (subPillarId: string) => {
    setExpandedSubPillars(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subPillarId)) {
        newSet.delete(subPillarId)
      } else {
        newSet.add(subPillarId)
      }
      return newSet
    })
  }

  const getSubPillarScore = (subPillar: SubPillar) => {
    const subPillarIndicators = indicators.filter(ind => subPillar.indicators.includes(ind.id))
    if (subPillarIndicators.length === 0) return 0
    
    const totalScore = subPillarIndicators.reduce((sum, ind) => sum + ind.normalizedScore, 0)
    return (totalScore / subPillarIndicators.length) * 100
  }

  const getSubPillarCompletion = (subPillar: SubPillar) => {
    const subPillarIndicators = indicators.filter(ind => subPillar.indicators.includes(ind.id))
    const completedIndicators = subPillarIndicators.filter(ind => ind.rawValue !== null && ind.rawValue !== undefined && ind.rawValue !== "")
    return subPillarIndicators.length > 0 ? (completedIndicators.length / subPillarIndicators.length) * 100 : 0
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {pillarStructure.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {pillarStructure.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pillarStructure.subPillars.map((subPillar) => {
          const score = getSubPillarScore(subPillar)
          const completion = getSubPillarCompletion(subPillar)
          const isExpanded = expandedSubPillars.has(subPillar.id)
          const subPillarIndicators = indicators.filter(ind => subPillar.indicators.includes(ind.id))
          
          return (
            <Collapsible key={subPillar.id} open={isExpanded} onOpenChange={() => toggleSubPillar(subPillar.id)}>
              <CollapsibleTrigger className="w-full">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="text-left">
                          <h4 className="font-medium text-sm">{subPillar.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subPillar.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round(score)}%</div>
                          <div className="text-xs text-muted-foreground">
                            {subPillarIndicators.length} indicators
                          </div>
                        </div>
                        <div className="w-16">
                          <Progress value={score} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Completion Status */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Completion: {Math.round(completion)}%
                        </span>
                      </div>
                      <Badge variant={completion === 100 ? "default" : completion > 50 ? "secondary" : "outline"} className="text-xs">
                        {completion === 100 ? "Complete" : completion > 50 ? "In Progress" : "Started"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 ml-6 space-y-2">
                  {subPillarIndicators.map((indicator) => (
                    <Card key={indicator.id} className="bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">
                                {indicator.id}
                              </span>
                              <h5 className="text-sm font-medium">{indicator.shortName}</h5>
                              {indicator.hasEvidence && (
                                <Badge variant="outline" className="text-xs">
                                  Evidence
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {indicator.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {indicator.measurementUnit}
                              </span>
                              {indicator.rawValue !== null && indicator.rawValue !== undefined && indicator.rawValue !== "" && (
                                <Badge variant="secondary" className="text-xs">
                                  Value: {indicator.rawValue}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {Math.round(indicator.normalizedScore)}%
                            </div>
                            <div className="w-12">
                              <Progress value={indicator.normalizedScore} className="h-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </CardContent>
    </Card>
  )
}
