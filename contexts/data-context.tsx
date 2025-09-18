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
      // Combine multiple evidence rows (text/link/file)
      const frontendEvidence: any = {};

      indicator.evidence.forEach((ev: any) => {
        if (ev.type === 'FILE' && (ev.fileName || ev.url)) {
          frontendEvidence.file = {
            fileName: ev.fileName || '',
            fileSize: ev.fileSize || null,
            fileType: ev.fileType || null,
            url: ev.url || '',
            description: ev.description || '',
            _persisted: true
          };
        } else if (ev.type === 'LINK' && ev.url) {
          // Treat URL-containing LINK as link evidence
          frontendEvidence.link = {
            url: ev.url || '',
            description: ev.description || '',
            _persisted: true
          };
        } else if (ev.type === 'LINK' && ev.description && !ev.url) {
          // Treat description-only LINK as text evidence
          frontendEvidence.text = {
            description: ev.description || '',
            _persisted: true
          };
        }
      });

      // Key global evidence by pillarId_indicatorId to match save logic
      const pillarIdPart = indicator.pillarId ?? indicator.pillar_id ?? indicator.pillar ?? ''
      const evidenceKey = pillarIdPart !== '' ? `${pillarIdPart}_${indicator.indicatorId}` : indicator.indicatorId
      evidenceData[evidenceKey] = frontendEvidence;
    }
  });
  
  return evidenceData;
};

// Helper functions for indicator data
const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    // Pillar 1
    "1.1.1": "Score (0-2)",
    "1.1.3": "Score (0-2)",
    "1.2.1": "Binary (0-1)",
    "1.2.4": "Score (1-5)",
    "1.3.1": "Score (0-3)",
    "1.3.3": "Score (0-2)",
    "1.4.1": "Score (0-3)",
    "1.4.3": "Binary (0-1)",
    "1.4.4": "Score (0-2)",
    
    // Pillar 2
    "2.1.3": "Score (1-5)",
    "2.2.3": "Hours per employee",
    "2.2.4": "Score (0-3)",
    "2.3.2": "Score (1-5)",
    "2.3.4": "Score (1-5)",
    
    // Pillar 3
    "3.1.1": "Score (1-5)",
    "3.1.4": "Score (1-5)",
    "3.2.1": "Number",
    "3.2.3": "Binary (0-1)",
    "3.3.2": "Number",
    "3.3.3": "Number",
    "3.4.1": "Score (1-5)",
    "3.4.3": "Score (0-3)",
    "3.4.4": "Score (1-5)",
    
    // Pillar 4
    "4.1.1": "Score (1-5)",
    "4.1.2": "Ratio",
    "4.2.2": "Score (1-5)",
    "4.3.1": "Score (0-3)",
    "4.4.2": "Score (1-5)",
    "4.4.3": "Score (1-5)",
    
    // Pillar 5
    "5.1.1": "Score (1-5)",
    "5.1.4": "Number",
    "5.1.5": "Score (0-3)",
    "5.2.2": "Score (1-5)",
    
    // Pillar 6
    "6.1.3": "Score (1-5)",
    "6.2.1": "Score (0-3)",
    "6.2.2": "Number",
    "6.2.3": "Score (1-5)",
    "6.3.3": "Number"
  }
  return definitions[indicatorId as keyof typeof definitions] || "Percentage (%)"
};

