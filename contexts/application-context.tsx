"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ScoringEngine } from "@/lib/scoring-engine";
import { PILLAR_STRUCTURE } from "@/lib/pillar-structure";

// Optimized debounce function with performance improvements
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;

  return ((...args: any[]) => {
    const now = Date.now();

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If enough time has passed since last call, execute immediately
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      return func(...args);
    }

    // Otherwise, schedule for later
    timeoutId = setTimeout(() => {
      lastCallTime = Date.now();
      func(...args);
    }, delay - (now - lastCallTime));
  }) as T;
}

// Clean interfaces
export interface InstitutionData {
  name: string;
  logo?: string;
  yearFounded?: number;
  industry: string;
  organizationSize: string;
  country: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  description?: string;
}

export interface EvidenceData {
  text?: {
    description: string;
    _persisted?: boolean;
  };
  link?: {
    url: string;
    description: string;
    _persisted?: boolean;
  };
  file?: {
    fileName: string;
    fileSize?: number;
    fileType?: string;
    url: string;
    description: string;
    _persisted?: boolean;
  };
}

export interface IndicatorData {
  id: string;
  value: any;
  evidence: EvidenceData;
  lastModified: Date;
}

export interface PillarData {
  indicators: { [indicatorId: string]: IndicatorData };
  lastModified: Date;
  completion: number;
  score: number;
}

export interface ApplicationData {
  id: string;
  institutionData: InstitutionData;
  pillarData: { [pillarKey: string]: PillarData };
  scores: any;
  status: "draft" | "submitted" | "under_review" | "certified";
  submittedAt?: Date;
  lastSaved: Date;
  lastModified: Date;
  currentStep: number;
}

interface ApplicationState {
  application: ApplicationData | null;
  isLoading: boolean;
  isSaving: boolean;
  isNavigating: boolean;
  error: string | null;
  lastSaveTime: Date | null;
  isOnline: boolean;
  hasUnsavedChanges: boolean;
}

interface ApplicationContextType {
  state: ApplicationState;

  // Core actions
  loadApplication: () => Promise<void>;
  saveApplication: (force?: boolean) => Promise<void>;
  submitApplication: () => Promise<void>;
  refreshApplicationData: () => Promise<void>;
  debugDataState: () => void;

  // Data updates
  updateInstitution: (data: Partial<InstitutionData>) => void;
  updateIndicator: (pillarId: number, indicatorId: string, value: any) => void;
  updateEvidence: (
    pillarId: number,
    indicatorId: string,
    evidence: EvidenceData
  ) => void;
  setCurrentStep: (step: number) => void;

  // Utilities
  clearError: () => void;
  getPillarProgress: (pillarId: number) => {
    completion: number;
    score: number;
  };
  getOverallProgress: () => { completion: number; score: number };
  canNavigateToStep: (step: number) => boolean;
  getNextIncompleteStep: () => number;
  saveAllPendingChanges: () => Promise<boolean>;
  validateFromDatabase: (
    step: number
  ) => Promise<{ isValid: boolean; missingItems: string[] }>;
  validateApplicationData: (app: ApplicationData) => {
    isValid: boolean;
    errors: string[];
  };
}

const ApplicationContext = createContext<ApplicationContextType | null>(null);

// Import centralized utilities
import {
  getIndicatorMeasurementUnit,
  getIndicatorMaxScore,
  calculateIndicatorScore,
  isEvidenceRequired,
  calculatePillarProgress as calculatePillarProgressUtil,
  validateInstitutionData,
  validateEvidence,
  createDebouncedFunction,
} from "@/lib/application-utils";

const calculatePillarProgress = (
  pillarData: PillarData,
  pillarId: number
): { completion: number; score: number } => {
  const pillarStructure = PILLAR_STRUCTURE.find((p) => p.id === pillarId);
  if (!pillarStructure) return { completion: 0, score: 0 };

  const allIndicators = pillarStructure.subPillars.flatMap(
    (sp) => sp.indicators
  );

  // Use centralized utility for progress calculation
  const result = calculatePillarProgressUtil(
    pillarData,
    pillarId,
    allIndicators
  );

  // Calculate pillar progress

  return result;
};

