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
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
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
  updateEvidence: (pillarId: number, indicatorId: string, evidence: EvidenceData) => void;
  setCurrentStep: (step: number) => void;
  
  // Utilities
  clearError: () => void;
  getPillarProgress: (pillarId: number) => { completion: number; score: number };
  getOverallProgress: () => { completion: number; score: number };
  canNavigateToStep: (step: number) => boolean;
  getNextIncompleteStep: () => number;
  saveAllPendingChanges: () => Promise<boolean>;
  validateFromDatabase: (step: number) => Promise<{ isValid: boolean; missingItems: string[] }>;
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
  createDebouncedFunction
} from "@/lib/application-utils";

const calculatePillarProgress = (pillarData: PillarData, pillarId: number): { completion: number; score: number } => {
  const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === pillarId);
  if (!pillarStructure) return { completion: 0, score: 0 };
  
  const allIndicators = pillarStructure.subPillars.flatMap(sp => sp.indicators);
  
  // Use centralized utility for progress calculation
  const result = calculatePillarProgressUtil(pillarData, pillarId, allIndicators);
  
  // Calculate pillar progress
  
  return result;
};

// Helper function to get next incomplete step - FIXED to use dynamic calculation
const getNextIncompleteStepHelper = (application: ApplicationData): number => {
  // Check institution setup first
  const institutionComplete = !!(
    application.institutionData.name &&
    application.institutionData.industry &&
    application.institutionData.organizationSize &&
    application.institutionData.country &&
    application.institutionData.contactEmail
  );
  
  if (!institutionComplete) return 0;
  
  // Check each pillar using dynamic calculation instead of stale completion property
  for (let pillarId = 1; pillarId <= 6; pillarId++) {
    const pillarKey = `pillar_${pillarId}`;
    const pillarData = application.pillarData[pillarKey];
    
    if (!pillarData) {
      return pillarId; // Pillar not started
    }
    
    // Calculate completion dynamically using the same logic as calculatePillarProgress
    const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === pillarId);
    if (!pillarStructure) continue;
    
    const allIndicators = pillarStructure.subPillars.flatMap(sp => sp.indicators);
    
    // Count completed indicators using conditional evidence logic
    const completedIndicators = allIndicators.filter(indicatorId => {
      const indicator = pillarData.indicators[indicatorId];
      if (!indicator) return false;
      
      const hasValue = indicator.value !== null && indicator.value !== undefined && indicator.value !== "";
      const hasEvidence = validateEvidence(indicator.evidence);
      
      // If no value, indicator is not complete
      if (!hasValue) return false;
      
      // Check if evidence is conditionally required using centralized function
      const evidenceRequired = isEvidenceRequired(indicatorId, indicator.value);
      
      // Indicator is complete if it has a value AND (evidence is not required OR evidence is provided)
      return hasValue && (!evidenceRequired || hasEvidence);
    });
    
    const completion = allIndicators.length > 0 ? (completedIndicators.length / allIndicators.length) * 100 : 0;
    
    // Check pillar completion
    
    if (completion < 100) {
      return pillarId; // This pillar is not complete
    }
  }
  
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
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasUnsavedChanges: false,
  });

  // Smart change tracking
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());
  const [lastSavedState, setLastSavedState] = useState<any>(null);
  
  // Refs for stable references
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const loadDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const partialSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  
  // Simple and reliable partial save function
  const processPendingChanges = useCallback(async (): Promise<void> => {
    if (!state.application || !session?.user?.email || pendingChanges.size === 0) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      // Get current pending changes and clear them
      const currentPendingChanges = new Map(pendingChanges);
      setPendingChanges(new Map());

      // Process each change individually to avoid complexity
      for (const [changeType, changes] of currentPendingChanges) {
        const response = await fetch(`/api/applications/enhanced/${state.application.id}/partial`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            changeType,
            changes
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to save changes: ${response.status}`);
        }
      }

      // Update last saved state
      setLastSavedState(JSON.parse(JSON.stringify(state.application)));

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaveTime: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));

    } catch (error: any) {
      console.error('❌ Error saving partial changes:', error);
      
      let errorMessage = 'Failed to save changes';
      if (error.message) {
        if (error.message.includes('PrismaClientValidationError')) {
          errorMessage = 'Invalid data format. Please check your input.';
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Changes will be saved when connection is restored.';
        } else {
          errorMessage = `Save failed: ${error.message}`;
        }
      }
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
        hasUnsavedChanges: true
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

  // Simplified immediate save function
  const savePartialChanges = useCallback(async (changeType: string, changes: any, force = false): Promise<void> => {
    if (!state.application || !session?.user?.email) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      const response = await fetch(`/api/applications/enhanced/${state.application.id}/partial`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType,
          changes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save changes: ${response.status}`);
      }

      // Update last saved state
      setLastSavedState(JSON.parse(JSON.stringify(state.application)));
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaveTime: new Date(),
        error: null,
      }));

    } catch (error: any) {
      console.error('❌ Error saving partial changes:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error.message,
        hasUnsavedChanges: true
      }));
    }
  }, [state.application, session?.user?.email]);

  // Load application with duplicate prevention
  const loadApplication = useCallback(async (retryCount = 0) => {
    if (!session?.user?.email || state.isLoading) return;
    
    // Prevent multiple simultaneous load requests
    if (state.isLoading) {
      // Application load already in progress
      return;
    }
    
    const maxRetries = 2;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Simple fetch without AbortController to avoid signal issues
      const response = await fetch('/api/applications/enhanced');
      
      if (!response.ok) {
        // Retry on server errors
        if ((response.status >= 500 || response.status === 0) && retryCount < maxRetries) {
          // Retrying load
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return loadApplication(retryCount + 1);
        }
        throw new Error(`Failed to load applications: ${response.status} ${response.statusText}`);
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
            name: "",
            industry: "",
            organizationSize: "",
            country: "",
            contactEmail: session.user.email,
          },
          pillarData: pillarData,
          scores: app.scores,
          status: app.status?.toLowerCase() || "draft",
          submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
          lastSaved: new Date(app.lastSaved),
          lastModified: new Date(app.lastModified),
          currentStep: 0, // Will be calculated based on completion
        };
        
        // Application data loaded
        
        // Automatically navigate to the next incomplete step based on database data
        const nextIncompleteStep = getNextIncompleteStepHelper(applicationData);
        applicationData.currentStep = nextIncompleteStep;
        
        // Auto-navigating to next incomplete step
        
        setState(prev => ({
          ...prev,
          application: applicationData,
          isLoading: false,
          hasUnsavedChanges: false,
        }));
      } else {
        // Create new application with enhanced error handling
        // No existing application found, creating new one
        const createResponse = await fetch('/api/applications/enhanced', { method: 'POST' });
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Application creation failed:', {
            status: createResponse.status,
            statusText: createResponse.statusText,
            error: errorData
          });
          
          // Handle specific error cases
          if (createResponse.status === 409) {
            // Application already exists (race condition), try to fetch it
            console.log('⚠️ Application already exists, fetching existing one...');
            const fetchResponse = await fetch('/api/applications/enhanced');
            if (fetchResponse.ok) {
              const responseData = await fetchResponse.json();
              console.log('🔄 API Response:', responseData);
              const { data: existingApps } = responseData;
              if (existingApps && existingApps.length > 0) {
                const app = existingApps[0];
                console.log('🔄 First application from API:', app);
                // Process existing application data...
                const applicationData: ApplicationData = {
                  id: app.id,
                  institutionData: app.institutionData || {
                    name: "",
                    industry: "",
                    organizationSize: "",
                    country: "",
                    contactEmail: session.user.email,
                  },
                  pillarData: app.pillarData || {}, // This is the transformed data from API
                  scores: app.scores,
                  status: app.status?.toLowerCase() || "draft",
                  submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
                  lastSaved: new Date(app.lastSaved),
                  lastModified: new Date(app.lastModified),
                  currentStep: 0,
                };
                
                console.log('🔄 Loaded application data:', {
                  id: app.id,
                  pillarDataKeys: Object.keys(app.pillarData || {}),
                  pillarData: app.pillarData
                });
                
                setState(prev => ({
                  ...prev,
                  application: applicationData,
                  isLoading: false,
                  hasUnsavedChanges: false,
                }));
                return;
              }
            }
          }
          
          throw new Error(`Failed to create application: ${createResponse.status} ${createResponse.statusText}`);
        }
        
        const { data: newApp } = await createResponse.json();
        console.log('Application created successfully:', newApp);
        
        const applicationData: ApplicationData = {
          id: newApp.id,
          institutionData: newApp.institutionData || {
            name: "",
            industry: "",
            organizationSize: "",
            country: "",
            contactEmail: session.user.email,
          },
          pillarData: {},
          scores: null,
          status: "draft",
          lastSaved: new Date(),
          lastModified: new Date(),
          currentStep: 0, // New application starts at step 0 (institution setup)
        };
        
        console.log('🎯 New application created, starting at step 0 (institution setup)');
        
        setState(prev => ({
          ...prev,
          application: applicationData,
          isLoading: false,
          hasUnsavedChanges: false,
        }));
      }
    } catch (error) {
      console.error('Load error:', error);
      
      // Retry on network errors (but not AbortError since we removed AbortController)
      if (error instanceof Error && !error.message.includes('Failed to load applications') && retryCount < maxRetries) {
        console.log(`🔄 Retrying after error in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadApplication(retryCount + 1);
      }
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load application',
        isLoading: false,
      }));
    }
  }, [session?.user?.email, state.isLoading]);
  
  // Debounced save function - OPTIMIZED for real-time updates
  const debouncedSave = useCallback((force = false) => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }
    
    saveDebounceRef.current = setTimeout(() => {
      saveApplicationInternal(force);
    }, 300); // Reduced to 300ms for faster real-time updates
  }, []);

  // Internal save function - SINGLE TRANSACTION with proper abort handling
  const saveApplicationInternal = useCallback(async (force = false, retryCount = 0): Promise<void> => {
    if (!state.application || !session?.user) return;
    
    // Prevent multiple simultaneous saves
    if (state.isSaving) return;
    
    if (!force && !state.hasUnsavedChanges) return;
    
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
    
    if (!state.isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Changes will be saved when connection is restored.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
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
      
      if (!state.application.pillarData || Object.keys(state.application.pillarData).length === 0) {
        // No pillar data to save - this is normal for new applications
        // Don't return early - still save institution data and other updates
      }
      
      // Only process pillar data if it exists
      if (state.application.pillarData && Object.keys(state.application.pillarData).length > 0) {
      Object.entries(state.application.pillarData).forEach(([pillarKey, pillarData]) => {
        const pillarId = parseInt(pillarKey.replace('pillar_', ''));
        if (isNaN(pillarId)) return;
        
        // Process pillar data
        
        Object.entries(pillarData.indicators).forEach(([indicatorId, indicator]) => {
          const hasEvidence = !!(
            indicator.evidence?.text?.description ||
            indicator.evidence?.link?.url ||
            indicator.evidence?.file?.fileName
          );
          
          console.log(`🔍 Processing indicator ${indicatorId}:`, {
            value: indicator.value,
            hasEvidence,
            evidence: indicator.evidence,
            willInclude: !(!hasEvidence && (indicator.value === null || indicator.value === undefined || indicator.value === ""))
          });
          
          // Only skip if there's absolutely no data at all
          if ((indicator.value === null || indicator.value === undefined || indicator.value === "") && !hasEvidence) {
            console.log(`❌ Skipping indicator ${indicatorId} - no value and no evidence`);
            return;
          }
          
          const response = {
            indicatorId,
            pillarId,
            rawValue: indicator.value,
            normalizedScore: calculateIndicatorScore(indicatorId, indicator.value),
            measurementUnit: getIndicatorMeasurementUnit(indicatorId),
            hasEvidence,
            evidence: indicator.evidence,
          };
          
            console.log(`✅ Including indicator ${indicatorId}:`, {
              ...response,
              evidenceDetails: indicator.evidence ? {
                hasText: !!indicator.evidence.text?.description,
                hasLink: !!indicator.evidence.link?.url,
                hasFile: !!indicator.evidence.file?.fileName,
                evidenceKeys: Object.keys(indicator.evidence)
              } : null
            });
          indicatorResponses.push(response);
        });
      });
      }
      
      // Check if application has an ID
      if (!state.application.id) {
        throw new Error('Application not properly initialized. Please refresh the page.');
      }
      
      // Save to backend with timeout and retry logic - FIXED abort handling
      // Simple fetch without AbortController to avoid signal issues
      const response = await fetch(`/api/applications/enhanced/${state.application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: state.application.status,
          institutionData: state.application.institutionData,
          pillarData: state.application.pillarData,
          indicatorResponses,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Save failed
        
        // Retry on server errors (5xx) or network issues - FIXED to prevent nested loops
        if ((response.status >= 500 || response.status === 0) && retryCount < maxRetries) {
          // Retrying save
          setState(prev => ({ ...prev, isSaving: false })); // Reset saving state
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return await saveApplicationInternal(force, retryCount + 1);
        }
        
        throw new Error(`Failed to save application: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Save successful:', result);
      
      setState(prev => ({
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
        console.log('✅ Auto-save completed successfully');
      }
    } catch (error) {
      console.error('Save error:', error);
      
      // Retry on network errors (but not AbortError since we removed AbortController)
      if (error instanceof Error && !error.message.includes('Failed to save') && retryCount < maxRetries) {
        console.log(`🔄 Retrying save in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setState(prev => ({ ...prev, isSaving: false })); // Reset saving state
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await saveApplicationInternal(force, retryCount + 1);
      }
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save application',
        hasUnsavedChanges: true // Keep unsaved changes flag on error
      }));
      
      if (force) {
      toast({
        title: "Save Failed",
          description: error instanceof Error ? error.message : 'Failed to save application',
        variant: "destructive",
      });
      }
    }
  }, [state.application, state.isSaving, state.hasUnsavedChanges, state.isOnline, session?.user, toast]);
  
  // Public saveApplication function - uses debounced save for auto-save, direct for manual saves
  const saveApplication = useCallback(async (force = false): Promise<void> => {
    if (force) {
      // For manual saves, call directly without debounce
      return saveApplicationInternal(force);
    } else {
      // For auto-saves, use debounced version
      debouncedSave(force);
    }
  }, [saveApplicationInternal, debouncedSave]);
  
  // Auto-save effect - OPTIMIZED to prevent unnecessary saves
  useEffect(() => {
    console.log('🔍 Auto-save effect triggered:', {
      hasUnsavedChanges: state.hasUnsavedChanges,
      isOnline: state.isOnline,
      isSaving: state.isSaving,
      hasApplication: !!state.application
    });
    
    // Only auto-save if we have actual changes and application data
    if (state.hasUnsavedChanges && state.isOnline && !state.isSaving && state.application) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      console.log('🔍 Setting auto-save timeout for 2 seconds');
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('🔍 Auto-save timeout triggered, calling debouncedSave');
        debouncedSave(false);
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.hasUnsavedChanges, state.isOnline, state.isSaving, state.application, debouncedSave]);

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
  const updateInstitution = useCallback((data: Partial<InstitutionData>) => {
    if (!state.application) return;
    
    setState(prev => ({
      ...prev,
      application: {
        ...prev.application!,
        institutionData: { ...prev.application!.institutionData, ...data },
        lastModified: new Date(),
      },
      hasUnsavedChanges: true,
    }));
    
    // Save institution data immediately using partial save
    savePartialChanges('institution', data);
  }, [state.application, savePartialChanges]);
  
  // Update indicator value
  const updateIndicator = useCallback((pillarId: number, indicatorId: string, value: any) => {
    if (!state.application) return;
    
    const pillarKey = `pillar_${pillarId}`;
    
    setState(prev => {
      if (!prev.application) {
        console.error('❌ No application in previous state');
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
      const currentValue = newPillarData[pillarKey].indicators[indicatorId]?.value;
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
            evidence: newPillarData[pillarKey].indicators[indicatorId]?.evidence || {},
            lastModified: new Date(),
          },
        },
        lastModified: new Date(),
      };
      
      // Recalculate pillar progress
      const progress = calculatePillarProgress(newPillarData[pillarKey], pillarId);
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

    // Trigger smart partial save
    savePartialChanges('indicator', { pillarId, indicatorId, value });
  }, [state.application, savePartialChanges]);
  
  // Update evidence
  const updateEvidence = useCallback((pillarId: number, indicatorId: string, evidence: EvidenceData) => {
    if (!state.application) {
      console.error('❌ No application found in state');
      return;
    }
    
    const pillarKey = `pillar_${pillarId}`;
    
    setState(prev => {
      if (!prev.application) {
        console.error('❌ No application in previous state');
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
      const existingEvidence = newPillarData[pillarKey].indicators[indicatorId].evidence || {};
      
      const mergedEvidence = {
        ...existingEvidence,
        ...evidence,
        // Ensure _persisted flags are properly set
        text: evidence.text ? { ...evidence.text, _persisted: evidence.text._persisted || false } : existingEvidence.text,
        link: evidence.link ? { ...evidence.link, _persisted: evidence.link._persisted || false } : existingEvidence.link,
        file: evidence.file ? { ...evidence.file, _persisted: evidence.file._persisted || false } : existingEvidence.file,
      };
      
      // Check if evidence actually changed
      const hasEvidenceChanged = JSON.stringify(existingEvidence) !== JSON.stringify(mergedEvidence);
      
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
      const progress = calculatePillarProgress(newPillarData[pillarKey], pillarId);
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

    // Trigger smart partial save
    savePartialChanges('evidence', { pillarId, indicatorId, evidence });
  }, [state.application, savePartialChanges]);
  
  // Save all pending changes before navigation
  const saveAllPendingChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) {
      console.log('✅ No pending changes to save');
      return true;
    }

    console.log(`💾 Force saving ${pendingChanges.size} pending changes...`);

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      // Get current pending changes and clear them immediately
      const currentPendingChanges = new Map(pendingChanges);
      setPendingChanges(new Map());

      // Save each change individually with error handling
      let allSaved = true;
      const errors: string[] = [];

      for (const [changeKey, changeData] of currentPendingChanges) {
        try {
          const changeType = changeKey.startsWith('indicator_') ? 'indicator' : 
                            changeKey.startsWith('evidence_') ? 'evidence' : 
                            changeKey.startsWith('institution_') ? 'institution' : 'unknown';
          
          console.log(`🔄 Saving ${changeType}:`, changeData);
          
          const response = await fetch(`/api/applications/enhanced/${state.application?.id}/partial`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              changeType,
              changes: changeData
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to save ${changeType}: ${response.status}`);
          }

          console.log(`✅ Successfully saved ${changeType}`);
          
        } catch (error: any) {
          console.error(`❌ Failed to save ${changeKey}:`, error);
          errors.push(`${changeKey}: ${error.message}`);
          allSaved = false;
        }
      }

      if (!allSaved) {
        console.error('❌ Some changes failed to save:', errors);
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: `Failed to save some changes: ${errors.join(', ')}`,
        }));
        return false;
      }

      // Update last saved state
      setLastSavedState(JSON.parse(JSON.stringify(state.application)));
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaveTime: new Date(),
        error: null,
      }));

      console.log('✅ All pending changes saved successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Error saving pending changes:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error.message,
      }));

      toast({
        title: "Save Failed",
        description: "Failed to save changes before navigation. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  }, [pendingChanges, savePartialChanges, toast]);

  // Set current step - ENHANCED with debugging
  const setCurrentStep = useCallback((step: number) => {
    console.log('🔍 setCurrentStep called:', { step, hasApplication: !!state.application });
    if (!state.application) {
      console.log('🔍 setCurrentStep: No application in state, cannot set step');
      return;
    }
    
    console.log('🔍 setCurrentStep: Setting step from', state.application.currentStep, 'to', step);
    
    setState(prev => ({
      ...prev,
      application: {
        ...prev.application!,
        currentStep: step,
      },
    }));
  }, [state.application]);
  
  // Get pillar progress - ENHANCED with debugging
  const getPillarProgress = useCallback((pillarId: number) => {
    if (!state.application) {
      console.log(`🔍 getPillarProgress(${pillarId}): No application in state`);
      return { completion: 0, score: 0 };
    }
    
    const pillarKey = `pillar_${pillarId}`;
    const pillarData = state.application.pillarData[pillarKey];
    
    if (!pillarData) {
      console.log(`🔍 getPillarProgress(${pillarId}): No pillar data for ${pillarKey}`);
      console.log(`🔍 Available pillar keys:`, Object.keys(state.application.pillarData));
      return { completion: 0, score: 0 };
    }
    
    console.log(`🔍 getPillarProgress(${pillarId}): Found pillar data:`, {
      indicators: Object.keys(pillarData.indicators || {}),
      completion: pillarData.completion,
      score: pillarData.score
    });
    
    // Calculate progress dynamically instead of using cached values
    const progress = calculatePillarProgress(pillarData, pillarId);
    console.log(`🔍 getPillarProgress(${pillarId}): Calculated progress:`, progress);
    
    return progress;
  }, [state.application]);
  
  // Get overall progress
  const getOverallProgress = useCallback(() => {
    if (!state.application) return { completion: 0, score: 0 };
    
    // Calculate progress across ALL 6 pillars (not just started ones)
    const totalPillars = 6;
    let totalCompletion = 0;
    let totalScore = 0;
    
    for (let pillarId = 1; pillarId <= totalPillars; pillarId++) {
      const pillarKey = `pillar_${pillarId}`;
      const pillarData = state.application.pillarData[pillarKey];
      
      if (pillarData) {
        totalCompletion += pillarData.completion;
        totalScore += pillarData.score;
      }
      // If pillar doesn't exist, it contributes 0 to the total
    }
    
    const result = {
      completion: totalCompletion / totalPillars,
      score: totalScore / totalPillars,
    };
    
    console.log(`🔍 getOverallProgress:`, {
      totalPillars,
      pillarCompletions: Array.from({length: totalPillars}, (_, i) => {
        const pillarKey = `pillar_${i + 1}`;
        const pillarData = state.application?.pillarData[pillarKey];
        return pillarData ? pillarData.completion : 0;
      }),
      totalCompletion,
      averageCompletion: result.completion,
      result
    });
    
    return result;
  }, [state.application]);
  
  // Check if can navigate to step
  const canNavigateToStep = useCallback((step: number) => {
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
  }, [state.application, getPillarProgress]);
  
  // Get next incomplete step
  const getNextIncompleteStep = useCallback((application?: ApplicationData) => {
    const app = application || state.application;
    if (!app) return 0;
    
    return getNextIncompleteStepHelper(app);
  }, [state.application]);
  
  // Submit application
  const submitApplication = useCallback(async () => {
    if (!state.application) return;
    
    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
      const response = await fetch(`/api/applications/enhanced/${state.application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          institutionData: state.application.institutionData,
          pillarData: state.application.pillarData,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit application');
      
      setState(prev => ({
        ...prev,
        application: {
          ...prev.application!,
          status: 'submitted',
          submittedAt: new Date(),
          lastSaved: new Date(),
        },
        isSaving: false,
        hasUnsavedChanges: false,
      }));
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. Redirecting to dashboard...",
      });
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000); // 2 second delay to show the toast
    } catch (error) {
      console.error('Submit error:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to submit application',
      }));
    }
  }, [state.application, toast]);
  
  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  // Load application on mount and when session changes - OPTIMIZED
  useEffect(() => {
    if (session?.user?.email && !state.application && !state.isLoading) {
      console.log('🔄 Loading application on mount for user:', session.user.email);
      // Use a small delay to prevent race conditions
      const timeoutId = setTimeout(() => {
        loadApplication();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [session?.user?.email, state.application, state.isLoading, loadApplication]);

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
      console.log('🔄 Refreshing application data...');
      try {
        const response = await fetch(`/api/applications/enhanced/${state.application.id}`);
        if (response.ok) {
          const { data: app } = await response.json();
          
          // Update application with fresh data
          setState(prev => ({
            ...prev,
            application: {
              ...prev.application!,
              pillarData: app.pillarData || {},
              lastSaved: new Date(app.lastSaved),
              lastModified: new Date(app.lastModified),
            },
            hasUnsavedChanges: false,
          }));
          
          console.log('✅ Application data refreshed successfully');
        }
      } catch (error) {
        console.error('❌ Failed to refresh application data:', error);
      }
    }
  }, [state.application?.id]);

  // Public refresh function - uses debounced version
  const refreshApplicationData = useCallback(async () => {
    debouncedRefresh();
  }, [debouncedRefresh]);
  
  
  // Debug function to check data state
  const debugDataState = useCallback(() => {
    console.log('🔍 DEBUG: Current application state:', {
      hasApplication: !!state.application,
      applicationId: state.application?.id,
      hasUnsavedChanges: state.hasUnsavedChanges,
      isSaving: state.isSaving,
      isLoading: state.isLoading,
      isOnline: state.isOnline,
      pillarDataKeys: state.application ? Object.keys(state.application.pillarData || {}) : [],
      pillar1Data: state.application?.pillarData?.pillar_1 ? {
        indicatorsCount: Object.keys(state.application.pillarData.pillar_1.indicators || {}).length,
        completion: state.application.pillarData.pillar_1.completion,
        score: state.application.pillarData.pillar_1.score,
        sampleIndicator: Object.keys(state.application.pillarData.pillar_1.indicators || {})[0]
      } : null
    });
    
    // Debug evidence specifically
    if (state.application?.pillarData) {
      console.log('🔍 DEBUG: Evidence data across all pillars:');
      Object.entries(state.application.pillarData).forEach(([pillarKey, pillarData]) => {
        if (pillarData.indicators) {
          Object.entries(pillarData.indicators).forEach(([indicatorId, indicator]) => {
            if (indicator.evidence && Object.keys(indicator.evidence).length > 0) {
              console.log(`  ${pillarKey}.${indicatorId}:`, {
                evidence: indicator.evidence,
                hasText: !!indicator.evidence.text?.description,
                hasLink: !!indicator.evidence.link?.url,
                hasFile: !!indicator.evidence.file?.fileName
              });
            }
          });
        }
      });
    }
  }, [state]);
  
  // Database validation function
  const validateFromDatabase = useCallback(async (step: number): Promise<{ isValid: boolean; missingItems: string[] }> => {
    if (!state.application) {
      return { isValid: false, missingItems: ['No application found'] };
    }

    try {
      const response = await fetch(`/api/applications/enhanced/${state.application.id}/validate?step=${step}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to validate from database');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('❌ Error validating from database:', error);
      return { isValid: false, missingItems: ['Validation failed'] };
    }
  }, [state.application]);

  // Expose refresh function in context
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
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}
