"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { CleanIndicatorInput } from "../clean-indicator-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, CheckCircle, Target } from "lucide-react"
import { PILLAR_STRUCTURE } from "@/lib/pillar-structure"
import { useApplication } from "@/contexts/application-context"

// Import the original indicators
import { pillarFourIndicators } from "./pillar-four-form-clean"

// Import centralized utilities
import { 
  getIndicatorMeasurementUnit, 
  getIndicatorMaxScore, 
  isEvidenceRequired,
  validateEvidence
} from "@/lib/application-utils";

export function PillarFourFormOrganized() {
  const { state, updateIndicator, updateEvidence, getPillarProgress } = useApplication()
  const [expandedSubPillars, setExpandedSubPillars] = useState<Set<string>>(new Set(["4.1"]))
  
  // Get pillar structure
  const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === 4)
  if (!pillarStructure) return null

  const application = state.application
  if (!application) return null

  const pillarData = application.pillarData.pillar_4 || { indicators: {}, evidence: {} }

  const handleIndicatorChange = useCallback((indicatorId: string, value: any) => {
    updateIndicator(4, indicatorId, value)
  }, [updateIndicator])

  const handleEvidenceChange = useCallback((indicatorId: string, evidenceData: any) => {
    updateEvidence(4, indicatorId, evidenceData)
  }, [updateEvidence])
  

  const getSubPillarCompletion = useCallback((subPillarId: string) => {
    const subPillar = pillarStructure.subPillars.find(sp => sp.id === subPillarId)
    if (!subPillar) return 0
    
    const indicators = pillarFourIndicators.filter(ind => subPillar.indicators.includes(ind.id))
    const completed = indicators.filter(ind => {
      const indicatorData = pillarData.indicators?.[ind.id]
      const value = indicatorData?.value
      const evidence = indicatorData?.evidence
      
      // If no value, indicator is not complete
      if (value === null || value === undefined || value === "") return false
      
      // Check if evidence is conditionally required using centralized function
      const evidenceRequired = isEvidenceRequired(ind.id, value)
      
      // Check if evidence is provided when required using centralized validation
      if (evidenceRequired) {
        const hasEvidence = validateEvidence(evidence)
        return hasEvidence
      }
      
      // If no evidence required, indicator is complete with just a value
      return true
    })
    
    return indicators.length > 0 ? (completed.length / indicators.length) * 100 : 0
  }, [pillarData, pillarStructure])

  const getSubPillarScore = (subPillarId: string) => {
    const subPillar = pillarStructure.subPillars.find(sp => sp.id === subPillarId)
    if (!subPillar) return 0
    
    const indicators = pillarFourIndicators.filter(ind => subPillar.indicators.includes(ind.id))
    const totalScore = indicators.reduce((sum, ind) => {
      const value = pillarData.indicators?.[ind.id]?.value
      if (value === null || value === undefined || value === "") return sum
      
      // Simple scoring logic - in real app this would use the scoring engine
      const measurementUnit = getIndicatorMeasurementUnit(ind.id)
      if (measurementUnit.includes('Score')) {
        const maxScore = getIndicatorMaxScore(ind.id)
        return sum + (value / maxScore) * 100
      } else if (measurementUnit.includes('Percentage')) {
        return sum + Math.min(value, 100)
      } else if (measurementUnit.includes('Binary')) {
        return sum + (value ? 100 : 0)
      } else if (measurementUnit.includes('Hours')) {
        return sum + Math.min((value / 40) * 100, 100)
      }
      return sum
    }, 0)
    
    return indicators.length > 0 ? totalScore / indicators.length : 0
  }

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

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {pillarStructure.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {pillarStructure.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sub-Pillars */}
      {pillarStructure.subPillars.map((subPillar) => {
        const completion = getSubPillarCompletion(subPillar.id)
        const score = getSubPillarScore(subPillar.id)
        const isExpanded = expandedSubPillars.has(subPillar.id)
        const subPillarIndicators = pillarFourIndicators.filter(ind => subPillar.indicators.includes(ind.id))
        
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
                        <h3 className="font-medium">{subPillar.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {subPillar.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{Math.round(completion)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {subPillarIndicators.length} indicators
                        </div>
                      </div>
                      <div className="w-16">
                        <Progress value={completion} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Completion Status */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-muted-foreground" />
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
              <div className="mt-2 space-y-4">
                {subPillarIndicators.map((indicator) => (
                  <Card key={indicator.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <CleanIndicatorInput
                        indicator={indicator}
                        pillarId={4}
                        value={pillarData.indicators?.[indicator.id]?.value || null}
                        evidence={pillarData.indicators?.[indicator.id]?.evidence || {}}
                        onChange={(value) => handleIndicatorChange(indicator.id, value)}
                        onEvidenceChange={(evidenceData) => handleEvidenceChange(indicator.id, evidenceData)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}