// Helper function to get next incomplete step - ENHANCED with debugging and robustness
const getNextIncompleteStepHelper = (application: ApplicationData): number => {
  console.log("🔍 getNextIncompleteStepHelper called with application:", {
    hasInstitutionData: !!application.institutionData,
    institutionData: application.institutionData,
    hasPillarData: !!application.pillarData,
    pillarKeys: Object.keys(application.pillarData || {}),
  });

  // Check institution setup first
  const institutionComplete = !!(
    application.institutionData.name &&
    application.institutionData.industry &&
    application.institutionData.organizationSize &&
    application.institutionData.country &&
    application.institutionData.contactEmail
  );

  console.log("🏢 Institution completion check:", {
    name: application.institutionData.name,
    industry: application.institutionData.industry,
    organizationSize: application.institutionData.organizationSize,
    country: application.institutionData.country,
    contactEmail: application.institutionData.contactEmail,
    isComplete: institutionComplete,
  });

  if (!institutionComplete) {
    console.log("❌ Institution not complete, returning step 0");
    return 0;
  }

  // Check each pillar using dynamic calculation instead of stale completion property
  for (let pillarId = 1; pillarId <= 6; pillarId++) {
    const pillarKey = `pillar_${pillarId}`;
    const pillarData = application.pillarData[pillarKey];

    console.log(`🏛️ Checking pillar ${pillarId}:`, {
      hasPillarData: !!pillarData,
      hasIndicators: !!pillarData?.indicators,
      indicatorCount: pillarData?.indicators
        ? Object.keys(pillarData.indicators).length
        : 0,
    });

    if (!pillarData) {
      console.log(
        `❌ Pillar ${pillarId} not started, returning step ${pillarId}`
      );
      return pillarId; // Pillar not started
    }

    // Calculate completion dynamically using the same logic as calculatePillarProgress
    const pillarStructure = PILLAR_STRUCTURE.find((p) => p.id === pillarId);
    if (!pillarStructure) {
      console.log(`⚠️ No pillar structure found for pillar ${pillarId}`);
      continue;
    }

    const allIndicators = pillarStructure.subPillars.flatMap(
      (sp) => sp.indicators
    );

    console.log(`📊 Pillar ${pillarId} indicators:`, {
      totalIndicators: allIndicators.length,
      indicators: allIndicators,
    });

    // Count completed indicators using conditional evidence logic
    const completedIndicators = allIndicators.filter((indicatorId) => {
      const indicator = pillarData.indicators[indicatorId];
      if (!indicator) {
        console.log(`❌ No indicator data for ${indicatorId}`);
        return false;
      }

      const hasValue =
        indicator.value !== null &&
        indicator.value !== undefined &&
        indicator.value !== "";
      const hasEvidence = validateEvidence(indicator.evidence);

      // If no value, indicator is not complete
      if (!hasValue) {
        console.log(`❌ No value for indicator ${indicatorId}`);
        return false;
      }

      // Check if evidence is conditionally required using centralized function
      const evidenceRequired = isEvidenceRequired(indicatorId, indicator.value);

      // Indicator is complete if it has a value AND (evidence is not required OR evidence is provided)
      const isComplete = hasValue && (!evidenceRequired || hasEvidence);

      console.log(`🔍 Indicator ${indicatorId} completion:`, {
        hasValue,
        hasEvidence,
        evidenceRequired,
        isComplete,
        value: indicator.value,
        evidence: indicator.evidence,
      });

      return isComplete;
    });

    const completion =
      allIndicators.length > 0
        ? (completedIndicators.length / allIndicators.length) * 100
        : 0;

    console.log(`📈 Pillar ${pillarId} completion:`, {
      completed: completedIndicators.length,
      total: allIndicators.length,
      percentage: completion,
    });

    // Check pillar completion
    if (completion < 100) {
      console.log(
        `❌ Pillar ${pillarId} not complete (${completion}%), returning step ${pillarId}`
      );
      return pillarId; // This pillar is not complete
    }
  }

  console.log("✅ All steps completed, returning step 6");
  return 6; // All steps completed
};

