"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Wifi,
  Loader2,
  WifiOff,
  Crown,
  Users,
  Lightbulb,
  BookOpen,
  Network,
  TrendingUp,
  Info,
} from "lucide-react";
import { useApplication } from "@/contexts/application-context";
import { PILLAR_STRUCTURE } from "@/lib/pillar-structure";

// Import centralized utilities
import {
  getIndicatorMeasurementUnit,
  getIndicatorMaxScore,
  isEvidenceRequired,
  validateInstitutionData,
  validateEvidence,
} from "@/lib/application-utils";

import { toast } from "sonner";
import { InstitutionSetup } from "./institution-setup";
import { ScorePreview } from "./score-preview";
import { PillarOneFormOrganized } from "./pillar-forms/pillar-one-form-organized";
import { PillarTwoFormOrganized } from "./pillar-forms/pillar-two-form-organized";
import { PillarThreeFormOrganized } from "./pillar-forms/pillar-three-form-organized";
import { PillarFourFormOrganized } from "./pillar-forms/pillar-four-form-organized";
import { PillarFiveFormOrganized } from "./pillar-forms/pillar-five-form-organized";
import { PillarSixFormOrganized } from "./pillar-forms/pillar-six-form-organized";

const formSteps = [
  {
    id: 0,
    title: "Institution Setup",
    component: InstitutionSetup,
    icon: Building2,
    description: "Set up your organization details",
  },
  {
    id: 1,
    title: "Strategic Foundation & Leadership",
    component: PillarOneFormOrganized,
    icon: Crown,
    description:
      "Innovation intent, leadership commitment, and strategic alignment",
  },
  {
    id: 2,
    title: "Resource Allocation & Infrastructure",
    component: PillarTwoFormOrganized,
    icon: Users,
    description: "Financial investment, human capital, and infrastructure",
  },
  {
    id: 3,
    title: "Innovation Processes & Culture",
    component: PillarThreeFormOrganized,
    icon: Lightbulb,
    description: "Process maturity, idea management, and innovation culture",
  },
  {
    id: 4,
    title: "Knowledge & IP Management",
    component: PillarFourFormOrganized,
    icon: BookOpen,
    description: "IP strategy, knowledge sharing, and risk management",
  },
  {
    id: 5,
    title: "Strategic Intelligence & Collaboration",
    component: PillarFiveFormOrganized,
    icon: Network,
    description: "Intelligence gathering and external collaboration",
  },
  {
    id: 6,
    title: "Performance Measurement & Improvement",
    component: PillarSixFormOrganized,
    icon: TrendingUp,
    description: "Metrics, assessment, and continuous improvement",
  },
];

