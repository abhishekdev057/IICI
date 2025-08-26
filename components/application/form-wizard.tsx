"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Building2, Loader2, Save, Lock } from "lucide-react"
import { useData } from "@/contexts/data-context"

import { InstitutionSetup } from "./institution-setup"
import { ScorePreview } from "./score-preview"
import { PillarOneForm } from "./pillar-forms/pillar-one-form"
import { PillarTwoForm } from "./pillar-forms/pillar-two-form"
import { PillarThreeForm } from "./pillar-forms/pillar-three-form"
import { PillarFourForm } from "./pillar-forms/pillar-four-form"
import { PillarFiveForm } from "./pillar-forms/pillar-five-form"
import { PillarSixForm } from "./pillar-forms/pillar-six-form"

const formSteps = [
  { id: 0, title: "Institution Setup", component: InstitutionSetup, icon: Building2 },
  { id: 1, title: "Strategic Foundation & Leadership", component: PillarOneForm },
  { id: 2, title: "Resource Allocation & Infrastructure", component: PillarTwoForm },
  { id: 3, title: "Innovation Processes & Culture", component: PillarThreeForm },
  { id: 4, title: "Knowledge & IP Management", component: PillarFourForm },
  { id: 5, title: "Strategic Intelligence & Collaboration", component: PillarFiveForm },
  { id: 6, title: "Performance Measurement & Improvement", component: PillarSixForm },
]