// Application Provider
export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<ApplicationState>({
    application: null,
    isLoading: false,
    isSaving: false,
    isNavigating: false,
    error: null,
    lastSaveTime: null,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    hasUnsavedChanges: false,
  });

  // Smart change tracking
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(
    new Map()
  );
  const [lastSavedState, setLastSavedState] = useState<any>(null);

  // Refs for stable references
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const loadDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const partialSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () =>
      setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (loadDebounceRef.current) {
        clearTimeout(loadDebounceRef.current);
      }
      if (partialSaveTimeoutRef.current) {
        clearTimeout(partialSaveTimeoutRef.current);
      }
    };
  }, []);

  // Simple and reliable partial save function
  const processPendingChanges = useCallback(async (): Promise<void> => {
    if (
      !state.application ||
      !session?.user?.email ||
      pendingChanges.size === 0
    ) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      // Get current pending changes and clear them
      const currentPendingChanges = new Map(pendingChanges);
      setPendingChanges(new Map());

      // Process each change individually to avoid complexity
      for (const [changeType, changes] of currentPendingChanges) {
        const response = await fetch(
          `/api/applications/enhanced/${state.application.id}/partial`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              changeType,
              changes,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to save changes: ${response.status}`
          );
        }
      }

      // Update last saved state
      setLastSavedState(JSON.parse(JSON.stringify(state.application)));

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaveTime: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("❌ Error saving partial changes:", error);

      let errorMessage = "Failed to save changes";
      if (error.message) {
        if (error.message.includes("PrismaClientValidationError")) {
          errorMessage = "Invalid data format. Please check your input.";
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Changes will be saved when connection is restored.";
        } else {
          errorMessage = `Save failed: ${error.message}`;
        }
      }

      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
        hasUnsavedChanges: true,
      }));
    }
  }, [state.application, session?.user?.email, pendingChanges]);

  // Optimized debounced partial save with batching
  const debouncedPartialSave = useCallback(
    debounce(() => {
      processPendingChanges();
    }, 300), // Reduced to 300ms for faster response
    [processPendingChanges]
  );

  // Enhanced immediate save function with force option
  const savePartialChanges = useCallback(
    async (changeType: string, changes: any, force = false): Promise<void> => {
      if (!state.application || !session?.user?.email) {
        return;
      }

      // If force is true, save immediately without any debouncing
      if (force) {
        console.log(
          `🚀 Force saving ${changeType} changes immediately:`,
          changes
        );

        // Clear any pending auto-save to prevent conflicts
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }

        try {
          setState((prev) => ({ ...prev, isSaving: true, error: null }));

          const response = await fetch(
            `/api/applications/enhanced/${state.application.id}/partial`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                changeType,
                changes,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Failed to save changes: ${response.status}`
            );
          }

          // Update last saved state
          setLastSavedState(JSON.parse(JSON.stringify(state.application)));

          setState((prev) => ({
            ...prev,
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaveTime: new Date(),
            error: null,
          }));

          console.log(`✅ Force save completed for ${changeType}`);

          // Show success feedback for immediate saves
          if (changeType === "evidence" || changeType === "indicator") {
            console.log(`🎉 ${changeType} saved immediately!`);
          }
        } catch (error: any) {
          console.error(`❌ Error force saving ${changeType} changes:`, error);

          setState((prev) => ({
            ...prev,
            isSaving: false,
            error: error.message,
            hasUnsavedChanges: true,
          }));
        }
        return;
      }

      // For non-force saves, use the existing debounced mechanism
      try {
        setState((prev) => ({ ...prev, isSaving: true, error: null }));

        const response = await fetch(
          `/api/applications/enhanced/${state.application.id}/partial`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              changeType,
              changes,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to save changes: ${response.status}`
          );
        }

        // Update last saved state
        setLastSavedState(JSON.parse(JSON.stringify(state.application)));

        setState((prev) => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaveTime: new Date(),
          error: null,
        }));
      } catch (error: any) {
        console.error("❌ Error saving partial changes:", error);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error.message,
          hasUnsavedChanges: true,
        }));
      }
    },
    [state.application, session?.user?.email]
  );

  // Load application with duplicate prevention
  const loadApplication = useCallback(
    async (retryCount = 0) => {
      if (!session?.user?.email || state.isLoading) return;

      // Prevent multiple simultaneous load requests
      if (state.isLoading) {
        // Application load already in progress
        return;
      }

      const maxRetries = 2;
      const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Simple fetch without AbortController to avoid signal issues
        const response = await fetch("/api/applications/enhanced");

        if (!response.ok) {
          console.error("❌ Load failed:", {
            status: response.status,
            statusText: response.statusText,
            retryCount,
            maxRetries,
          });

          // Enhanced retry logic for load operations
          const shouldRetry =
            (response.status >= 500 || // Server errors
              response.status === 0 || // Network errors
              response.status === 408 || // Timeout
              response.status === 429) && // Rate limiting
            retryCount < maxRetries;

          if (shouldRetry) {
            const backoffDelay = Math.min(
              retryDelay * Math.pow(2, retryCount),
              5000
            ); // Max 5 seconds for load
            console.log(
              `🔄 Retrying load in ${backoffDelay}ms (attempt ${
                retryCount + 1
              }/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            return loadApplication(retryCount + 1);
          }

          // Provide user-friendly error messages
          let errorMessage = "Failed to load application";
          if (response.status === 401) {
            errorMessage =
              "Session expired. Please refresh the page and try again.";
          } else if (response.status === 403) {
            errorMessage =
              "You don't have permission to access this application.";
          } else if (response.status === 404) {
            errorMessage = "Application not found.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a few moments.";
          }

          throw new Error(errorMessage);
        }

        const { data: applications } = await response.json();

        if (applications && applications.length > 0) {
          const app = applications[0];

          // Use the properly structured pillar data from the API
          // The API now returns evidence properly attached to indicators
          const pillarData = app.pillarData || {};

          // Loaded pillar data from API

          // Pillar data loaded

          const applicationData: ApplicationData = {
            id: app.id,
            institutionData: app.institutionData || {
              name: "Institution Name",
              industry: "Education",
              organizationSize: "Small",
              country: "India",
              contactEmail: session.user?.email || "",
            },
            pillarData: pillarData,
            scores: app.scores,
            status: app.status?.toLowerCase() || "draft",
            submittedAt: app.submittedAt
              ? new Date(app.submittedAt)
              : undefined,
            lastSaved: new Date(app.lastSaved),
            lastModified: new Date(app.lastModified),
            currentStep: 0, // Will be calculated based on completion
          };

          // Application data loaded

          // Keep the current step from database (no auto-navigation)
          // Users can manually navigate to review their data
          // This prevents automatic jumping to incomplete steps, allowing users
          // to take time to review complex pillar forms

          setState((prev) => ({
            ...prev,
            application: applicationData,
            isLoading: false,
            hasUnsavedChanges: false,
          }));
        } else {
          // Create new application with enhanced error handling
          // No existing application found, creating new one
          const createResponse = await fetch("/api/applications/enhanced", {
            method: "POST",
          });
          if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            console.error("Application creation failed:", {
              status: createResponse.status,
              statusText: createResponse.statusText,
              error: errorData,
            });

            // Handle specific error cases
            if (createResponse.status === 409) {
              // Application already exists (race condition), try to fetch it
              console.log(
                "⚠️ Application already exists, fetching existing one..."
              );
              const fetchResponse = await fetch("/api/applications/enhanced");
              if (fetchResponse.ok) {
                const responseData = await fetchResponse.json();
                console.log("🔄 API Response:", responseData);
                const { data: existingApps } = responseData;
                if (existingApps && existingApps.length > 0) {
                  const app = existingApps[0];
                  console.log("🔄 First application from API:", app);
                  // Process existing application data...
                  const applicationData: ApplicationData = {
                    id: app.id,
                    institutionData: app.institutionData || {
                      name: "",
                      industry: "",
                      organizationSize: "",
                      country: "",
                      contactEmail: session.user?.email || "",
                    },
                    pillarData: app.pillarData || {}, // This is the transformed data from API
                    scores: app.scores,
                    status: app.status?.toLowerCase() || "draft",
                    submittedAt: app.submittedAt
                      ? new Date(app.submittedAt)
                      : undefined,
                    lastSaved: new Date(app.lastSaved),
                    lastModified: new Date(app.lastModified),
                    currentStep: 0,
                  };

                  console.log("🔄 Loaded application data:", {
                    id: app.id,
                    pillarDataKeys: Object.keys(app.pillarData || {}),
                    pillarData: app.pillarData,
                  });

                  setState((prev) => ({
                    ...prev,
                    application: applicationData,
                    isLoading: false,
                    hasUnsavedChanges: false,
                  }));
                  return;
                }
              }
            }

            throw new Error(
              `Failed to create application: ${createResponse.status} ${createResponse.statusText}`
            );
          }

          const { data: newApp } = await createResponse.json();
          console.log("Application created successfully:", newApp);

          const applicationData: ApplicationData = {
            id: newApp.id,
            institutionData: newApp.institutionData || {
              name: "Institution Name",
              industry: "Education",
              organizationSize: "Small",
              country: "India",
              contactEmail: session.user?.email || "",
            },
            pillarData: {},
            scores: null,
            status: "draft",
            lastSaved: new Date(),
            lastModified: new Date(),
            currentStep: 0, // New application starts at step 0 (institution setup)
          };

          console.log(
            "🎯 New application created, starting at step 0 (institution setup)"
          );

          setState((prev) => ({
            ...prev,
            application: applicationData,
            isLoading: false,
            hasUnsavedChanges: false,
          }));
        }
      } catch (error) {
        console.error("Load error:", error);

        // Retry on network errors (but not AbortError since we removed AbortController)
        if (
          error instanceof Error &&
          !error.message.includes("Failed to load applications") &&
          retryCount < maxRetries
        ) {
          console.log(
            `🔄 Retrying after error in ${retryDelay}ms... (attempt ${
              retryCount + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return loadApplication(retryCount + 1);
        }

        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load application",
          isLoading: false,
        }));
      }
    },
    [session?.user?.email, state.isLoading]
  );

  // Debounced save function - ENHANCED with better error handling
  const debouncedSave = useCallback((force = false) => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }

    saveDebounceRef.current = setTimeout(() => {
      saveApplicationInternal(force).catch((error) => {
        console.error("❌ Debounced save failed:", error);
        setState((prev) => ({
          ...prev,
          error: error.message || "Save failed",
          isSaving: false,
        }));
      });
    }, 300); // Reduced to 300ms for faster real-time updates
  }, []);

  // Internal save function - ENHANCED with better error handling, retry logic, and data validation
  const saveApplicationInternal = useCallback(
    async (force = false, retryCount = 0): Promise<void> => {
      if (!state.application || !session?.user) {
        console.log("❌ Save skipped: No application or session");
        return;
      }

      // Prevent multiple simultaneous saves
      if (state.isSaving && !force) {
        console.log("❌ Save skipped: Already saving");
        return;
      }

      // Data validation before save
      if (!state.application.id) {
        console.error("❌ Save failed: No application ID");
        setState((prev) => ({
          ...prev,
          error: "Application ID missing - please refresh and try again",
          isSaving: false,
        }));
        return;
      }

      if (!force && !state.hasUnsavedChanges) {
        console.log("❌ Save skipped: No unsaved changes");
        return;
      }

      const maxRetries = 3;
      const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

      if (!state.isOnline) {
        console.log("❌ Save skipped: Offline");
        toast({
          title: "No Internet Connection",
          description: "Changes will be saved when connection is restored.",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log(
          `💾 Starting save (attempt ${retryCount + 1}/${maxRetries + 1})`
        );
        setState((prev) => ({ ...prev, isSaving: true, error: null }));

        // Prepare indicator responses
        const indicatorResponses: Array<{
          indicatorId: string;
          pillarId: number;
          rawValue: any;
          normalizedScore: number;
          measurementUnit: string;
          hasEvidence: boolean;
          evidence?: EvidenceData;
        }> = [];

        // Prepare indicator responses for saving

        if (
          !state.application.pillarData ||
          Object.keys(state.application.pillarData).length === 0
        ) {
          // No pillar data to save - this is normal for new applications
          // Don't return early - still save institution data and other updates
        }

        // Only process pillar data if it exists
        if (
          state.application.pillarData &&
          Object.keys(state.application.pillarData).length > 0
        ) {
          Object.entries(state.application.pillarData).forEach(
            ([pillarKey, pillarData]) => {
              const pillarId = parseInt(pillarKey.replace("pillar_", ""));
              if (isNaN(pillarId)) return;

              // Process pillar data

              Object.entries(pillarData.indicators).forEach(
                ([indicatorId, indicator]) => {
                  const hasEvidence = !!(
                    indicator.evidence?.text?.description ||
                    indicator.evidence?.link?.url ||
                    indicator.evidence?.file?.fileName
                  );

                  console.log(`🔍 Processing indicator ${indicatorId}:`, {
                    value: indicator.value,
                    hasEvidence,
                    evidence: indicator.evidence,
                    willInclude: !(
                      !hasEvidence &&
                      (indicator.value === null ||
                        indicator.value === undefined ||
                        indicator.value === "")
                    ),
                  });

                  // Only skip if there's absolutely no data at all
                  if (
                    (indicator.value === null ||
                      indicator.value === undefined ||
                      indicator.value === "") &&
                    !hasEvidence
                  ) {
                    console.log(
                      `❌ Skipping indicator ${indicatorId} - no value and no evidence`
                    );
                    return;
                  }

                  const response = {
                    indicatorId,
                    pillarId,
                    rawValue: indicator.value,
                    normalizedScore: calculateIndicatorScore(
                      indicatorId,
                      indicator.value
                    ),
                    measurementUnit: getIndicatorMeasurementUnit(indicatorId),
                    hasEvidence,
                    evidence: indicator.evidence,
                  };

                  console.log(`✅ Including indicator ${indicatorId}:`, {
                    ...response,
                    evidenceDetails: indicator.evidence
                      ? {
                          hasText: !!indicator.evidence.text?.description,
                          hasLink: !!indicator.evidence.link?.url,
                          hasFile: !!indicator.evidence.file?.fileName,
                          evidenceKeys: Object.keys(indicator.evidence),
                        }
                      : null,
                  });
                  indicatorResponses.push(response);
                }
              );
            }
          );
        }

        // Check if application has an ID
        if (!state.application.id) {
          throw new Error(
            "Application not properly initialized. Please refresh the page."
          );
        }

        // Save to backend with timeout and retry logic - FIXED abort handling
        // Simple fetch without AbortController to avoid signal issues
        const response = await fetch(
          `/api/applications/enhanced/${state.application.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: state.application.status,
              institutionData: state.application.institutionData,
              pillarData: state.application.pillarData,
              indicatorResponses,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Save failed:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
            retryCount,
            maxRetries,
          });

          // Enhanced retry logic with exponential backoff
          const shouldRetry =
            (response.status >= 500 || // Server errors
              response.status === 0 || // Network errors
              response.status === 408 || // Timeout
              response.status === 429) && // Rate limiting
            retryCount < maxRetries;

          if (shouldRetry) {
            const backoffDelay = Math.min(
              retryDelay * Math.pow(2, retryCount),
              10000
            ); // Max 10 seconds
            console.log(
              `🔄 Retrying save in ${backoffDelay}ms (attempt ${
                retryCount + 1
              }/${maxRetries})`
            );

            setState((prev) => ({
              ...prev,
              isSaving: false,
              error: `Save failed, retrying... (${
                retryCount + 1
              }/${maxRetries})`,
            }));

            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            return await saveApplicationInternal(force, retryCount + 1);
          }

          // Provide user-friendly error messages
          let errorMessage = "Failed to save application";
          if (response.status === 401) {
            errorMessage =
              "Session expired. Please refresh the page and try again.";
          } else if (response.status === 403) {
            errorMessage =
              "You don't have permission to save this application.";
          } else if (response.status === 404) {
            errorMessage = "Application not found. Please refresh the page.";
          } else if (response.status === 413) {
            errorMessage =
              "Data too large. Please reduce the amount of data and try again.";
          } else if (response.status === 429) {
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a few moments.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Save successful:", result);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaveTime: new Date(),
          lastSaveRef: new Date(),
        }));

        if (force) {
          toast({
            title: "Application Saved",
            description: "Your changes have been saved successfully.",
          });
        } else {
          // Silent auto-save - no toast to avoid spam
          console.log("✅ Auto-save completed successfully");
        }
      } catch (error) {
        console.error("❌ Save error:", error);

        // Enhanced error handling with better retry logic
        const isRetryableError =
          error instanceof Error &&
          (error.message.includes("NetworkError") ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("timeout") ||
            error.message.includes("ECONNRESET") ||
            error.message.includes("ENOTFOUND")) &&
          retryCount < maxRetries;

        if (isRetryableError) {
          const backoffDelay = Math.min(
            retryDelay * Math.pow(2, retryCount),
            10000
          );
          console.log(
            `🔄 Retrying save in ${backoffDelay}ms... (attempt ${
              retryCount + 1
            }/${maxRetries})`
          );

          setState((prev) => ({
            ...prev,
            isSaving: false,
            error: `Network error, retrying... (${
              retryCount + 1
            }/${maxRetries})`,
          }));

          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          return await saveApplicationInternal(force, retryCount + 1);
        }

        // Set error state with user-friendly message
        const errorMessage =
          error instanceof Error ? error.message : "Failed to save application";
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: errorMessage,
          hasUnsavedChanges: true, // Keep unsaved changes flag on error
        }));

        // Show error toast for manual saves or critical errors
        if (force || retryCount >= maxRetries) {
          toast({
            title: "Save Failed",
            description: errorMessage,
            variant: "destructive",
            duration: 5000, // Show longer for important errors
          });
        } else {
          // For auto-save failures, show a subtle notification
          console.warn("⚠️ Auto-save failed:", errorMessage);
        }
      }
    },
    [
      state.application,
      state.isSaving,
      state.hasUnsavedChanges,
      state.isOnline,
      session?.user,
      toast,
    ]
  );

  // Public saveApplication function - uses debounced save for auto-save, direct for manual saves
  const saveApplication = useCallback(
    async (force = false): Promise<void> => {
      if (force) {
        // For manual saves, call directly without debounce
        return saveApplicationInternal(force);
      } else {
        // For auto-saves, use debounced version
        debouncedSave(force);
      }
    },
    [saveApplicationInternal, debouncedSave]
  );

  // Auto-save effect - OPTIMIZED to prevent unnecessary saves
  useEffect(() => {
    console.log("🔍 Auto-save effect triggered:", {
      hasUnsavedChanges: state.hasUnsavedChanges,
      isOnline: state.isOnline,
      isSaving: state.isSaving,
      hasApplication: !!state.application,
    });

    // Only auto-save if we have actual changes and application data
    if (
      state.hasUnsavedChanges &&
      state.isOnline &&
      !state.isSaving &&
      state.application
    ) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      console.log(
        "🔍 Setting auto-save timeout for 3 seconds (increased to avoid conflicts)"
      );
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log("🔍 Auto-save timeout triggered, calling debouncedSave");
        debouncedSave(false);
      }, 3000); // Increased from 2s to 3s to avoid conflicts with force saves
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    state.hasUnsavedChanges,
    state.isOnline,
    state.isSaving,
    state.application,
    debouncedSave,
  ]);

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (loadDebounceRef.current) {
        clearTimeout(loadDebounceRef.current);
      }
    };
  }, []);

  // Update institution data
  const updateInstitution = useCallback(
    (data: Partial<InstitutionData>) => {
      if (!state.application) return;

      setState((prev) => ({
        ...prev,
        application: {
          ...prev.application!,
          institutionData: { ...prev.application!.institutionData, ...data },
          lastModified: new Date(),
        },
        hasUnsavedChanges: true,
      }));

      // Save institution data immediately using partial save
      savePartialChanges("institution", data);
    },
    [state.application, savePartialChanges]
  );

  // Update indicator value
  const updateIndicator = useCallback(
    (pillarId: number, indicatorId: string, value: any) => {
      if (!state.application) return;

      const pillarKey = `pillar_${pillarId}`;

      setState((prev) => {
        if (!prev.application) {
          console.error("❌ No application in previous state");
          return prev;
        }

        const newPillarData = { ...prev.application.pillarData };

        if (!newPillarData[pillarKey]) {
          newPillarData[pillarKey] = {
            indicators: {},
            lastModified: new Date(),
            completion: 0,
            score: 0,
          };
        }

        // Ensure indicators object exists
        if (!newPillarData[pillarKey].indicators) {
          newPillarData[pillarKey].indicators = {};
        }

        // Check if the value actually changed
        const currentValue =
          newPillarData[pillarKey].indicators[indicatorId]?.value;
        const hasValueChanged = currentValue !== value;

        if (!hasValueChanged) {
          return prev; // No change, don't trigger save
        }

        newPillarData[pillarKey] = {
          ...newPillarData[pillarKey],
          indicators: {
            ...newPillarData[pillarKey].indicators,
            [indicatorId]: {
              id: indicatorId,
              value,
              evidence:
                newPillarData[pillarKey].indicators[indicatorId]?.evidence ||
                {},
              lastModified: new Date(),
            },
          },
          lastModified: new Date(),
        };

        // Recalculate pillar progress
        const progress = calculatePillarProgress(
          newPillarData[pillarKey],
          pillarId
        );
        newPillarData[pillarKey].completion = progress.completion;
        newPillarData[pillarKey].score = progress.score;

        // Value changed, triggering save

        return {
          ...prev,
          application: {
            ...prev.application,
            pillarData: newPillarData,
            lastModified: new Date(),
          },
          hasUnsavedChanges: true,
        };
      });

      // Trigger immediate partial save for indicators (no debounce)
      savePartialChanges("indicator", { pillarId, indicatorId, value }, true);
    },
    [state.application, savePartialChanges]
  );

  // Update evidence
  const updateEvidence = useCallback(
    (pillarId: number, indicatorId: string, evidence: EvidenceData) => {
      if (!state.application) {
        console.error("❌ No application found in state");
        return;
      }

      const pillarKey = `pillar_${pillarId}`;

      setState((prev) => {
        if (!prev.application) {
          console.error("❌ No application in previous state");
          return prev;
        }

        const newPillarData = { ...prev.application.pillarData };

        if (!newPillarData[pillarKey]) {
          newPillarData[pillarKey] = {
            indicators: {},
            lastModified: new Date(),
            completion: 0,
            score: 0,
          };
        }

        // Ensure indicators object exists
        if (!newPillarData[pillarKey].indicators) {
          newPillarData[pillarKey].indicators = {};
        }

        if (!newPillarData[pillarKey].indicators[indicatorId]) {
          newPillarData[pillarKey].indicators[indicatorId] = {
            id: indicatorId,
            value: null,
            evidence: {},
            lastModified: new Date(),
          };
        }

        // Merge evidence data properly, preserving existing values
        const existingEvidence =
          newPillarData[pillarKey].indicators[indicatorId].evidence || {};

        const mergedEvidence = {
          ...existingEvidence,
          ...evidence,
          // Ensure _persisted flags are properly set
          text: evidence.text
            ? {
                ...evidence.text,
                _persisted: evidence.text._persisted || false,
              }
            : existingEvidence.text,
          link: evidence.link
            ? {
                ...evidence.link,
                _persisted: evidence.link._persisted || false,
              }
            : existingEvidence.link,
          file: evidence.file
            ? {
                ...evidence.file,
                _persisted: evidence.file._persisted || false,
              }
            : existingEvidence.file,
        };

        // Check if evidence actually changed
        const hasEvidenceChanged =
          JSON.stringify(existingEvidence) !== JSON.stringify(mergedEvidence);

        if (!hasEvidenceChanged) {
          return prev; // No change, don't trigger save
        }

        newPillarData[pillarKey] = {
          ...newPillarData[pillarKey],
          indicators: {
            ...newPillarData[pillarKey].indicators,
            [indicatorId]: {
              ...newPillarData[pillarKey].indicators[indicatorId],
              evidence: mergedEvidence,
              lastModified: new Date(),
            },
          },
          lastModified: new Date(),
        };

        // Recalculate pillar progress
        const progress = calculatePillarProgress(
          newPillarData[pillarKey],
          pillarId
        );
        newPillarData[pillarKey].completion = progress.completion;
        newPillarData[pillarKey].score = progress.score;

        // Evidence updated successfully

        return {
          ...prev,
          application: {
            ...prev.application,
            pillarData: newPillarData,
            lastModified: new Date(),
          },
          hasUnsavedChanges: true,
        };
      });

      // Trigger immediate partial save for evidence (no debounce)
      savePartialChanges("evidence", { pillarId, indicatorId, evidence }, true);
    },
    [state.application, savePartialChanges]
  );

  // Save all pending changes before navigation
  const saveAllPendingChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) {
      console.log("✅ No pending changes to save");
      return true;
    }

    console.log(`💾 Force saving ${pendingChanges.size} pending changes...`);

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      // Get current pending changes and clear them immediately
      const currentPendingChanges = new Map(pendingChanges);
      setPendingChanges(new Map());

      // Save each change individually with error handling
      let allSaved = true;
      const errors: string[] = [];

      for (const [changeKey, changeData] of currentPendingChanges) {
        try {
          const changeType = changeKey.startsWith("indicator_")
            ? "indicator"
            : changeKey.startsWith("evidence_")
            ? "evidence"
            : changeKey.startsWith("institution_")
            ? "institution"
            : "unknown";

          console.log(`🔄 Saving ${changeType}:`, changeData);

          const response = await fetch(
            `/api/applications/enhanced/${state.application?.id}/partial`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                changeType,
                changes: changeData,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error ||
                `Failed to save ${changeType}: ${response.status}`
            );
          }

          console.log(`✅ Successfully saved ${changeType}`);
        } catch (error: any) {
          console.error(`❌ Failed to save ${changeKey}:`, error);
          errors.push(`${changeKey}: ${error.message}`);
          allSaved = false;
        }
      }

      if (!allSaved) {
        console.error("❌ Some changes failed to save:", errors);
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: `Failed to save some changes: ${errors.join(", ")}`,
        }));
        return false;
      }

      // Update last saved state
      setLastSavedState(JSON.parse(JSON.stringify(state.application)));

      setState((prev) => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaveTime: new Date(),
        error: null,
      }));

      console.log("✅ All pending changes saved successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error saving pending changes:", error);

      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: error.message,
      }));

      toast({
        title: "Save Failed",
        description:
          "Failed to save changes before navigation. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  }, [pendingChanges, savePartialChanges, toast]);

  // Set current step - ENHANCED with debugging
  const setCurrentStep = useCallback(
    (step: number) => {
      console.log("🔍 setCurrentStep called:", {
        step,
        hasApplication: !!state.application,
      });
      if (!state.application) {
        console.log(
          "🔍 setCurrentStep: No application in state, cannot set step"
        );
        return;
      }

      console.log(
        "🔍 setCurrentStep: Setting step from",
        state.application.currentStep,
        "to",
        step
      );

      setState((prev) => ({
        ...prev,
        application: {
          ...prev.application!,
          currentStep: step,
        },
      }));
    },
    [state.application]
  );

  // Get pillar progress - ENHANCED with debugging
  const getPillarProgress = useCallback(
    (pillarId: number) => {
      if (!state.application) {
        console.log(
          `🔍 getPillarProgress(${pillarId}): No application in state`
        );
        return { completion: 0, score: 0 };
      }

      const pillarKey = `pillar_${pillarId}`;
      const pillarData = state.application.pillarData[pillarKey];

      if (!pillarData) {
        console.log(
          `🔍 getPillarProgress(${pillarId}): No pillar data for ${pillarKey}`
        );
        console.log(
          `🔍 Available pillar keys:`,
          Object.keys(state.application.pillarData)
        );
        return { completion: 0, score: 0 };
      }

      console.log(`🔍 getPillarProgress(${pillarId}): Found pillar data:`, {
        indicators: Object.keys(pillarData.indicators || {}),
        completion: pillarData.completion,
        score: pillarData.score,
      });

      // Calculate progress dynamically instead of using cached values
      const progress = calculatePillarProgress(pillarData, pillarId);
      console.log(
        `🔍 getPillarProgress(${pillarId}): Calculated progress:`,
        progress
      );

      return progress;
    },
    [state.application]
  );

  // Get overall progress - FIXED to calculate dynamically including institution setup
  const getOverallProgress = useCallback(() => {
    if (!state.application) return { completion: 0, score: 0 };

    // Check institution setup completion first
    const institutionComplete = !!(
      state.application.institutionData.name &&
      state.application.institutionData.industry &&
      state.application.institutionData.organizationSize &&
      state.application.institutionData.country &&
      state.application.institutionData.contactEmail
    );

    // Calculate progress across ALL 6 pillars (not just started ones)
    const totalPillars = 6;
    let totalCompletion = 0;
    let totalScore = 0;
    let pillarsWithData = 0;

    for (let pillarId = 1; pillarId <= totalPillars; pillarId++) {
      const pillarKey = `pillar_${pillarId}`;
      const pillarData = state.application.pillarData[pillarKey];

      if (pillarData) {
        // Calculate progress dynamically instead of using cached values
        const progress = calculatePillarProgress(pillarData, pillarId);
        totalCompletion += progress.completion;
        totalScore += progress.score;
        pillarsWithData++;
      }
      // If pillar doesn't exist, it contributes 0 to the total
    }

    // Calculate average completion and score
    // Include institution setup as part of overall progress
    const pillarProgress =
      pillarsWithData > 0 ? totalCompletion / pillarsWithData : 0;
    const institutionProgress = institutionComplete ? 100 : 0;

    // Weight institution setup as 10% and pillars as 90% of overall progress
    const result = {
      completion: institutionProgress * 0.1 + pillarProgress * 0.9,
      score: pillarsWithData > 0 ? totalScore / pillarsWithData : 0,
    };

    console.log(`🔍 getOverallProgress:`, {
      institutionComplete,
      institutionProgress,
      totalPillars,
      pillarsWithData,
      pillarProgress,
      pillarCompletions: Array.from({ length: totalPillars }, (_, i) => {
        const pillarKey = `pillar_${i + 1}`;
        const pillarData = state.application?.pillarData[pillarKey];
        if (pillarData) {
          const progress = calculatePillarProgress(pillarData, i + 1);
          return progress.completion;
        }
        return 0;
      }),
      totalCompletion,
      finalResult: result,
    });

    return result;
  }, [state.application]);

  // Check if can navigate to step
  const canNavigateToStep = useCallback(
    (step: number) => {
      if (!state.application) return false;

      // Step 0 (institution setup) is always accessible
      if (step === 0) return true;

      // Check if previous steps are completed
      for (let i = 0; i < step; i++) {
        if (i === 0) {
          // Check institution setup completion
          const inst = state.application.institutionData;
          const institutionComplete = !!(
            inst.name?.trim() &&
            inst.industry?.trim() &&
            inst.organizationSize?.trim() &&
            inst.country?.trim() &&
            inst.contactEmail?.trim()
          );
          if (!institutionComplete) return false;
          continue;
        }

        const pillarId = i;
        const progress = getPillarProgress(pillarId);
        if (progress.completion < 100) return false;
      }

      return true;
    },
    [state.application, getPillarProgress]
  );

  // Get next incomplete step with enhanced validation
  const getNextIncompleteStep = useCallback(
    (application?: ApplicationData) => {
      const app = application || state.application;
      if (!app) {
        console.log(
          "❌ No application data available for getNextIncompleteStep"
        );
        return 0;
      }

      console.log("🔍 getNextIncompleteStep called with app:", {
        id: app.id,
        hasInstitutionData: !!app.institutionData,
        pillarKeys: Object.keys(app.pillarData || {}),
      });

      const result = getNextIncompleteStepHelper(app);
      console.log("🎯 getNextIncompleteStep result:", result);
      return result;
    },
    [state.application]
  );

  // Enhanced data validation function
  const validateApplicationData = useCallback(
    (app: ApplicationData): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validate institution data
      if (!app.institutionData.name || app.institutionData.name.trim() === "") {
        errors.push("Institution name is required");
      }
      if (
        !app.institutionData.industry ||
        app.institutionData.industry.trim() === ""
      ) {
        errors.push("Industry is required");
      }
      if (
        !app.institutionData.organizationSize ||
        app.institutionData.organizationSize.trim() === ""
      ) {
        errors.push("Organization size is required");
      }
      if (
        !app.institutionData.country ||
        app.institutionData.country.trim() === ""
      ) {
        errors.push("Country is required");
      }
      if (
        !app.institutionData.contactEmail ||
        app.institutionData.contactEmail.trim() === ""
      ) {
        errors.push("Contact email is required");
      }

      // Validate pillar data structure
      if (app.pillarData) {
        Object.entries(app.pillarData).forEach(([pillarKey, pillarData]) => {
          if (!pillarData.indicators) {
            errors.push(`${pillarKey} is missing indicators data`);
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Submit application
  const submitApplication = useCallback(async () => {
    if (!state.application) return;

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      const response = await fetch(
        `/api/applications/enhanced/${state.application.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "submitted",
            institutionData: state.application.institutionData,
            pillarData: state.application.pillarData,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit application");

      setState((prev) => ({
        ...prev,
        application: {
          ...prev.application!,
          status: "submitted",
          submittedAt: new Date(),
          lastSaved: new Date(),
        },
        isSaving: false,
        hasUnsavedChanges: false,
      }));

      toast({
        title: "Application Submitted",
        description:
          "Your application has been submitted successfully. Redirecting to dashboard...",
      });

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000); // 2 second delay to show the toast
    } catch (error) {
      console.error("Submit error:", error);
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      }));
    }
  }, [state.application, toast]);

  // Utility functions
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Load application on mount and when session changes - OPTIMIZED
  useEffect(() => {
    if (session?.user?.email && !state.application && !state.isLoading) {
      console.log(
        "🔄 Loading application on mount for user:",
        session.user?.email || "unknown"
      );
      // Use a small delay to prevent race conditions
      const timeoutId = setTimeout(() => {
        loadApplication();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [
    session?.user?.email,
    state.application,
    state.isLoading,
    loadApplication,
  ]);

  // REMOVED: Real-time progress update effect that was causing save loops
  // Progress is now calculated dynamically in getPillarProgress function

  // Debounced refresh function to prevent rapid successive refreshes
  const debouncedRefresh = useCallback(() => {
    if (loadDebounceRef.current) {
      clearTimeout(loadDebounceRef.current);
    }

    loadDebounceRef.current = setTimeout(() => {
      refreshApplicationDataInternal();
    }, 1000); // 1 second debounce for refreshes
  }, []);

  // Internal refresh function
  const refreshApplicationDataInternal = useCallback(async () => {
    if (state.application?.id) {
      console.log("🔄 Refreshing application data...");
      try {
        const response = await fetch(
          `/api/applications/enhanced/${state.application.id}`
        );
        if (response.ok) {
          const { data: app } = await response.json();

          // Update application with fresh data
          setState((prev) => ({
            ...prev,
            application: {
              ...prev.application!,
              pillarData: app.pillarData || {},
              lastSaved: new Date(app.lastSaved),
              lastModified: new Date(app.lastModified),
            },
            hasUnsavedChanges: false,
          }));

          console.log("✅ Application data refreshed successfully");
        }
      } catch (error) {
        console.error("❌ Failed to refresh application data:", error);
      }
    }
  }, [state.application?.id]);

  // Public refresh function - uses debounced version
  const refreshApplicationData = useCallback(async () => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  // Debug function to check data state
  const debugDataState = useCallback(() => {
    console.log("🔍 DEBUG: Current application state:", {
      hasApplication: !!state.application,
      applicationId: state.application?.id,
      hasUnsavedChanges: state.hasUnsavedChanges,
      isSaving: state.isSaving,
      isLoading: state.isLoading,
      isOnline: state.isOnline,
      pillarDataKeys: state.application
        ? Object.keys(state.application.pillarData || {})
        : [],
      pillar1Data: state.application?.pillarData?.pillar_1
        ? {
            indicatorsCount: Object.keys(
              state.application.pillarData.pillar_1.indicators || {}
            ).length,
            completion: state.application.pillarData.pillar_1.completion,
            score: state.application.pillarData.pillar_1.score,
            sampleIndicator: Object.keys(
              state.application.pillarData.pillar_1.indicators || {}
            )[0],
          }
        : null,
    });

    // Debug evidence specifically
    if (state.application?.pillarData) {
      console.log("🔍 DEBUG: Evidence data across all pillars:");
      Object.entries(state.application.pillarData).forEach(
        ([pillarKey, pillarData]) => {
          if (pillarData.indicators) {
            Object.entries(pillarData.indicators).forEach(
              ([indicatorId, indicator]) => {
                if (
                  indicator.evidence &&
                  Object.keys(indicator.evidence).length > 0
                ) {
                  console.log(`  ${pillarKey}.${indicatorId}:`, {
                    evidence: indicator.evidence,
                    hasText: !!indicator.evidence.text?.description,
                    hasLink: !!indicator.evidence.link?.url,
                    hasFile: !!indicator.evidence.file?.fileName,
                  });
                }
              }
            );
          }
        }
      );
    }
  }, [state]);

  // Database validation function
  const validateFromDatabase = useCallback(
    async (
      step: number
    ): Promise<{ isValid: boolean; missingItems: string[] }> => {
      if (!state.application) {
        return { isValid: false, missingItems: ["No application found"] };
      }

      try {
        const response = await fetch(
          `/api/applications/enhanced/${state.application.id}/validate?step=${step}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate from database");
        }

        const result = await response.json();
        return result;
      } catch (error: any) {
        console.error("❌ Error validating from database:", error);
        return { isValid: false, missingItems: ["Validation failed"] };
      }
    },
    [state.application]
  );

  // Expose enhanced functions in context
  const contextValue: ApplicationContextType = {
    state,
    loadApplication,
    saveApplication,
    submitApplication,
    updateInstitution,
    updateIndicator,
    updateEvidence,
    setCurrentStep,
    clearError,
    getPillarProgress,
    getOverallProgress,
    canNavigateToStep,
    getNextIncompleteStep,
    refreshApplicationData, // Add refresh function
    debugDataState, // Add debug function
    saveAllPendingChanges, // Add save all pending changes function
    validateFromDatabase, // Add database validation function
    validateApplicationData, // Add enhanced data validation function
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Hook to use the application context
export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useApplication must be used within an ApplicationProvider"
    );
  }
  return context;
}