const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    // Pillar 1
    "1.1.1": 2,
    "1.1.3": 2,
    "1.2.1": 1,
    "1.2.4": 5,
    "1.3.1": 3,
    "1.3.3": 2,
    "1.4.1": 3,
    "1.4.3": 1,
    "1.4.4": 2,
    
    // Pillar 2
    "2.1.3": 5,
    "2.2.3": 40, // hours
    "2.2.4": 3,
    "2.3.2": 5,
    "2.3.4": 5,
    
    // Pillar 3
    "3.1.1": 5,
    "3.1.4": 5,
    "3.2.1": 200, // ideas
    "3.2.3": 1,
    "3.3.2": 5, // adaptations
    "3.3.3": 5, // iterations
    "3.4.1": 5,
    "3.4.3": 3,
    "3.4.4": 5,
    
    // Pillar 4
    "4.1.1": 5,
    "4.1.2": 1, // ratio
    "4.2.2": 5,
    "4.3.1": 3,
    "4.4.2": 5,
    "4.4.3": 5,
    
    // Pillar 5
    "5.1.1": 5,
    "5.1.4": 5, // events
    "5.1.5": 3,
    "5.2.2": 5,
    
    // Pillar 6
    "6.1.3": 5,
    "6.2.1": 3,
    "6.2.2": 2, // audits
    "6.2.3": 5,
    "6.3.3": 4 // updates
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

  // Add error boundary for the provider
  const [providerError, setProviderError] = useState<string | null>(null);

  if (providerError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Data Provider Error</h2>
          <p className="text-muted-foreground mb-4">{providerError}</p>
          <button 
            onClick={() => setProviderError(null)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Helper to update state safely - DEFINED FIRST - FIXED TO PREVENT RECREATION
  const updateState = useCallback((updates: Partial<DataState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []); // FIXED: Empty dependency array to prevent recreation

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

  // Load application with deduplication - OPTIMIZED FOR PERFORMANCE
  const loadApplication = useCallback(async () => {
    if (!session?.user || isLoadingRef) return;

    console.log("🔄 Loading application data for user:", session.user.email);
    // Prevent duplicate requests
    setIsLoadingRef(true);

    try {
      updateState({ isLoading: true, error: null });

      // OPTIMIZED: Single API call instead of multiple
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
          
          // OPTIMIZED: Simplified data processing
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
        // Gracefully handle load failures without throwing
        updateState({ 
          error: "Failed to load application",
          isLoading: false 
        });
        return;
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
  }, [session?.user?.email, updateState]); // FIXED: Removed isLoadingRef dependency

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

    try {
      updateState({ isSaving: true, error: null });

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
          
          // Skip invalid pillar IDs
          if (!pillarId || isNaN(pillarId)) {
            console.log(`Skipping invalid pillar key:`, pillarKey);
            return;
          }
          
          console.log(`Processing pillar ${pillarId}:`, pillarData);
          console.log(`Pillar ${pillarId} evidence:`, (pillarData as any).evidence);
          if (pillarData && typeof pillarData === 'object') {
            const indicatorsMap = (pillarData as any).indicators || {};
            Object.entries(indicatorsMap).forEach(([indicatorId, value]) => {
              // Skip invalid indicator IDs
              if (!indicatorId || indicatorId === 'undefined' || indicatorId === 'null') {
                console.log(`Skipping invalid indicator ID:`, indicatorId);
                return;
              }

              // Calculate normalized score based on measurement unit if value exists
              let normalizedScore = 0;
              const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
              if (value !== undefined && value !== null && value !== "") {
                if (measurementUnit.includes("Score")) {
                  const maxScore = getIndicatorMaxScore(indicatorId);
                  normalizedScore = Math.min(((value as number) / maxScore) * 100, 100);
                } else if (measurementUnit.includes("Percentage")) {
                  normalizedScore = Math.min(value as number, 100); // Cap percentage at 100%
                } else if (measurementUnit === "Number") {
                  // Normalize based on example (200 ideas = 100%)
                  normalizedScore = Math.min(((value as number) / 200) * 100, 100);
                }
              }

              // Resolve evidence for this indicator
              const pillarEvidence = (pillarData as any).evidence?.[indicatorId];
              const evidenceKey = `${pillarId}_${indicatorId}`;
              const globalEvidence = state.currentApplication?.evidence?.[evidenceKey];
              const evidenceData = pillarEvidence || globalEvidence;

              // Check for evidence content
              const hasEvidence = !!(evidenceData && (
                (evidenceData.text?.description && evidenceData.text.description.trim() !== '') ||
                (evidenceData.link?.url && evidenceData.link.url.trim() !== '') ||
                (evidenceData.file?.fileName && evidenceData.file.fileName.trim() !== '') ||
                // Fallback for old format
                (evidenceData.description && evidenceData.description.trim() !== '') || 
                (evidenceData.url && evidenceData.url.trim() !== '') || 
                (evidenceData.fileName && evidenceData.fileName.trim() !== '')
              ));

              // If neither value nor evidence, skip this indicator
              if (!hasEvidence && (value === undefined || value === null || value === "")) {
                return;
              }

              const evidenceToSave = evidenceData || null;
              if (evidenceToSave) {
                console.log(`Evidence to save for indicator ${indicatorId}:`, evidenceToSave);
              }

              indicatorResponses.push({
                indicatorId,
                pillarId,
                rawValue: (value !== undefined && value !== null && value !== "") ? value : null,
                normalizedScore,
                measurementUnit,
                hasEvidence: hasEvidence,
                evidence: evidenceToSave
              });
            });

            // Also include indicators that exist only in evidence map (no value entered)
            const pillarEvidenceMap = (pillarData as any).evidence || {};
            Object.keys(pillarEvidenceMap).forEach((indicatorId) => {
              if ((indicatorId in indicatorsMap) === true) return;
              if (!indicatorId || indicatorId === 'undefined' || indicatorId === 'null') return;

              const evidenceData = pillarEvidenceMap[indicatorId];
              const hasEvidence = !!(evidenceData && (
                (evidenceData.text?.description && evidenceData.text.description.trim() !== '') ||
                (evidenceData.link?.url && evidenceData.link.url.trim() !== '') ||
                (evidenceData.file?.fileName && evidenceData.file.fileName.trim() !== '') ||
                (evidenceData.description && evidenceData.description.trim() !== '') || 
                (evidenceData.url && evidenceData.url.trim() !== '') || 
                (evidenceData.fileName && evidenceData.fileName.trim() !== '')
              ));
              if (!hasEvidence) return;

              const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
              indicatorResponses.push({
                indicatorId,
                pillarId,
                rawValue: null,
                normalizedScore: 0,
                measurementUnit,
                hasEvidence: true,
                evidence: evidenceData
              });
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
        })
      });


      if (response.ok) {
        const now = new Date();
        updateState({ 
          isSaving: false,
          lastSaveTime: now 
        });

        // Optimistic: immediately mark saved evidence as persisted so UI ticks appear
        try {
          const nextApp = { ...state.currentApplication } as any
          const nextPillarData = { ...nextApp.pillarData }
          const nextGlobalEvidence = { ...(nextApp.evidence || {}) }

          indicatorResponses.forEach((resp) => {
            const { pillarId, indicatorId, evidence } = resp as any
            if (!pillarId || !indicatorId || !evidence) return
            const pillarKey = `pillar_${pillarId}`
            const evidenceKey = `${pillarId}_${indicatorId}`

            // Build optimistic persisted evidence
            const fev: any = {}
            if (evidence.text?.description && evidence.text.description.trim() !== '') {
              fev.text = { description: evidence.text.description, _persisted: true }
            }
            if (evidence.link?.url && evidence.link.url.trim() !== '') {
              fev.link = { url: evidence.link.url, description: evidence.link.description || '', _persisted: true }
            }
            if (evidence.file?.fileName) {
              fev.file = {
                fileName: evidence.file.fileName,
                fileSize: evidence.file.fileSize || null,
                fileType: evidence.file.fileType || null,
                url: evidence.file.url || '',
                description: evidence.file.description || '',
                _persisted: true,
              }
            }

            // Write into pillar structure
            if (!nextPillarData[pillarKey]) nextPillarData[pillarKey] = { indicators: {}, evidence: {} }
            const pe = nextPillarData[pillarKey].evidence || {}
            nextPillarData[pillarKey] = {
              ...(nextPillarData[pillarKey] || {}),
              evidence: {
                ...pe,
                [indicatorId]: { ...(pe[indicatorId] || {}), ...fev },
              },
            }

            // Write into global evidence map
            nextGlobalEvidence[evidenceKey] = { ...(nextGlobalEvidence[evidenceKey] || {}), ...fev }
          })

          updateState({
            currentApplication: {
              ...state.currentApplication!,
              pillarData: nextPillarData,
              evidence: nextGlobalEvidence,
            },
          })
        } catch {}

        // After save, refresh persisted evidence from backend so UI ticks reflect DB
        try {
          const appId = state.currentApplication.id;
          const refreshRes = await fetch(`/api/applications/${appId}`);
          if (refreshRes.ok) {
            const { data: appData } = await refreshRes.json();
            const refreshedEvidence = reconstructEvidenceData(appData?.indicatorResponses || []);

            // Rebuild pillar evidence from appData.indicatorResponses if present
            const reconstructedPillarData: any = { ...state.currentApplication.pillarData };
            if (appData?.indicatorResponses) {
              appData.indicatorResponses.forEach((indicator: any) => {
                const pillarKey = `pillar_${indicator.pillarId}`;
                if (!reconstructedPillarData[pillarKey]) {
                  reconstructedPillarData[pillarKey] = { indicators: {}, evidence: {} };
                }
                const frontendEvidence: any = {};
                (indicator.evidence || []).forEach((ev: any) => {
                  if (ev.type === 'FILE' && (ev.fileName || ev.url)) {
                    frontendEvidence.file = {
                      fileName: ev.fileName || '',
                      fileSize: ev.fileSize || null,
                      fileType: ev.fileType || null,
                      url: ev.url || '',
                      description: ev.description || '',
                      _persisted: true
                    };
                  } else if (ev.type === 'LINK' && ev.url) {
                    frontendEvidence.link = {
                      url: ev.url || '',
                      description: ev.description || '',
                      _persisted: true
                    };
                  } else if (ev.type === 'LINK' && ev.description && !ev.url) {
                    frontendEvidence.text = {
                      description: ev.description || '',
                      _persisted: true
                    };
                  }
                });
                if (Object.keys(frontendEvidence).length > 0) {
                  reconstructedPillarData[pillarKey].evidence[indicator.indicatorId] = frontendEvidence;
                }
              });
            }

            updateState({
              currentApplication: {
                ...state.currentApplication,
                pillarData: reconstructedPillarData,
                evidence: refreshedEvidence,
              }
            });
          }
        } catch (e) {
          // ignore refresh errors
        }

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
        // Do not throw; surface error via state/toast
        updateState({ isSaving: false });
        toast({
          title: "Save Failed",
          description: `Failed to save your progress (code ${response.status}).`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Save error:", error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
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

        // Set a cookie flag so middleware can allow /dashboard immediately
        try {
          document.cookie = `iiici_app_submitted=true; path=/; max-age=${60 * 60 * 2}`
        } catch {}
        
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted successfully.",
          variant: "default",
        });
      } else {
        updateState({ isLoading: false, error: "Failed to submit" });
        toast({
          title: "Submission Failed",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
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
    console.log(`updatePillar called with pillarId: ${pillarId}, data:`, data);
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
    console.log(`updateEvidence called - pillarId: ${pillarId}, indicatorId: ${indicatorId}, evidence:`, evidence);
    
    setState(prevState => {
      if (!prevState.currentApplication) return prevState;
      
      // Update evidence in both places for consistency
      const evidenceKey = `${pillarId}_${indicatorId}`;
      // Ensure pillar key is correctly formatted
      const pillarKey = pillarId.startsWith('pillar') ? pillarId : `pillar${pillarId}`;
      
      // Get current pillar data
      const currentPillarData = prevState.currentApplication.pillarData[pillarKey] || {};
      
      return {
        ...prevState,
        currentApplication: {
          ...prevState.currentApplication,
          // Update global evidence storage
          evidence: {
            ...prevState.currentApplication.evidence,
            [evidenceKey]: evidence,
          },
          // Also update evidence within pillar data for consistency
          pillarData: {
            ...prevState.currentApplication.pillarData,
            [pillarKey]: {
              ...currentPillarData,
              evidence: {
                ...(currentPillarData.evidence || {}),
                [indicatorId]: evidence
              }
            }
          }
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

  // Calculate scores - FIXED TO PREVENT RECREATION
  const calculateScores = useCallback(() => {
    setState(prevState => {
      if (!prevState.currentApplication?.pillarData) return prevState;

      try {
        // For now, just set a placeholder score until we implement proper score calculation
        const scores = {
          pillars: [],
          overallScore: 0,
          certificationLevel: "Not Certified" as const,
          recommendations: ["Complete your assessment to calculate scores."]
        };
        
        return {
          ...prevState,
          currentApplication: {
            ...prevState.currentApplication,
            scores: scores
          }
        };
      } catch (error) {
        console.error("Error calculating scores:", error);
        return prevState;
      }
    });
  }, []); // FIXED: Empty dependency array to prevent recreation

  // Load application when session is available - ONLY ONCE - FIXED DEPENDENCIES
  useEffect(() => {
    // Only load if we have a user and haven't attempted to load yet
    if (session?.user && !state.currentApplication && !state.isLoading && !hasAttemptedLoad.current) {
      hasAttemptedLoad.current = true;
      console.log('🔄 Attempting to load application data...');
      try {
        loadApplication();
      } catch (error) {
        console.error('Error in loadApplication useEffect:', error);
        setProviderError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  }, [session?.user?.email, state.currentApplication?.id, state.isLoading]); // FIXED: Removed loadApplication dependency

  // Don't render children until session is ready - OPTIMIZED
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
          {/* OPTIMIZED: Add progress indicator */}
          <div className="mt-4 w-48 bg-gray-200 rounded-full h-1.5 mx-auto">
            <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{width: '40%'}}></div>
          </div>
        </div>
      </div>
    );
  }

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
    // Return a safe no-op context instead of throwing to avoid unconditional errors
    return {
      state: {
        currentApplication: null,
        isLoading: false,
        isSaving: false,
        error: null,
        lastSaveTime: null,
        isOnline: true,
      },
      loadApplication: async () => {},
      saveApplication: async () => {},
      submitApplication: async () => {},
      updateInstitution: () => {},
      updatePillar: () => {},
      updateEvidence: () => {},
      clearError: () => {},
      startFresh: () => {},
      calculateScores: () => {},
    } as any;
  }
  return context;
}