export function FormWizard() {
  const { state, saveApplication, submitApplication, startFresh, updatePillar } = useData()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const application = state.currentApplication

  // Calculate progress - PRODUCTION OPTIMIZED
  const progress = useMemo(() => {
    if (!application?.institutionData || !application?.pillarData) {
      return { overall: 0, current: 0 }
    }

    let totalFields = 0
    let completedFields = 0

    // Institution fields (5 required)
    const inst = application.institutionData
    totalFields += 5
    if (inst?.name && inst.name.trim().length >= 2) completedFields++
    if (inst?.industry && inst.industry.trim()) completedFields++
    if (inst?.organizationSize && inst.organizationSize.trim()) completedFields++
    if (inst?.country && inst.country.trim()) completedFields++
    if (inst?.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inst.contactEmail)) completedFields++

    // Pillar fields
    for (let i = 1; i <= 6; i++) {
      const pillarData = application.pillarData?.[`pillar_${i}`]
      if (pillarData && typeof pillarData === 'object' && (pillarData as any).indicators) {
        const indicators = (pillarData as any).indicators
        const values = Object.values(indicators)
        totalFields += values.length
        completedFields += values.filter(v => v !== undefined && v !== null && v !== "").length
      } else {
        totalFields += 4 // Estimate 4 indicators per pillar
      }
    }

    // Current step progress
    let currentProgress = 0
    if (currentStep === 0) {
      const requiredFields = [
        inst.name?.trim().length >= 2,
        inst.industry?.trim(),
        inst.organizationSize?.trim(),
        inst.country?.trim(),
        inst.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inst.contactEmail)
      ]
      currentProgress = (requiredFields.filter(Boolean).length / 5) * 100
    } else {
      const pillarData = application.pillarData?.[`pillar_${currentStep}`]
      if (pillarData && typeof pillarData === 'object') {
        // First try to get completion from stats
        if ((pillarData as any).stats && (pillarData as any).stats.completion !== undefined) {
          currentProgress = (pillarData as any).stats.completion
        } else if ((pillarData as any).indicators) {
          // Calculate from indicators
          const indicators = (pillarData as any).indicators
          const values = Object.values(indicators)
          currentProgress = values.length > 0 ? (values.filter(v => v !== undefined && v !== null && v !== "").length / values.length) * 100 : 0
        } else {
          // Fallback: check if any data exists in the pillar object
          const values = Object.values(pillarData)
          currentProgress = values.length > 0 ? (values.filter(v => v !== undefined && v !== null && v !== "").length / values.length) * 100 : 0
        }
      }
    }

    return {
      overall: totalFields > 0 ? (completedFields / totalFields) * 100 : 0,
      current: currentProgress
    }
  }, [application, currentStep])

  // Check if previous steps are complete for progressive unlocking
  const isStepAccessible = useMemo(() => {
    if (!application) return false

    // Institution step (step 0) is always accessible
    if (currentStep === 0) return true

    // Check if institution is complete
    const inst = application.institutionData
    const institutionComplete = !!(
      inst.name?.trim().length >= 2 &&
      inst.industry?.trim() &&
      inst.organizationSize?.trim() &&
      inst.country?.trim() &&
      inst.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inst.contactEmail)
    )

    if (!institutionComplete) return false

    // For pillar steps, check if previous pillar is complete
    if (currentStep > 1) {
      const previousPillarData = application.pillarData?.[`pillar_${currentStep - 1}`]
      if (!previousPillarData || typeof previousPillarData !== 'object') return false
      
      // Check if previous pillar has at least one indicator filled
      if ((previousPillarData as any).indicators) {
        const indicators = (previousPillarData as any).indicators
        const hasPreviousPillarData = Object.values(indicators).some(v => 
          v !== undefined && v !== null && v !== ""
        )
        
        if (!hasPreviousPillarData) return false
      } else {
        // Fallback: check if any data exists
        const hasPreviousPillarData = Object.values(previousPillarData).some(v => 
          v !== undefined && v !== null && v !== ""
        )
        
        if (!hasPreviousPillarData) return false
      }
    }

    return true
  }, [application, currentStep])

  // Can proceed check - MEMOIZED
  const canProceed = useMemo(() => {
    if (!application) return false

    if (currentStep === 0) {
      const inst = application.institutionData
      return !!(
        inst.name?.trim().length >= 2 &&
        inst.industry?.trim() &&
        inst.organizationSize?.trim() &&
        inst.country?.trim() &&
        inst.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inst.contactEmail)
      )
    } else {
      const pillarData = application.pillarData?.[`pillar_${currentStep}`]
      if (pillarData && typeof pillarData === 'object' && (pillarData as any).indicators) {
        const indicators = (pillarData as any).indicators
        return Object.values(indicators).some(v => v !== undefined && v !== null && v !== "")
      }
    }
    
    return true
  }, [application, currentStep])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const confirmed = confirm(
      "Are you sure you want to submit your application? This action cannot be undone."
    )
    
    if (!confirmed) return
    
    setIsSubmitting(true)
    try {
      await submitApplication()
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [submitApplication])

  // Update form data handler
  const handleDataChange = useCallback((pillarData: any) => {
    if (currentStep > 0) {
      console.log(`Updating pillar ${currentStep} with data:`, pillarData);
      updatePillar(`pillar_${currentStep}`, pillarData)
    }
  }, [currentStep, updatePillar])

  // Loading state
  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = formSteps[currentStep].component
  const CurrentIcon = formSteps[currentStep].icon
  const currentStepData = currentStep === 0 
    ? application.institutionData 
    : application.pillarData?.[`pillar_${currentStep}`] || {}

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                IIICI Certification Application
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Complete institution setup and all 6 pillars to receive your innovation certification
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Save Status */}
              <Badge variant={state.isSaving ? "secondary" : state.lastSaveTime ? "outline" : "destructive"}>
                {state.isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : state.lastSaveTime ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Saved
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Saved
                  </>
                )}
              </Badge>
              
              <Badge variant="outline">
                {application.status === "draft" ? "Draft" : application.status}
              </Badge>
              
              <Button variant="outline" size="sm" onClick={startFresh}>
                Start Fresh
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress.overall)}% Complete</span>
            </div>
            <Progress value={progress.overall} className="mb-4" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Current Step Progress</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress.current)}%</span>
            </div>
            <Progress value={progress.current} className="h-2 mb-4" />
            
            {currentStep === 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                <span className="text-destructive">*</span> Required: Institution Name, Industry, Organization Size, Country, Contact Email
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex justify-between text-xs text-muted-foreground overflow-x-auto">
              {formSteps.map((step, index) => {
                const Icon = step.icon || (() => <span>{step.id}</span>)
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                
                // Check if step is accessible
                const isAccessible = index === 0 || (application && index > 0 && 
                  (index === 1 ? 
                    // Check if institution is complete for pillar 1
                    !!(application.institutionData?.name?.trim().length >= 2 &&
                       application.institutionData?.industry?.trim() &&
                       application.institutionData?.organizationSize?.trim() &&
                       application.institutionData?.country?.trim() &&
                       application.institutionData?.contactEmail &&
                       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.institutionData.contactEmail))
                    :
                                   // Check if previous pillar has data
               !!(application.pillarData?.[`pillar_${index}`] && 
                  (() => {
                    const pillarData = application.pillarData[`pillar_${index}`]
                    if (pillarData && typeof pillarData === 'object' && (pillarData as any).indicators) {
                      return Object.values((pillarData as any).indicators).some(v => 
                        v !== undefined && v !== null && v !== ""
                      )
                    }
                    return Object.values(pillarData).some(v => 
                      v !== undefined && v !== null && v !== ""
                    )
                  })())
                  )
                );

                return (
                  <div key={step.id} className="flex flex-col items-center min-w-0 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 cursor-pointer transition-colors ${
                        isCompleted
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : isAccessible
                              ? "bg-muted text-muted-foreground hover:bg-muted/80"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => isAccessible && setCurrentStep(index)}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : !isAccessible ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-center max-w-16 text-xs truncate">
                      {step.id === 0 ? "Setup" : `Pillar ${step.id}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>



        {/* Score Preview */}
        {currentStep > 0 && (
          <div className="mb-6">
            <ScorePreview
              overallScore={Math.min(application.scores?.overallScore || 0, 100)} // Cap at 100%
              pillarScores={(() => {
                const scores = []
                for (let i = 1; i <= 6; i++) {
                  const pillarData = application.pillarData?.[`pillar_${i}`]
                  if (pillarData && typeof pillarData === 'object' && (pillarData as any).stats) {
                    scores.push(Math.min((pillarData as any).stats.averageScore || 0, 100)) // Cap at 100%
                  } else {
                    scores.push(0)
                  }
                }
                return scores
              })()}
              currentPillar={currentStep - 1}
              certificationLevel={application.scores?.certificationLevel || "Not Certified"}
            />
          </div>
        )}

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {CurrentIcon && <CurrentIcon className="h-5 w-5" />}
              {formSteps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 ? (
              <InstitutionSetup />
            ) : (
              <CurrentStepComponent
                onDataChange={handleDataChange}
                onScoreChange={() => {}} // Not needed anymore
                initialData={currentStepData}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
          <div className="flex gap-2 order-2 sm:order-1">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            
            <Button 
              variant="outline" 
              onClick={saveApplication}
              disabled={state.isSaving}
              className="min-w-[120px] flex-1 sm:flex-none"
            >
              {state.isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            {!canProceed && (
              <div className="flex items-center gap-2 text-sm text-destructive mb-2 sm:mb-0 sm:mr-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">
                  {currentStep === 0 
                    ? "Please complete all required fields to continue"
                    : "Please complete at least one indicator to continue"
                  }
                </span>
              </div>
            )}
            
            {currentStep === formSteps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{state.error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FormWizard