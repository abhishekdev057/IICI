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

// Helper function to reconstruct evidence data from database format
const reconstructEvidenceData = (indicators: any[]): any => {
  const evidenceData: any = {};
  
  indicators.forEach((indicator) => {
    if (indicator.evidence && indicator.evidence.length > 0) {
      const evidence = indicator.evidence[0]; // Take the first evidence record
      evidenceData[indicator.indicatorId] = {
        type: evidence.type === 'FILE' ? 'file' : evidence.type === 'LINK' ? 'link' : 'text',
        description: evidence.description || '',
        url: evidence.url || '',
        fileName: evidence.fileName || '',
        fileSize: evidence.fileSize || null,
        fileType: evidence.fileType || null
      };
    }
  });
  
  return evidenceData;
};

// Helper functions for indicator data
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
};

const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    "1.1.a": 2,
    "1.1.c": 2,
    "3.1.1": 5,
    "3.4.1": 5,
    "4.1.1": 5,
    "4.4.2": 5,
    "5.1.1": 5,
    "5.2.2": 5,
    "6.2.1": 3
  }
  return definitions[indicatorId as keyof typeof definitions] || 100 // Default for percentages
};

const calculateOverallScores = (pillarData: any) => {
  if (!pillarData) return { overallScore: 0, certificationLevel: "NOT_CERTIFIED" };

  let totalScore = 0;
  let pillarCount = 0;
  const pillarScores = [];

  // Calculate scores for each pillar (1-6)
  for (let i = 1; i <= 6; i++) {
    const pillarKey = `pillar_${i}`;
    const pillar = pillarData[pillarKey];
    
    if (pillar && typeof pillar === 'object' && pillar.stats && pillar.stats.averageScore) {
      const score = Math.min(pillar.stats.averageScore, 100); // Cap at 100%
      pillarScores.push(score);
      totalScore += score;
      pillarCount++;
    } else {
      pillarScores.push(0);
    }
  }

  const overallScore = pillarCount > 0 ? Math.min(totalScore / pillarCount, 100) : 0; // Cap at 100%

  let certificationLevel = "NOT_CERTIFIED";
  if (overallScore >= 80) certificationLevel = "GOLD";
  else if (overallScore >= 60) certificationLevel = "CERTIFIED";

  return {
    overallScore,
    certificationLevel,
    pillarScores
  };
};

// Institution data interface
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
}

// Application state interface
export interface ApplicationData {
  id: string;
  institutionData: InstitutionData;
  pillarData: { [key: string]: any };
  evidence: { [key: string]: any };
  scores: any;
  status: "draft" | "submitted" | "under_review" | "certified";
  submittedAt?: Date;
  lastSaved: Date;
}

// Data context state - PRODUCTION READY
interface DataState {
  currentApplication: ApplicationData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaveTime: Date | null;
  isOnline: boolean;
}