const CleanFormWizard = memo(function CleanFormWizard() {
  const router = useRouter();
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
    validateFromDatabase,
    validateApplicationData,
    loadStepData,
    loadedSteps,
    isLoadingStep,
  } = useApplication();

  // Using Sonner toast directly

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationInfo, setValidationInfo] = useState<{
    missingItems: string[];
    filledCount: number;
    totalCount: number;
  }>({ missingItems: [], filledCount: 0, totalCount: 0 });
  const [showAllMissingItems, setShowAllMissingItems] = useState(false);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  const application = state.application;

  // Note: Clean forms use useApplication hook directly, no need for handleDataChange

  // Calculate current step based on completion - DATABASE DRIVEN
  const currentStep = useMemo(() => {
    if (!application) return 0;
    // Use the currentStep from application context which is set based on database data
    return application.currentStep;
  }, [application]);

  // Calculate overall step progress (for sidebar) - OPTIMIZED for real-time updates
  const stepProgress = useMemo(() => {
    if (!application) return 0;

    const totalSteps = formSteps.length;
    let completedSteps = 0;

    // Check institution setup
    const institutionComplete = !!(
      application.institutionData.name &&
      application.institutionData.industry &&
      application.institutionData.organizationSize &&
      application.institutionData.country &&
      application.institutionData.contactEmail
    );

    if (institutionComplete) completedSteps++;

    // Check each pillar - use same logic as validation
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const progress = getPillarProgress(pillarId);
      // Calculate pillar progress
      // Use 100% completion to match validation logic
      if (progress.completion >= 100) completedSteps++;
    }

    const finalProgress = (completedSteps / totalSteps) * 100;
    // Calculate overall progress

    return finalProgress;
  }, [application, getPillarProgress, application?.lastModified]); // Added lastModified for real-time updates

  // Get current step completion (for step header display)
  const currentStepCompletion = useMemo(() => {
    if (!application) return 0;

    if (currentStep === 0) {
      // Institution setup completion
      const requiredFields = [
        { key: "name", label: "Institution Name" },
        { key: "industry", label: "Industry" },
        { key: "organizationSize", label: "Organization Size" },
        { key: "country", label: "Country" },
        { key: "contactEmail", label: "Contact Email" },
      ];

      const filledFields = requiredFields.filter(
        (field) =>
          application.institutionData[
            field.key as keyof typeof application.institutionData
          ]
      ).length;

      return (filledFields / requiredFields.length) * 100;
    } else {
      // Pillar completion
      return getPillarProgress(currentStep).completion;
    }
  }, [application, currentStep, getPillarProgress]);

  // Get overall progress
  const overallProgress = useMemo(() => {
    if (!application) return { completion: 0, score: 0 };
    return getOverallProgress();
  }, [application, getOverallProgress]);

  // Handle step navigation with progressive loading
  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < formSteps.length) {
        if (canNavigateToStep(stepIndex)) {
          // Load step data if not already loaded
          if (!loadedSteps.has(stepIndex)) {
            await loadStepData(stepIndex);
          }

          setCurrentStep(stepIndex);
        } else {
          toast.error("Step Locked", {
            description:
              "Please complete the previous steps before proceeding.",
          });
        }
      }
    },
    [canNavigateToStep, setCurrentStep, loadedSteps, loadStepData]
  );

  // REMOVED: Old isEvidenceRequired function that was causing incorrect evidence requirements

  // Check if evidence is required for an indicator based on its value - FIXED conditional logic
  // REMOVED: Old checkEvidenceRequired function - now using centralized isEvidenceRequired from lib/application-utils.ts

  // Get detailed validation info for current step - OPTIMIZED for real-time updates
  const getStepValidationInfo = useCallback(() => {
    // Validate current step
    if (!application)
      return {
        isComplete: false,
        missingItems: [],
        filledCount: 0,
        totalCount: 0,
      };

    if (currentStep === 0) {
      // Check institution setup
      const inst = application.institutionData;
      const requiredFields = [
        { key: "name", label: "Institution Name" },
        { key: "industry", label: "Industry" },
        { key: "organizationSize", label: "Organization Size" },
        { key: "country", label: "Country" },
        { key: "contactEmail", label: "Contact Email" },
      ];

      const missingItems = requiredFields.filter(
        (field) => !(inst as any)[field.key]?.trim()
      );
      const filledCount = requiredFields.length - missingItems.length;

      return {
        isComplete: missingItems.length === 0,
        missingItems: missingItems.map((item) => item.label),
        filledCount,
        totalCount: requiredFields.length,
      };
    } else {
      // Check pillar data - currentStep 1-6 corresponds to pillars 1-6
      const pillarId = currentStep;
      const pillarData = application.pillarData?.[`pillar_${pillarId}`];
      // Check pillar data

      const pillarStructure = PILLAR_STRUCTURE.find((p) => p.id === pillarId);

      if (!pillarStructure) {
        return {
          isComplete: false,
          missingItems: [],
          filledCount: 0,
          totalCount: 0,
        };
      }

      // Even if pillar data doesn't exist, we can still count the total indicators
      // and show that none are filled
      if (!pillarData) {
        const missingItems = [];
        let totalCount = 0;

        for (const subPillar of pillarStructure.subPillars) {
          for (const indicatorId of subPillar.indicators) {
            totalCount++;
            missingItems.push(`Indicator ${indicatorId} - Value required`);
          }
        }

        return {
          isComplete: false,
          missingItems,
          filledCount: 0,
          totalCount,
        };
      }

      const missingItems = [];
      let filledCount = 0;
      let totalCount = 0;

      for (const subPillar of pillarStructure.subPillars) {
        for (const indicatorId of subPillar.indicators) {
          totalCount++;
          const indicatorData = pillarData.indicators?.[indicatorId];
          const value = indicatorData?.value;
          const evidence = indicatorData?.evidence;

          // Check if indicator value is filled
          if (value === null || value === undefined || value === "") {
            missingItems.push(`Indicator ${indicatorId} - Value required`);
            continue;
          }

          // Check if evidence is required and provided
          const evidenceRequired = isEvidenceRequired(indicatorId, value);

          // Check if evidence is required and provided

          if (evidenceRequired) {
            // Use centralized evidence validation
            const hasEvidence = validateEvidence(evidence);

            if (!hasEvidence) {
              missingItems.push(`Indicator ${indicatorId} - Evidence required`);
              continue;
            }
          }

          filledCount++;
        }
      }

      return {
        isComplete: missingItems.length === 0,
        missingItems,
        filledCount,
        totalCount,
      };
    }
  }, [application, currentStep, application?.lastModified]); // Added lastModified for real-time updates

  // Check if current step is complete
  const isCurrentStepComplete = useCallback(() => {
    const validationInfo = getStepValidationInfo();
    return validationInfo.isComplete;
  }, [getStepValidationInfo]);

  // Real-time button state for Next button
  const isNextButtonEnabled = useMemo(() => {
    if (!application) return false;
    const validationInfo = getStepValidationInfo();
    return validationInfo.isComplete;
  }, [application, getStepValidationInfo, application?.lastModified]);

  // Real-time validation update effect
  useEffect(() => {
    if (application) {
      const newValidationInfo = getStepValidationInfo();
      // Update validation info

      // Update validation info state if it has changed
      setValidationInfo(newValidationInfo);

      // Auto-close validation dialog if step becomes complete
      if (newValidationInfo.isComplete && showValidationDialog) {
        // Step completed
        setShowValidationDialog(false);
      }
    }
  }, [application?.lastModified, getStepValidationInfo, showValidationDialog]);

  const goToNextStep = useCallback(async () => {
    if (currentStep < formSteps.length - 1) {
      // Show loading state
      setIsNavigating(true);

      try {
        // OPTIMIZATION: Check if we have unsaved changes first
        const hasUnsavedChanges = state.hasUnsavedChanges;
        const isCurrentlySaving = state.isSaving;

        console.log("🚀 Next button clicked:", {
          hasUnsavedChanges,
          isCurrentlySaving,
          currentStep,
        });

        // OPTIMIZATION: Only save if needed, skip expensive validation
        if (hasUnsavedChanges || isCurrentlySaving) {
          console.log("💾 Data needs saving - performing quick save...");

          // Show saving message
          toast.info("Saving...", {
            description: "Saving your progress before moving to next step",
          });

          // Step 1: Quick save without retry logic for faster performance
          const saveSuccess = await saveAllPendingChanges();

          if (!saveSuccess) {
            toast.error("Save Failed", {
              description:
                "Unable to save your data. Please check your connection and try again.",
            });
            setIsNavigating(false);
            return;
          }

          // Step 2: Short wait for save to complete
          await new Promise((resolve) => setTimeout(resolve, 300)); // Reduced from 1000ms
        } else {
          console.log(
            "✅ No unsaved changes - skipping save operations for faster navigation"
          );
        }

        // Step 3: Check if next step is accessible (not locked) - FAST LOCAL CHECK
        const nextStep = currentStep + 1;
        const canNavigate = canNavigateToStep(nextStep);

        if (!canNavigate) {
          console.log("🚫 Next step is locked - cannot navigate");
          console.log("🔍 Debugging step lock:", {
            currentStep,
            nextStep,
            hasApplication: !!application,
            institutionData: application?.institutionData,
            pillarProgress: {
              pillar1: getPillarProgress(1),
              pillar2: getPillarProgress(2),
              pillar3: getPillarProgress(3),
              pillar4: getPillarProgress(4),
              pillar5: getPillarProgress(5),
            },
          });

          // Check what's specifically blocking navigation
          let blockingReason = "Unknown reason";
          if (nextStep === 1) {
            const inst = application?.institutionData;
            const missing = [];
            if (!inst?.name?.trim()) missing.push("Institution Name");
            if (!inst?.industry?.trim()) missing.push("Industry");
            if (!inst?.organizationSize?.trim())
              missing.push("Organization Size");
            if (!inst?.country?.trim()) missing.push("Country");
            if (!inst?.contactEmail?.trim()) missing.push("Contact Email");
            blockingReason = `Institution setup incomplete: ${missing.join(
              ", "
            )}`;
          } else {
            const prevPillarId = nextStep - 1;
            const progress = getPillarProgress(prevPillarId);
            blockingReason = `Pillar ${prevPillarId} is ${Math.round(
              progress.completion
            )}% complete (needs 100%)`;
          }

          toast.error("Step Locked", {
            description: `Cannot proceed: ${blockingReason}`,
          });
          setIsNavigating(false);
          return;
        }

        // Step 4: Load next step data and navigate
        console.log("✅ All checks passed - navigating to next step");
        console.log("🎯 Navigating to next step in sequence:", nextStep);

        // Show moving message
        toast.info("Moving to next step...", {
          description: `Loading step ${nextStep + 1} data`,
        });

        // Load next step data if not already loaded
        if (!loadedSteps.has(nextStep)) {
          console.log(`🔄 Loading step ${nextStep} data...`);
          await loadStepData(nextStep);
        }

        setHasManuallyNavigated(true);
        setCurrentStep(nextStep);

        // Show completion celebration for high completion rates
        if (overallProgress.completion >= 80) {
          toast.success("🎉 Almost There!", {
            description: `You're ${Math.round(
              overallProgress.completion
            )}% complete! Moving to next step...`,
          });
        } else {
          toast.success("Step Completed", {
            description:
              "All data saved successfully. Moving to next step in sequence...",
          });
        }
      } catch (error) {
        console.error("❌ Error during navigation:", error);
        toast.error("Navigation Error", {
          description: "An error occurred while saving. Please try again.",
        });
      } finally {
        setIsNavigating(false);
      }
    }
  }, [
    currentStep,
    setCurrentStep,
    saveAllPendingChanges,
    canNavigateToStep,
    toast,
    state.hasUnsavedChanges,
    state.isSaving,
    overallProgress.completion,
    loadedSteps,
    loadStepData,
  ]);

  const goToPreviousStep = useCallback(async () => {
    console.log("🔍 goToPreviousStep called:", {
      currentStep,
      canGoBack: currentStep > 0,
    });
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      console.log("🔍 Going to previous step:", newStep);
      setHasManuallyNavigated(true); // Mark as manual navigation
      // Note: Auto-save is handled by ApplicationContext, no need to manually save here
      setCurrentStep(newStep);
    } else {
      console.log("🔍 Cannot go to previous step - already at step 0");
    }
  }, [currentStep, setCurrentStep]);

  // Handle submit with double-click prevention
  const handleSubmit = useCallback(async () => {
    if (!application || isSubmitting) {
      console.log("🚫 Submit blocked:", {
        hasApplication: !!application,
        isSubmitting,
      });
      return;
    }

    console.log("🚀 Starting application submission...");
    setIsSubmitting(true);

    try {
      await submitApplication();
      toast.success("Application Submitted", {
        description:
          "Your application has been submitted successfully. You will receive a confirmation email shortly.",
      });

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Give time for the toast to show
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Submission Failed", {
        description: "Failed to submit your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [application, submitApplication, isSubmitting, router]);

  // No auto-navigation - users can manually navigate to review their data
  // This allows users to take time to review complex pillar forms

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your application...</p>
        </div>
      </div>
    );
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
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Page
              </Button>
              <Button onClick={clearError}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
    );
  }

  const currentStepData = formSteps[currentStep];
  const CurrentComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                IIICI Certification Assessment
              </h1>
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
                  {state.isOnline ? "Online" : "Offline"}
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

              {/* Success indicator */}
              {!state.hasUnsavedChanges &&
                !state.isSaving &&
                state.lastSaveTime && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
            </div>
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
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">
                      {Math.round(overallProgress.completion)}%
                    </span>
                  </div>

                  {/* Motivational Message */}
                  {overallProgress.completion >= 80 && (
                    <div className="text-xs text-green-600 font-medium text-center">
                      🎉 Almost there!
                    </div>
                  )}
                  {overallProgress.completion >= 50 &&
                    overallProgress.completion < 80 && (
                      <div className="text-xs text-blue-600 font-medium text-center">
                        💪 Great progress!
                      </div>
                    )}
                  {overallProgress.completion >= 25 &&
                    overallProgress.completion < 50 && (
                      <div className="text-xs text-purple-600 font-medium text-center">
                        🚀 Keep going!
                      </div>
                    )}

                  <Progress
                    value={overallProgress.completion}
                    className="h-3 transition-all duration-500 ease-out"
                  />

                  {/* Save Status */}
                  <div className="space-y-1">
                    {state.isSaving && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Saving...</span>
                      </div>
                    )}
                    {state.hasUnsavedChanges && !state.isSaving && (
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span>Unsaved changes</span>
                      </div>
                    )}
                    {!state.hasUnsavedChanges &&
                      !state.isSaving &&
                      state.lastSaveTime && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span>All changes saved</span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Steps</h4>
                  {formSteps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted =
                      index === 0
                        ? !!(
                            application.institutionData.name &&
                            application.institutionData.industry &&
                            application.institutionData.organizationSize &&
                            application.institutionData.country &&
                            application.institutionData.contactEmail
                          )
                        : index > 0 &&
                          index <= 6 &&
                          getPillarProgress(index).completion >= 100;
                    const canNavigate = canNavigateToStep(index);

                    // Get progress info for this step
                    let progressInfo = { filledCount: 0, totalCount: 0 };
                    if (index === 0) {
                      const inst = application.institutionData;
                      const requiredFields = [
                        "name",
                        "industry",
                        "organizationSize",
                        "country",
                        "contactEmail",
                      ];
                      const filledCount = requiredFields.filter((field) =>
                        (inst as any)[field]?.trim()
                      ).length;
                      progressInfo = {
                        filledCount,
                        totalCount: requiredFields.length,
                      };
                    } else if (index > 0 && index <= 6) {
                      const pillarData =
                        application.pillarData?.[`pillar_${index}`];
                      if (pillarData) {
                        const pillarStructure =
                          require("@/lib/pillar-structure").PILLAR_STRUCTURE.find(
                            (p: any) => p.id === index
                          );
                        if (pillarStructure) {
                          let filledCount = 0;
                          let totalCount = 0;
                          for (const subPillar of pillarStructure.subPillars) {
                            for (const indicatorId of subPillar.indicators) {
                              totalCount++;
                              const value =
                                pillarData.indicators?.[indicatorId]?.value;
                              if (
                                value !== null &&
                                value !== undefined &&
                                value !== ""
                              ) {
                                filledCount++;
                              }
                            }
                          }
                          progressInfo = { filledCount, totalCount };
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
                            ? "bg-primary text-primary-foreground"
                            : isCompleted
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : canNavigate
                            ? "hover:bg-muted"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div
                              className={`h-4 w-4 rounded-full border-2 ${
                                isActive
                                  ? "border-primary-foreground"
                                  : "border-muted-foreground"
                              }`}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm">{step.title}</div>
                            {!isCompleted && progressInfo.totalCount > 0 && (
                              <div
                                className={`text-xs ${
                                  isActive
                                    ? "text-primary-foreground/80"
                                    : isCompleted
                                    ? "text-green-600"
                                    : "text-foreground/70"
                                }`}
                              >
                                {progressInfo.filledCount}/
                                {progressInfo.totalCount} completed
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  {application.status === "submitted" && (
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
                      <CardTitle className="text-xl">
                        {currentStepData.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Step {currentStep + 1} of {formSteps.length}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(currentStepCompletion)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Complete
                    </div>
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
                    disabled={isNavigating}
                    className="transition-all duration-300"
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {state.hasUnsavedChanges || state.isSaving
                          ? "Saving..."
                          : "Moving..."}
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || overallProgress.completion < 80}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Dialog */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
      >
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
                Please complete all required fields before proceeding to the
                next step.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  Progress: {validationInfo.filledCount} /{" "}
                  {validationInfo.totalCount} completed
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                    title="Real-time updates active"
                  ></div>
                </div>
                {validationInfo.missingItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-600">
                      Missing items:
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {(showAllMissingItems
                        ? validationInfo.missingItems
                        : validationInfo.missingItems.slice(0, 5)
                      ).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                      {validationInfo.missingItems.length > 5 &&
                        !showAllMissingItems && (
                          <li className="text-xs text-muted-foreground">
                            <button
                              onClick={() => setShowAllMissingItems(true)}
                              className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              ... and {validationInfo.missingItems.length - 5}{" "}
                              more (click to see all)
                            </button>
                          </li>
                        )}
                      {showAllMissingItems &&
                        validationInfo.missingItems.length > 5 && (
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
                      💡 <strong>Tip:</strong> Complete all required fields and
                      provide evidence where needed to proceed to the next step.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowValidationDialog(false);
                  setShowAllMissingItems(false);
                }}
              >
                I Understand
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export { CleanFormWizard };
