"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  Save, 
  Lock,
  ArrowLeft,
  ArrowRight,
  Target,
  Wifi,
  WifiOff,
  Loader2,
  Crown,
  Users,
  Lightbulb,
  BookOpen,
  Network,
  TrendingUp
} from "lucide-react"
import { useApplication } from "@/contexts/application-context"
import { useToast } from "@/components/ui/use-toast"

import { InstitutionSetup } from "./institution-setup"
import { ScorePreview } from "./score-preview"
import { PillarOneFormOrganized } from "./pillar-forms/pillar-one-form-organized"
import { PillarTwoForm } from "./pillar-forms/pillar-two-form-clean"
import { PillarThreeForm } from "./pillar-forms/pillar-three-form-clean"
import { PillarFourForm } from "./pillar-forms/pillar-four-form-clean"
import { PillarFiveForm } from "./pillar-forms/pillar-five-form-clean"
import { PillarSixForm } from "./pillar-forms/pillar-six-form-clean"

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
    component: PillarTwoForm,
    icon: Users,
    description: "Financial investment, human capital, and infrastructure"
  },
  { 
    id: 3, 
    title: "Innovation Processes & Culture", 
    component: PillarThreeForm,
    icon: Lightbulb,
    description: "Process maturity, idea management, and innovation culture"
  },
  { 
    id: 4, 
    title: "Knowledge & IP Management", 
    component: PillarFourForm,
    icon: BookOpen,
    description: "IP strategy, knowledge sharing, and risk management"
  },
  { 
    id: 5, 
    title: "Strategic Intelligence & Collaboration", 
    component: PillarFiveForm,
    icon: Network,
    description: "Intelligence gathering and external collaboration"
  },
  { 
    id: 6, 
    title: "Performance Measurement & Improvement", 
    component: PillarSixForm,
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
    clearError
  } = useApplication()
  
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  
  const application = state.application
  
  // Calculate current step based on completion
  const currentStep = useMemo(() => {
    if (!application) return 0
    return application.currentStep
  }, [application])
  
  // Calculate step progress
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
    
    // Check each pillar
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const progress = getPillarProgress(pillarId)
      if (progress.completion > 80) completedSteps++
    }
    
    return (completedSteps / totalSteps) * 100
  }, [application, getPillarProgress])
  
  // Get overall progress
  const overallProgress = useMemo(() => {
    if (!application) return { completion: 0, score: 0 }
    return getOverallProgress()
  }, [application, getOverallProgress])
  
  // Handle step navigation
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < formSteps.length) {
      const canGoBack = stepIndex < currentStep
      const isCompleted = stepIndex === 0 ? 
        !!(application.institutionData.name && application.institutionData.industry && application.institutionData.organizationSize && application.institutionData.country && application.institutionData.contactEmail) :
        (stepIndex > 0 && stepIndex <= 6 && getPillarProgress(stepIndex).completion > 80)
      
      if (canNavigateToStep(stepIndex) || canGoBack || isCompleted) {
        setCurrentStep(stepIndex)
      } else {
        toast({
          title: "Step Locked",
          description: "Please complete the previous steps before proceeding.",
          variant: "destructive",
        })
      }
    }
  }, [canNavigateToStep, setCurrentStep, toast, currentStep, application, getPillarProgress])
  
  const goToNextStep = useCallback(() => {
    if (currentStep < formSteps.length - 1) {
      const nextStep = currentStep + 1
      if (canNavigateToStep(nextStep)) {
        setCurrentStep(nextStep)
      } else {
        // Find next incomplete step
        const nextIncomplete = getNextIncompleteStep()
        setCurrentStep(nextIncomplete)
      }
    }
  }, [currentStep, canNavigateToStep, setCurrentStep, getNextIncompleteStep])
  
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      // Allow going back to any previous step (no restrictions for going back)
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])
  
  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await saveApplication(true)
      setShowSaveConfirmation(true)
      setTimeout(() => setShowSaveConfirmation(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
    }
  }, [saveApplication])
  
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
  
  // Auto-navigate to next incomplete step when application loads
  useEffect(() => {
    if (application && !state.isLoading) {
      const nextIncomplete = getNextIncompleteStep()
      if (nextIncomplete !== currentStep) {
        setCurrentStep(nextIncomplete)
      }
    }
  }, [application, state.isLoading, getNextIncompleteStep, currentStep, setCurrentStep])
  
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
                  <Save className="h-3 w-3 mr-1" />
                  Saving...
                </Badge>
              )}
              
              {showSaveConfirmation && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
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
              <span>{Math.round(overallProgress.completion)}% Complete</span>
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
                      (index > 0 && index <= 6 && getPillarProgress(index).completion > 80)
                    const canNavigate = canNavigateToStep(index)
                    const canGoBack = index < currentStep || isCompleted // Allow going back to previous steps
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => goToStep(index)}
                        disabled={!canNavigate && !isActive && !canGoBack}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : isCompleted
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                              : canNavigate
                                ? 'hover:bg-muted cursor-pointer'
                                : canGoBack
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
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
                          <span className="truncate">{step.title}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    onClick={handleSave} 
                    disabled={state.isSaving || !state.hasUnsavedChanges}
                    className="w-full"
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </Button>
                  
                  {application.status === 'draft' && (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || overallProgress.completion < 80}
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
                      {currentStep > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 You can go back to previous steps to make changes
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(stepProgress)}%
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
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "Back to Institution Setup" : "Previous Step"}
              </Button>
              
              <div className="flex gap-2">
                {currentStep < formSteps.length - 1 ? (
                  <Button onClick={goToNextStep}>
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
    </div>
  )
}