// Create context
const DataContext = createContext<{
  state: DataState;
  // Actions
  loadApplication: () => Promise<void>;
  saveApplication: () => Promise<void>;
  submitApplication: () => Promise<void>;
  // Updates
  updateInstitution: (data: Partial<InstitutionData>) => void;
  updatePillar: (pillarId: string, data: any) => void;
  updateEvidence: (pillarId: string, indicatorId: string, evidence: any) => void;
  // Utilities
  clearError: () => void;
  startFresh: () => void;
  calculateScores: () => void;
} | null>(null);

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Helper to update state safely - DEFINED FIRST
  const updateState = useCallback((updates: Partial<DataState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // State - PRODUCTION READY WITH NETWORK STATUS
  const [state, setState] = useState<DataState>({
    currentApplication: null,
    isLoading: false,
    isSaving: false,
    error: null,
    lastSaveTime: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  // Network status monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => updateState({ isOnline: true });
    const handleOffline = () => updateState({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateState]);

  // Track if we're currently loading to prevent duplicate requests
  const [isLoadingRef, setIsLoadingRef] = useState(false);
  const hasAttemptedLoad = useRef(false);

  // Load application with deduplication
  const loadApplication = useCallback(async () => {
    if (!session?.user || isLoadingRef) return;

    console.log("🔄 Loading application data for user:", session.user.email);
    // Prevent duplicate requests
    setIsLoadingRef(true);

    try {
      updateState({ isLoading: true, error: null });

      // First try to load dashboard data (comprehensive)
      const dashboardResponse = await fetch("/api/dashboard");
      
      if (dashboardResponse.ok) {
        const { data: dashboardData } = await dashboardResponse.json();
        
        const applicationData: ApplicationData = {
          id: dashboardData.application.id,
          institutionData: dashboardData.institutionData || {
            name: "",
            industry: "",
            organizationSize: "",
            country: "",
            contactEmail: "",
          },
          pillarData: dashboardData.pillarData || {},
          evidence: reconstructEvidenceData(dashboardData.indicators),
          scores: dashboardData.scores,
          status: dashboardData.application.status?.toLowerCase() || "draft",
          submittedAt: dashboardData.application.submittedAt,
          lastSaved: new Date(dashboardData.application.updatedAt || Date.now()),
        };
        
        updateState({ 
          currentApplication: applicationData,
          isLoading: false,
          lastSaveTime: new Date(dashboardData.application.updatedAt || Date.now())
        });
        return;
      }
      
      // Fallback to basic applications API
      const response = await fetch("/api/applications");
      
      if (response.status === 400) {
        // Session invalid - redirect to auth
        const errorData = await response.json();
        console.error("❌ Session error:", errorData);
        
        toast({
          title: "Session Error",
          description: "Please sign out and sign back in to continue.",
          variant: "destructive",
        });
        
        updateState({ 
          error: "Session invalid. Please sign out and sign back in.",
          isLoading: false 
        });
        setIsLoadingRef(false);
        return;
      }
      
      if (response.ok) {
        const { data: applications } = await response.json();

        if (applications && applications.length > 0) {
          const latest = applications[0];
          
          const applicationData: ApplicationData = {
            id: latest.id,
            institutionData: latest.institutionData || {
              name: "",
              industry: "",
              organizationSize: "",
              country: "",
              contactEmail: "",
            },
            pillarData: latest.pillarData || {},
            evidence: reconstructEvidenceData(latest.indicatorResponses || []),
            scores: latest.scoreAudits?.[0]?.scoreData || null,
            status: latest.status?.toLowerCase() || "draft",
            submittedAt: latest.submittedAt,
            lastSaved: new Date(latest.updatedAt || Date.now()),
          };
          
          updateState({ 
            currentApplication: applicationData,
            isLoading: false,
            lastSaveTime: new Date(latest.updatedAt || Date.now())
          });
        } else {
          // Create new application
          const createResponse = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              institutionData: {
                name: "",
                industry: "",
                organizationSize: "",
                country: "",
                contactEmail: "",
              },
            }),
          });

          if (createResponse.ok) {
            const { data: newApp } = await createResponse.json();
            const applicationData: ApplicationData = {
              id: newApp.id,
              institutionData: newApp.institutionData,
              pillarData: {},
              evidence: {},
              scores: null,
              status: "draft",
              lastSaved: new Date(),
            };
            
            updateState({ 
              currentApplication: applicationData,
              isLoading: false 
            });
          }
        }
      } else {
        throw new Error("Failed to load application");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("❌ Load error:", error);
      console.error("❌ Error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        user: session?.user?.email
      });
      updateState({ 
        error: `Failed to load application: ${errorMessage}. Please refresh the page.`,
        isLoading: false 
      });
    } finally {
      // Always reset the loading flag
      setIsLoadingRef(false);
    }
  }, [session?.user, updateState, isLoadingRef]);

  // Save application with retry logic - PRODUCTION READY
  const saveApplication = useCallback(async (retryCount = 0) => {
    if (!state.currentApplication || !session?.user || state.isSaving) return;

    // Check network status
    if (!state.isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    
    try {
      updateState({ isSaving: true, error: null });

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Prepare indicator responses for database
      const indicatorResponses: Array<{
        indicatorId: string;
        pillarId: number;
        rawValue: any;
        normalizedScore: number;
        measurementUnit: string;
        hasEvidence: boolean;
        evidence?: any;
      }> = [];
      
      if (state.currentApplication.pillarData) {
        console.log('Pillar data structure:', state.currentApplication.pillarData);
        Object.entries(state.currentApplication.pillarData).forEach(([pillarKey, pillarData]) => {
          const pillarId = parseInt(pillarKey.replace('pillar_', ''));
          console.log(`Processing pillar ${pillarId}:`, pillarData);
          if (pillarData && typeof pillarData === 'object' && (pillarData as any).indicators) {
            Object.entries((pillarData as any).indicators).forEach(([indicatorId, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                // Calculate normalized score based on measurement unit
                let normalizedScore = 0;
                const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
                
                if (measurementUnit.includes("Score")) {
                  const maxScore = getIndicatorMaxScore(indicatorId);
                  normalizedScore = Math.min(((value as number) / maxScore) * 100, 100);
                } else if (measurementUnit.includes("Percentage")) {
                  normalizedScore = Math.min(value as number, 100); // Cap percentage at 100%
                } else if (measurementUnit === "Number") {
                  // Normalize based on example (200 ideas = 100%)
                  normalizedScore = Math.min(((value as number) / 200) * 100, 100);
                }

                // Check if evidence exists for this indicator
                // First check pillar-specific evidence (from pillar form)
                const pillarEvidence = (pillarData as any).evidence?.[indicatorId];
                // Then check global evidence (from updateEvidence function)
                const evidenceKey = `${pillarId}_${indicatorId}`;
                const globalEvidence = state.currentApplication?.evidence?.[evidenceKey];
                
                // Use pillar evidence if available, otherwise use global evidence
                const evidenceData = pillarEvidence || globalEvidence;
                const hasEvidence = !!(evidenceData && (evidenceData.description || evidenceData.url || evidenceData.fileName));

                if (hasEvidence) {
                  console.log(`Evidence found for indicator ${indicatorId}:`, evidenceData);
                }

                indicatorResponses.push({
                  indicatorId,
                  pillarId,
                  rawValue: value,
                  normalizedScore,
                  measurementUnit,
                  hasEvidence: hasEvidence,
                  evidence: evidenceData // Include evidence data
                });
              }
            });
          }
        });
      }

      // Calculate overall scores
      const scores = calculateOverallScores(state.currentApplication.pillarData);

      const response = await fetch(`/api/applications/${state.currentApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionData: state.currentApplication.institutionData,
          pillarData: state.currentApplication.pillarData,
          indicatorResponses,
          scores
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const now = new Date();
        updateState({ 
          isSaving: false,
          lastSaveTime: now 
        });
        
        // Only show toast on manual save or first auto-save
        if (retryCount === 0) {
          toast({
            title: "Saved Successfully!",
            description: "Your progress has been saved.",
            variant: "default",
          });
        }
      } else if (response.status >= 500 && retryCount < 2) {
        // Retry on server errors
        setTimeout(() => saveApplication(retryCount + 1), 1000 * (retryCount + 1));
        return;
      } else {
        throw new Error(`Save failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      
      // Clear timeout to prevent memory leaks
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was aborted (timeout or manual abort)
          if (retryCount < 2) {
            console.log(`Save aborted, retrying... (attempt ${retryCount + 1})`);
            setTimeout(() => saveApplication(retryCount + 1), 1000 * (retryCount + 1));
            return;
          } else {
            updateState({ 
              error: "Save timed out. Please check your connection and try again.",
              isSaving: false 
            });
            
            toast({
              title: "Save Timed Out",
              description: "The save operation took too long. Please check your connection and try again.",
              variant: "destructive",
            });
            return;
          }
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          // Network-related errors
          if (retryCount < 2) {
            console.log(`Network error, retrying... (attempt ${retryCount + 1})`);
            setTimeout(() => saveApplication(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
        }
      }
      
      // Generic error handling
      updateState({ 
        error: "Failed to save. Please try again.",
        isSaving: false 
      });
      
      toast({
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  }, [state.currentApplication, state.isSaving, state.isOnline, session?.user, updateState, toast]);

  // Submit application
  const submitApplication = useCallback(async () => {
    if (!state.currentApplication || !session?.user) return;

    try {
      updateState({ isLoading: true, error: null });

      // Save first
      await saveApplication();

      // Then submit
      const response = await fetch(`/api/applications/${state.currentApplication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "submitted" }),
      });

      if (response.ok) {
        // Update local state to reflect the submitted status
        setState(prevState => ({
          ...prevState,
          currentApplication: prevState.currentApplication ? {
            ...prevState.currentApplication,
            status: "submitted",
            submittedAt: new Date()
          } : null,
          isLoading: false
        }));
        
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error("Submit error:", error);
      updateState({ 
        error: "Failed to submit application.",
        isLoading: false 
      });
    }
  }, [state.currentApplication, session?.user, saveApplication, updateState, toast]);

  // Update institution data
  const updateInstitution = useCallback((data: Partial<InstitutionData>) => {
    setState(prevState => {
      if (!prevState.currentApplication) return prevState;
      
      return {
        ...prevState,
        currentApplication: {
          ...prevState.currentApplication,
          institutionData: {
            ...prevState.currentApplication.institutionData,
            ...data,
          },
        }
      };
    });
  }, []);

  // Update pillar data
  const updatePillar = useCallback((pillarId: string, data: any) => {
    setState(prevState => {
      if (!prevState.currentApplication) return prevState;
      
      return {
        ...prevState,
        currentApplication: {
          ...prevState.currentApplication,
          pillarData: {
            ...prevState.currentApplication.pillarData,
            [pillarId]: data,
          },
        }
      };
    });
  }, []);

  // Update evidence
  const updateEvidence = useCallback((pillarId: string, indicatorId: string, evidence: any) => {
    setState(prevState => {
      if (!prevState.currentApplication) return prevState;
      
      const evidenceKey = `${pillarId}_${indicatorId}`;
      return {
        ...prevState,
        currentApplication: {
          ...prevState.currentApplication,
          evidence: {
            ...prevState.currentApplication.evidence,
            [evidenceKey]: evidence,
          },
        }
      };
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Start fresh
  const startFresh = useCallback(() => {
    if (confirm("Are you sure you want to start fresh? This will clear all your data.")) {
      loadApplication();
    }
  }, [loadApplication]);

  // Calculate scores
  const calculateScores = useCallback(() => {
    if (!state.currentApplication?.pillarData) return;

    try {
      // For now, just set a placeholder score until we implement proper score calculation
      const scores = {
        pillars: [],
        overallScore: 0,
        certificationLevel: "Not Certified" as const,
        recommendations: ["Complete your assessment to calculate scores."]
      };
      
      updateState({ 
        currentApplication: {
          ...state.currentApplication,
          scores: scores
        }
      });
    } catch (error) {
      console.error("Error calculating scores:", error);
    }
  }, [state.currentApplication, updateState]);

  // Load application when session is available - ONLY ONCE
  useEffect(() => {
    if (session?.user && !state.currentApplication && !state.isLoading && !hasAttemptedLoad.current) {
      hasAttemptedLoad.current = true;
      loadApplication();
    }
  }, [session?.user, state.currentApplication, state.isLoading]);

  return (
    <DataContext.Provider
      value={{
        state,
        loadApplication,
        saveApplication,
        submitApplication,
        updateInstitution,
        updatePillar,
        updateEvidence,
        clearError,
        startFresh,
        calculateScores,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}