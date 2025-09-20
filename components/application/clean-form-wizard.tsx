"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  Lock,
  ArrowLeft,
  ArrowRight,
  Target,
  Wifi,
  Loader2,
  WifiOff,
  Crown,
  Users,
  Lightbulb,
  BookOpen,
  Network,
  TrendingUp,
  Info
} from "lucide-react"
import { useApplication } from "@/contexts/application-context"
import { PILLAR_STRUCTURE } from "@/lib/pillar-structure"

// Import centralized utilities
import { 
  getIndicatorMeasurementUnit, 
  getIndicatorMaxScore, 
  isEvidenceRequired,
  validateInstitutionData,
  validateEvidence
} from "@/lib/application-utils";


import { useToast } from "@/components/ui/use-toast"
import { InstitutionSetup } from "./institution-setup"
import { ScorePreview } from "./score-preview"
import { PillarOneFormOrganized } from "./pillar-forms/pillar-one-form-organized"
import { PillarTwoFormOrganized } from "./pillar-forms/pillar-two-form-organized"
import { PillarThreeFormOrganized } from "./pillar-forms/pillar-three-form-organized"
import { PillarFourFormOrganized } from "./pillar-forms/pillar-four-form-organized"
import { PillarFiveFormOrganized } from "./pillar-forms/pillar-five-form-organized"
import { PillarSixFormOrganized } from "./pillar-forms/pillar-six-form-organized"

const formSteps = [
  { 
    id: 0, 
    title: "Institution Setup", 
    component: InstitutionSetup, 
    icon: Building2,
    description: "Set up your organization details"
  },
  { 
    id: 1, 
    title: "Strategic Foundation & Leadership", 
    component: PillarOneFormOrganized,
    icon: Crown,
    description: "Innovation intent, leadership commitment, and strategic alignment"
  },
  { 
    id: 2, 
    title: "Resource Allocation & Infrastructure", 
    component: PillarTwoFormOrganized,
    icon: Users,
    description: "Financial investment, human capital, and infrastructure"
  },
  { 
    id: 3, 
    title: "Innovation Processes & Culture", 
    component: PillarThreeFormOrganized,
    icon: Lightbulb,
    description: "Process maturity, idea management, and innovation culture"
  },
  { 
    id: 4, 
    title: "Knowledge & IP Management", 
    component: PillarFourFormOrganized,
    icon: BookOpen,
    description: "IP strategy, knowledge sharing, and risk management"
  },
  { 
    id: 5, 
    title: "Strategic Intelligence & Collaboration", 
    component: PillarFiveFormOrganized,
    icon: Network,
    description: "Intelligence gathering and external collaboration"
  },
  { 
    id: 6, 
    title: "Performance Measurement & Improvement", 
    component: PillarSixFormOrganized,
    icon: TrendingUp,
    description: "Metrics, assessment, and continuous improvement"
  },
]

export function CleanFormWizard() {
  const { 
    state, 
    saveApplication, 
    submitApplication, 
    setCurrentStep,
    getPillarProgress,
    getOverallProgress,
    canNavigateToStep,
    getNextIncompleteStep,
    clearError,
    updateIndicator,
    updateEvidence,
    saveAllPendingChanges,
    validateFromDatabase
  } = useApplication()
  
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationInfo, setValidationInfo] = useState<{ missingItems: string[]; filledCount: number; totalCount: number }>({ missingItems: [], filledCount: 0, totalCount: 0 })
  const [showAllMissingItems, setShowAllMissingItems] = useState(false)
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false)
  
  const application = state.application
  
  // Note: Clean forms use useApplication hook directly, no need for handleDataChange
  
  // Calculate current step based on completion - DATABASE DRIVEN
  const currentStep = useMemo(() => {
    if (!application) return 0
    // Use the currentStep from application context which is set based on database data
    return application.currentStep
  }, [application])
  
  // Calculate overall step progress (for sidebar) - OPTIMIZED for real-time updates
  const stepProgress = useMemo(() => {
    if (!application) return 0
    
    const totalSteps = formSteps.length
    let completedSteps = 0
    
    // Check institution setup
    const institutionComplete = !!(
      application.institutionData.name &&
      application.institutionData.industry &&
      application.institutionData.organizationSize &&
      application.institutionData.country &&
      application.institutionData.contactEmail
    )
    
    if (institutionComplete) completedSteps++
    
    // Check each pillar - use same logic as validation
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const progress = getPillarProgress(pillarId)
      console.log(`🔍 Step Progress - Pillar ${pillarId}:`, {
        completion: progress.completion,
        score: progress.score,
        isComplete: progress.completion >= 100
      })
      // Use 100% completion to match validation logic
      if (progress.completion >= 100) completedSteps++
    }
    
    const finalProgress = (completedSteps / totalSteps) * 100
    console.log(`🔍 Step Progress Calculation:`, {
      completedSteps,
      totalSteps,
      finalProgress
    })
    
    return finalProgress
  }, [application, getPillarProgress, application?.lastModified]) // Added lastModified for real-time updates

  // Get current step completion (for step header display)
  const currentStepCompletion = useMemo(() => {
    if (!application) return 0
    
    if (currentStep === 0) {
      // Institution setup completion
      const requiredFields = [
        { key: 'name', label: 'Institution Name' },
        { key: 'industry', label: 'Industry' },
        { key: 'organizationSize', label: 'Organization Size' },
        { key: 'country', label: 'Country' },
        { key: 'contactEmail', label: 'Contact Email' }
      ]
      
      const filledFields = requiredFields.filter(field => 
        application.institutionData[field.key as keyof typeof application.institutionData]
      ).length
      
      return (filledFields / requiredFields.length) * 100
    } else {
      // Pillar completion
      return getPillarProgress(currentStep).completion
    }
  }, [application, currentStep, getPillarProgress])
  
  // Get overall progress
  const overallProgress = useMemo(() => {
    if (!application) return { completion: 0, score: 0 }
    return getOverallProgress()
  }, [application, getOverallProgress])
  
  // Handle step navigation
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < formSteps.length) {
      if (canNavigateToStep(stepIndex)) {
        setCurrentStep(stepIndex)
      } else {
        toast({
          title: "Step Locked",
          description: "Please complete the previous steps before proceeding.",
          variant: "destructive",
        })
      }
    }
  }, [canNavigateToStep, setCurrentStep, toast])
  
  // REMOVED: Old isEvidenceRequired function that was causing incorrect evidence requirements

  // Check if evidence is required for an indicator based on its value - FIXED conditional logic
  // REMOVED: Old checkEvidenceRequired function - now using centralized isEvidenceRequired from lib/application-utils.ts

  // Get detailed validation info for current step - OPTIMIZED for real-time updates
  const getStepValidationInfo = useCallback(() => {
    console.log('🔍 Validation called with application:', application)
    if (!application) return { isComplete: false, missingItems: [], filledCount: 0, totalCount: 0 }
    
    if (currentStep === 0) {
      // Check institution setup
      const inst = application.institutionData
      const requiredFields = [
        { key: 'name', label: 'Institution Name' },
        { key: 'industry', label: 'Industry' },
        { key: 'organizationSize', label: 'Organization Size' },
        { key: 'country', label: 'Country' },
        { key: 'contactEmail', label: 'Contact Email' }
      ]
      
      const missingItems = requiredFields.filter(field => !(inst as any)[field.key]?.trim())
      const filledCount = requiredFields.length - missingItems.length
      
      return {
        isComplete: missingItems.length === 0,
        missingItems: missingItems.map(item => item.label),
        filledCount,
        totalCount: requiredFields.length
      }
    } else {
      // Check pillar data - currentStep 1-6 corresponds to pillars 1-6
      const pillarId = currentStep
      const pillarData = application.pillarData?.[`pillar_${pillarId}`]
      console.log(`🔍 Checking pillar ${pillarId} data:`, pillarData)
      
      const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === pillarId)
      
      if (!pillarStructure) {
        return { isComplete: false, missingItems: [], filledCount: 0, totalCount: 0 }
      }
      
      // Even if pillar data doesn't exist, we can still count the total indicators
      // and show that none are filled
      if (!pillarData) {
        const missingItems = []
        let totalCount = 0
        
        for (const subPillar of pillarStructure.subPillars) {
          for (const indicatorId of subPillar.indicators) {
            totalCount++
            missingItems.push(`Indicator ${indicatorId} - Value required`)
          }
        }
        
        return {
          isComplete: false,
          missingItems,
          filledCount: 0,
          totalCount
        }
      }
      
      const missingItems = []
      let filledCount = 0
      let totalCount = 0
      
      for (const subPillar of pillarStructure.subPillars) {
        for (const indicatorId of subPillar.indicators) {
          totalCount++
          const indicatorData = pillarData.indicators?.[indicatorId]
          const value = indicatorData?.value
          const evidence = indicatorData?.evidence
          
          // Check if indicator value is filled
          console.log(`🔍 Validating indicator ${indicatorId}:`, { value, indicatorData, pillarData })
          if (value === null || value === undefined || value === "") {
            missingItems.push(`Indicator ${indicatorId} - Value required`)
            continue
          }
          
          // Check if evidence is required and provided
          const evidenceRequired = isEvidenceRequired(indicatorId, value)
          
          // Enhanced debugging for all indicators requiring evidence
          if (evidenceRequired) {
            console.log(`🚨 EVIDENCE REQUIRED FOR ${indicatorId}:`, {
              value,
              valueType: typeof value,
              numericValue: Number(value),
              measurementUnit: getIndicatorMeasurementUnit(indicatorId),
              maxScore: getIndicatorMaxScore(indicatorId),
              threshold: getIndicatorMaxScore(indicatorId) * 0.5,
              thresholdType: getIndicatorMeasurementUnit(indicatorId).includes('Percentage') ? '50%' : 
                            getIndicatorMeasurementUnit(indicatorId).includes('Score') ? `${getIndicatorMaxScore(indicatorId) * 0.5}` :
                            getIndicatorMeasurementUnit(indicatorId).includes('Binary') ? '1' : 'N/A',
              hasEvidence: validateEvidence(evidence),
              evidence
            });
          }
          
          console.log(`🔍 Evidence check for ${indicatorId}:`, {
            value,
            evidenceRequired,
            hasEvidence: validateEvidence(evidence),
            evidence
          });
          
          if (evidenceRequired) {
            // Use centralized evidence validation
            const hasEvidence = validateEvidence(evidence)
            
            console.log(`🔍 Evidence validation for ${indicatorId}:`, {
              hasEvidence,
              evidenceRequired,
              evidence
            });
            
            if (!hasEvidence) {
              console.log(`❌ Evidence required but missing for ${indicatorId}`);
              missingItems.push(`Indicator ${indicatorId} - Evidence required`)
              continue
            } else {
              console.log(`✅ Evidence found for ${indicatorId}`);
            }
          } else {
            console.log(`✅ No evidence required for ${indicatorId} (value: ${value})`);
          }
          
          filledCount++
        }
      }
      
      return {
        isComplete: missingItems.length === 0,
        missingItems,
        filledCount,
        totalCount
      }
    }
  }, [application, currentStep, application?.lastModified]) // Added lastModified for real-time updates

  // Check if current step is complete
  const isCurrentStepComplete = useCallback(() => {
    const validationInfo = getStepValidationInfo()
    return validationInfo.isComplete
  }, [getStepValidationInfo])

  // Real-time button state for Next button
  const isNextButtonEnabled = useMemo(() => {
    if (!application) return false
    const validationInfo = getStepValidationInfo()
    return validationInfo.isComplete
  }, [application, getStepValidationInfo, application?.lastModified])

  // Real-time validation update effect
  useEffect(() => {
    if (application) {
      const newValidationInfo = getStepValidationInfo()
      console.log('🔄 Real-time validation update:', newValidationInfo)
      
      // Update validation info state if it has changed
      setValidationInfo(newValidationInfo)
      
      // Auto-close validation dialog if step becomes complete
      if (newValidationInfo.isComplete && showValidationDialog) {
        console.log('✅ Step completed, auto-closing validation dialog')
        setShowValidationDialog(false)
      }
    }
  }, [application?.lastModified, getStepValidationInfo, showValidationDialog])

  const goToNextStep = useCallback(async () => {
    if (currentStep < formSteps.length - 1) {
      console.log('🔄 Next button clicked - starting validation and save process')
      
      // Step 1: Save all pending changes first
      console.log('💾 Saving all pending changes before validation...')
      const saveSuccess = await saveAllPendingChanges()
      
      if (!saveSuccess) {
        toast({
          title: "Save Failed",
          description: "Please fix the save errors before proceeding.",
          variant: "destructive",
        })
        return
      }
      
      // Step 2: Validate from database directly
      console.log('🔍 Validating current step from database...')
      const dbValidation = await validateFromDatabase(currentStep)
      console.log('🔍 Database validation result:', dbValidation)
      
      if (!dbValidation.isValid) {
        // Update validation info with database results
        const validationInfo = {
          isComplete: false,
          missingItems: dbValidation.missingItems,
          filledCount: 0, // Will be calculated
          totalCount: 0   // Will be calculated
        }
        
        setValidationInfo(validationInfo)
        setShowValidationDialog(true)
        
        toast({
          title: "Step Incomplete",
          description: "Please complete all required fields before proceeding.",
          variant: "destructive",
        })
        return
      }
      
      // Step 3: Navigate to next step
      console.log('✅ Validation passed - navigating to next step')
      const nextIncompleteStep = getNextIncompleteStep()
      console.log('🎯 Navigating to next incomplete step:', nextIncompleteStep)
      setHasManuallyNavigated(true)
      setCurrentStep(nextIncompleteStep)
      
      toast({
        title: "Step Completed",
        description: "Moving to next step...",
      })
    }
  }, [currentStep, setCurrentStep, getNextIncompleteStep, saveAllPendingChanges, validateFromDatabase, toast])
  
  const goToPreviousStep = useCallback(async () => {
    console.log('🔍 goToPreviousStep called:', { currentStep, canGoBack: currentStep > 0 });
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      console.log('🔍 Going to previous step:', newStep);
      setHasManuallyNavigated(true); // Mark as manual navigation
      // Note: Auto-save is handled by ApplicationContext, no need to manually save here
      setCurrentStep(newStep);
    } else {
      console.log('🔍 Cannot go to previous step - already at step 0');
    }
  }, [currentStep, setCurrentStep])
  
  
  
  
  
  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!application) return
    
    setIsSubmitting(true)
    try {
      await submitApplication()
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. You will receive a confirmation email shortly.",
      })
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [application, submitApplication, toast])
  
  // Auto-navigate to next incomplete step when application loads (ONLY ONCE)
  useEffect(() => {
    if (application && !state.isLoading && !hasManuallyNavigated) {
      const nextIncompleteStep = getNextIncompleteStep()
      if (nextIncompleteStep !== currentStep) {
        console.log('🎯 Auto-navigating to next incomplete step on load:', nextIncompleteStep)
        setCurrentStep(nextIncompleteStep)
      }
    }
  }, [application, state.isLoading, hasManuallyNavigated, getNextIncompleteStep, setCurrentStep]) // Added hasManuallyNavigated to prevent interference
  
  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your application...</p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Application Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{state.error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={clearError}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Show no application state
  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              No Application Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn't find an existing application. Let's create a new one.
            </p>
            <Button onClick={() => window.location.reload()}>
              Create New Application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const currentStepData = formSteps[currentStep]
  const CurrentComponent = currentStepData.component
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">IIICI Certification Assessment</h1>
              <p className="text-sm text-muted-foreground">
                {currentStepData.title} - {currentStepData.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Network status */}
              <div className="flex items-center gap-2">
                {state.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {state.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Save status */}
              {state.hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              
              {state.isSaving && (
                <Badge variant="outline" className="text-blue-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <div className="flex items-center gap-2">
                <span>{Math.round(overallProgress.completion)}% Complete</span>
                {/* Real-time save status indicator */}
                {state.isSaving && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {state.hasUnsavedChanges && !state.isSaving && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span>Unsaved changes</span>
                  </div>
                )}
                {!state.hasUnsavedChanges && !state.isSaving && state.lastSaveTime && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Saved</span>
                  </div>
                )}
              </div>
            </div>
            <Progress value={overallProgress.completion} className="h-2" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Assessment Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{Math.round(overallProgress.completion)}%</span>
                  </div>
                  <Progress value={overallProgress.completion} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span>{Math.round(overallProgress.score)}%</span>
                  </div>
                  <Progress value={overallProgress.score} className="h-2" />
                </div>
                
                {/* Step Navigation */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Steps</h4>
                  {formSteps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index === 0 ? 
                      !!(application.institutionData.name && application.institutionData.industry && application.institutionData.organizationSize && application.institutionData.country && application.institutionData.contactEmail) :
                      (index > 0 && index <= 6 && getPillarProgress(index).completion >= 100)
                    const canNavigate = canNavigateToStep(index)
                    
                    // Get progress info for this step
                    let progressInfo = { filledCount: 0, totalCount: 0 }
                    if (index === 0) {
                      const inst = application.institutionData
                      const requiredFields = ['name', 'industry', 'organizationSize', 'country', 'contactEmail']
                      const filledCount = requiredFields.filter(field => (inst as any)[field]?.trim()).length
                      progressInfo = { filledCount, totalCount: requiredFields.length }
                    } else if (index > 0 && index <= 6) {
                      const pillarData = application.pillarData?.[`pillar_${index}`]
                      if (pillarData) {
                        const pillarStructure = require('@/lib/pillar-structure').PILLAR_STRUCTURE.find((p: any) => p.id === index)
                        if (pillarStructure) {
                          let filledCount = 0
                          let totalCount = 0
                          for (const subPillar of pillarStructure.subPillars) {
                            for (const indicatorId of subPillar.indicators) {
                              totalCount++
                              const value = pillarData.indicators?.[indicatorId]?.value
                              if (value !== null && value !== undefined && value !== "") {
                                filledCount++
                              }
                            }
                          }
                          progressInfo = { filledCount, totalCount }
                        }
                      }
                    }
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => goToStep(index)}
                        disabled={!canNavigate && !isActive}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : isCompleted
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : canNavigate
                                ? 'hover:bg-muted'
                                : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className={`h-4 w-4 rounded-full border-2 ${
                              isActive ? 'border-primary-foreground' : 'border-muted-foreground'
                            }`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm">{step.title}</div>
                            {!isCompleted && progressInfo.totalCount > 0 && (
                              <div className={`text-xs ${
                                isActive 
                                  ? 'text-primary-foreground/80' 
                                  : isCompleted
                                    ? 'text-green-600'
                                    : 'text-foreground/70'
                              }`}>
                                {progressInfo.filledCount}/{progressInfo.totalCount} completed
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  
                  
                  {application.status === 'draft' && (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || overallProgress.completion < 100}
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Submit Application
                    </Button>
                  )}
                  
                  {application.status === 'submitted' && (
                    <Badge variant="default" className="w-full justify-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submitted
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Step Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <currentStepData.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Step {currentStep + 1} of {formSteps.length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(currentStepCompletion)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Step Content */}
            <div className="space-y-6">
              <CurrentComponent />
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentStep < formSteps.length - 1 ? (
                  <Button 
                    onClick={goToNextStep}
                    className="transition-all duration-300"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || overallProgress.completion < 80}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Incomplete Step
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please complete all required fields before proceeding to the next step.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  Progress: {validationInfo.filledCount} / {validationInfo.totalCount} completed
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time updates active"></div>
                </div>
                {validationInfo.missingItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-600">Missing items:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {(showAllMissingItems ? validationInfo.missingItems : validationInfo.missingItems.slice(0, 5)).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                      {validationInfo.missingItems.length > 5 && !showAllMissingItems && (
                        <li className="text-xs text-muted-foreground">
                          <button 
                            onClick={() => setShowAllMissingItems(true)}
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            ... and {validationInfo.missingItems.length - 5} more (click to see all)
                          </button>
                        </li>
                      )}
                      {showAllMissingItems && validationInfo.missingItems.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          <button 
                            onClick={() => setShowAllMissingItems(false)}
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            Show less
                          </button>
                        </li>
                      )}
                    </ul>
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 rounded-md">
                      💡 <strong>Tip:</strong> Complete all required fields and provide evidence where needed to proceed to the next step.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => {
                setShowValidationDialog(false)
                setShowAllMissingItems(false)
              }}>
                I Understand
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
