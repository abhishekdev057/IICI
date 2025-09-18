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
}

const ApplicationContext = createContext<ApplicationContextType | null>(null);

// Helper functions
const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    // Pillar 1
    "1.1.1": "Score (0-2)", "1.1.2": "Percentage (%)", "1.1.3": "Score (0-2)", "1.1.4": "Score (0-3)",
    "1.2.1": "Binary (0-1)", "1.2.2": "Score (0-3)", "1.2.3": "Score (0-2)", "1.2.4": "Score (1-5)",
    "1.3.1": "Score (0-3)", "1.3.2": "Score (0-2)", "1.3.3": "Score (0-2)", "1.3.4": "Score (0-3)",
    "1.4.1": "Score (0-3)", "1.4.2": "Score (0-2)", "1.4.3": "Binary (0-1)", "1.4.4": "Score (0-2)",
    
    // Pillar 2
    "2.1.1": "Percentage (%)", "2.1.2": "Percentage (%)", "2.1.3": "Score (1-5)",
    "2.2.1": "Score (0-3)", "2.2.2": "Score (0-3)", "2.2.3": "Hours per employee", "2.2.4": "Score (0-3)", "2.2.5": "Score (0-3)",
    "2.3.1": "Score (1-5)", "2.3.2": "Score (1-5)", "2.3.3": "Score (1-5)", "2.3.4": "Score (1-5)",
    
    // Pillar 3
    "3.1.1": "Score (1-5)", "3.1.2": "Score (1-5)", "3.1.3": "Score (1-5)", "3.1.4": "Score (1-5)",
    "3.2.1": "Number", "3.2.2": "Score (1-5)", "3.2.3": "Binary (0-1)",
    "3.3.1": "Score (1-5)", "3.3.2": "Number", "3.3.3": "Number",
    "3.4.1": "Score (1-5)", "3.4.2": "Score (1-5)", "3.4.3": "Score (0-3)", "3.4.4": "Score (1-5)",
    "3.5.1": "Score (1-5)", "3.5.2": "Score (1-5)",
    
    // Pillar 4
    "4.1.1": "Score (1-5)", "4.1.2": "Ratio", "4.1.3": "Score (1-5)",
    "4.2.1": "Score (1-5)", "4.2.2": "Score (1-5)", "4.2.3": "Score (1-5)",
    "4.3.1": "Score (0-3)", "4.3.2": "Score (0-3)",
    "4.4.1": "Score (1-5)", "4.4.2": "Score (1-5)", "4.4.3": "Score (1-5)",
    
    // Pillar 5
    "5.1.1": "Score (1-5)", "5.1.2": "Score (1-5)", "5.1.3": "Score (1-5)", "5.1.4": "Number", "5.1.5": "Score (0-3)",
    "5.2.1": "Score (1-5)", "5.2.2": "Score (1-5)", "5.2.3": "Score (1-5)", "5.2.4": "Score (1-5)",
    
    // Pillar 6
    "6.1.1": "Score (1-5)", "6.1.2": "Score (1-5)", "6.1.3": "Score (1-5)",
    "6.2.1": "Score (0-3)", "6.2.2": "Number", "6.2.3": "Score (1-5)",
    "6.3.1": "Score (1-5)", "6.3.2": "Score (1-5)", "6.3.3": "Number"
  };
  return definitions[indicatorId as keyof typeof definitions] || "Percentage (%)";
};

const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    "1.1.1": 2, "1.1.3": 2, "1.1.4": 3, "1.2.1": 1, "1.2.2": 3, "1.2.3": 2, "1.2.4": 5,
    "1.3.1": 3, "1.3.2": 2, "1.3.3": 2, "1.3.4": 3, "1.4.1": 3, "1.4.2": 2, "1.4.3": 1, "1.4.4": 2,
    "2.1.3": 5, "2.2.1": 3, "2.2.2": 3, "2.2.3": 40, "2.2.4": 3, "2.2.5": 3, "2.3.1": 5, "2.3.2": 5, "2.3.3": 5, "2.3.4": 5,
    "3.1.1": 5, "3.1.2": 5, "3.1.3": 5, "3.1.4": 5, "3.2.1": 200, "3.2.2": 5, "3.2.3": 1, "3.3.1": 5, "3.3.2": 5, "3.3.3": 5,
    "3.4.1": 5, "3.4.2": 5, "3.4.3": 3, "3.4.4": 5, "3.5.1": 5, "3.5.2": 5,
    "4.1.1": 5, "4.1.2": 1, "4.1.3": 5, "4.2.1": 5, "4.2.2": 5, "4.2.3": 5, "4.3.1": 3, "4.3.2": 3,
    "4.4.1": 5, "4.4.2": 5, "4.4.3": 5, "5.1.1": 5, "5.1.2": 5, "5.1.3": 5, "5.1.4": 5, "5.1.5": 3,
    "5.2.1": 5, "5.2.2": 5, "5.2.3": 5, "5.2.4": 5, "6.1.1": 5, "6.1.2": 5, "6.1.3": 5, "6.2.1": 3, "6.2.2": 2, "6.2.3": 5,
    "6.3.1": 5, "6.3.2": 5, "6.3.3": 4
  };
  return definitions[indicatorId as keyof typeof definitions] || 100;
};

const calculateIndicatorScore = (indicatorId: string, value: any): number => {
  if (value === null || value === undefined || value === "") return 0;
  
  const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
  const maxScore = getIndicatorMaxScore(indicatorId);
  
  if (measurementUnit.includes("Score")) {
    return Math.min((value / maxScore) * 100, 100);
  } else if (measurementUnit.includes("Percentage")) {
    return Math.min(value, 100);
  } else if (measurementUnit.includes("Binary")) {
    return value ? 100 : 0;
  } else if (measurementUnit === "Number") {
    return Math.min((value / 200) * 100, 100);
  } else if (measurementUnit === "Ratio") {
    if (typeof value === 'string' && value.includes(':')) {
      const [proactive, reactive] = value.split(':').map(Number);
      const total = proactive + reactive;
      return total > 0 ? (proactive / total) * 100 : 0;
    }
    return Math.min(value * 100, 100);
  } else if (measurementUnit.includes("Hours per employee")) {
    return Math.min((value / 40) * 100, 100);
  }
  
  return 0;
};

const calculatePillarProgress = (pillarData: PillarData, pillarId: number): { completion: number; score: number } => {
  const pillarStructure = PILLAR_STRUCTURE.find(p => p.id === pillarId);
  if (!pillarStructure) return { completion: 0, score: 0 };
  
  const allIndicators = pillarStructure.subPillars.flatMap(sp => sp.indicators);
  const completedIndicators = allIndicators.filter(indicatorId => {
    const indicator = pillarData.indicators[indicatorId];
    return indicator && (indicator.value !== null && indicator.value !== undefined && indicator.value !== "");
  });
  
  const completion = allIndicators.length > 0 ? (completedIndicators.length / allIndicators.length) * 100 : 0;
  
  const totalScore = allIndicators.reduce((sum, indicatorId) => {
    const indicator = pillarData.indicators[indicatorId];
    if (!indicator) return sum;
    return sum + calculateIndicatorScore(indicatorId, indicator.value);
  }, 0);
  
  const score = allIndicators.length > 0 ? totalScore / allIndicators.length : 0;
  
  return { completion, score };
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
    error: null,
    lastSaveTime: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasUnsavedChanges: false,
  });
  
  // Refs for stable references
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date | null>(null);
  
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
  
  // Auto-save effect
  useEffect(() => {
    if (state.hasUnsavedChanges && state.isOnline && !state.isSaving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveApplication(false);
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.hasUnsavedChanges, state.isOnline, state.isSaving]);
  
  // Load application
  const loadApplication = useCallback(async () => {
    if (!session?.user?.email || state.isLoading) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/applications/enhanced');
      if (!response.ok) throw new Error('Failed to load applications');
      
      const { data: applications } = await response.json();
      
      if (applications && applications.length > 0) {
        const app = applications[0];
        
        // Transform database data to frontend format
        const applicationData: ApplicationData = {
          id: app.id,
          institutionData: app.institutionData || {
            name: "",
            industry: "",
            organizationSize: "",
            country: "",
            contactEmail: session.user.email,
          },
          pillarData: app.pillarData || {},
          scores: app.scores,
          status: app.status?.toLowerCase() || "draft",
          submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
          lastSaved: new Date(app.lastSaved),
          lastModified: new Date(app.lastModified),
          currentStep: 0, // Will be calculated based on completion
        };
        
        // Calculate current step based on completion
        const nextIncompleteStep = getNextIncompleteStep(applicationData);
        applicationData.currentStep = nextIncompleteStep;
        
        setState(prev => ({
          ...prev,
          application: applicationData,
          isLoading: false,
          hasUnsavedChanges: false,
        }));
      } else {
        // Create new application
        console.log('No existing application found, creating new one...');
        const createResponse = await fetch('/api/applications/enhanced', { method: 'POST' });
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Application creation failed:', {
            status: createResponse.status,
            statusText: createResponse.statusText,
            error: errorData
          });
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
          currentStep: 0,
        };
        
        setState(prev => ({
          ...prev,
          application: applicationData,
          isLoading: false,
          hasUnsavedChanges: false,
        }));
      }
    } catch (error) {
      console.error('Load error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load application',
        isLoading: false,
      }));
    }
  }, [session?.user?.email, state.isLoading]);
  
  // Save application
  const saveApplication = useCallback(async (force = false) => {
    if (!state.application || !session?.user || state.isSaving) return;
    
    if (!force && !state.hasUnsavedChanges) return;
    
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
      
      Object.entries(state.application.pillarData).forEach(([pillarKey, pillarData]) => {
        const pillarId = parseInt(pillarKey.replace('pillar_', ''));
        if (isNaN(pillarId)) return;
        
        Object.entries(pillarData.indicators).forEach(([indicatorId, indicator]) => {
          const hasEvidence = !!(
            indicator.evidence.text?.description ||
            indicator.evidence.link?.url ||
            indicator.evidence.file?.fileName
          );
          
          if (!hasEvidence && (indicator.value === null || indicator.value === undefined || indicator.value === "")) {
            return;
          }
          
          indicatorResponses.push({
            indicatorId,
            pillarId,
            rawValue: indicator.value,
            normalizedScore: calculateIndicatorScore(indicatorId, indicator.value),
            measurementUnit: getIndicatorMeasurementUnit(indicatorId),
            hasEvidence,
            evidence: indicator.evidence,
          });
        });
      });
      
      // Check if application has an ID
      if (!state.application.id) {
        console.error('Cannot save application: No application ID');
        throw new Error('Application not properly initialized. Please refresh the page.');
      }
      
      console.log('Saving application:', {
        id: state.application.id,
        status: state.application.status,
        indicatorResponsesCount: indicatorResponses.length
      });
      
      // Save to backend
      const response = await fetch(`/api/applications/enhanced/${state.application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: state.application.status,
          institutionData: state.application.institutionData,
          pillarData: state.application.pillarData,
          indicatorResponses,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
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
      }
    } catch (error) {
      console.error('Save error:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save application',
      }));
      
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [state.application, state.isSaving, state.hasUnsavedChanges, state.isOnline, session?.user, toast]);
  
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
  }, [state.application]);
  
  // Update indicator value
  const updateIndicator = useCallback((pillarId: number, indicatorId: string, value: any) => {
    if (!state.application) return;
    
    const pillarKey = `pillar_${pillarId}`;
    
    setState(prev => {
      const newPillarData = { ...prev.application!.pillarData };
      
      if (!newPillarData[pillarKey]) {
        newPillarData[pillarKey] = {
          indicators: {},
          lastModified: new Date(),
          completion: 0,
          score: 0,
        };
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
      
      return {
        ...prev,
        application: {
          ...prev.application!,
          pillarData: newPillarData,
          lastModified: new Date(),
        },
        hasUnsavedChanges: true,
      };
    });
  }, [state.application]);
  
  // Update evidence
  const updateEvidence = useCallback((pillarId: number, indicatorId: string, evidence: EvidenceData) => {
    if (!state.application) return;
    
    const pillarKey = `pillar_${pillarId}`;
    
    setState(prev => {
      const newPillarData = { ...prev.application!.pillarData };
      
      if (!newPillarData[pillarKey]) {
        newPillarData[pillarKey] = {
          indicators: {},
          lastModified: new Date(),
          completion: 0,
          score: 0,
        };
      }
      
      if (!newPillarData[pillarKey].indicators[indicatorId]) {
        newPillarData[pillarKey].indicators[indicatorId] = {
          id: indicatorId,
          value: null,
          evidence: {},
          lastModified: new Date(),
        };
      }
      
      newPillarData[pillarKey] = {
        ...newPillarData[pillarKey],
        indicators: {
          ...newPillarData[pillarKey].indicators,
          [indicatorId]: {
            ...newPillarData[pillarKey].indicators[indicatorId],
            evidence,
            lastModified: new Date(),
          },
        },
        lastModified: new Date(),
      };
      
      return {
        ...prev,
        application: {
          ...prev.application!,
          pillarData: newPillarData,
          lastModified: new Date(),
        },
        hasUnsavedChanges: true,
      };
    });
  }, [state.application]);
  
  // Set current step
  const setCurrentStep = useCallback((step: number) => {
    if (!state.application) return;
    
    setState(prev => ({
      ...prev,
      application: {
        ...prev.application!,
        currentStep: step,
      },
    }));
  }, [state.application]);
  
  // Get pillar progress
  const getPillarProgress = useCallback((pillarId: number) => {
    if (!state.application) return { completion: 0, score: 0 };
    
    const pillarKey = `pillar_${pillarId}`;
    const pillarData = state.application.pillarData[pillarKey];
    
    if (!pillarData) return { completion: 0, score: 0 };
    
    return { completion: pillarData.completion, score: pillarData.score };
  }, [state.application]);
  
  // Get overall progress
  const getOverallProgress = useCallback(() => {
    if (!state.application) return { completion: 0, score: 0 };
    
    const pillars = Object.values(state.application.pillarData);
    if (pillars.length === 0) return { completion: 0, score: 0 };
    
    const totalCompletion = pillars.reduce((sum, pillar) => sum + pillar.completion, 0);
    const totalScore = pillars.reduce((sum, pillar) => sum + pillar.score, 0);
    
    return {
      completion: totalCompletion / pillars.length,
      score: totalScore / pillars.length,
    };
  }, [state.application]);
  
  // Check if can navigate to step
  const canNavigateToStep = useCallback((step: number) => {
    if (!state.application) return false;
    
    // Step 0 (institution setup) is always accessible
    if (step === 0) return true;
    
    // Check if previous steps are completed
    for (let i = 0; i < step; i++) {
      if (i === 0) continue; // Skip institution setup
      
      const pillarId = i;
      const progress = getPillarProgress(pillarId);
      if (progress.completion < 80) return false;
    }
    
    return true;
  }, [state.application, getPillarProgress]);
  
  // Get next incomplete step
  const getNextIncompleteStep = useCallback((application?: ApplicationData) => {
    const app = application || state.application;
    if (!app) return 0;
    
    // Check institution setup first
    const institutionComplete = !!(
      app.institutionData.name &&
      app.institutionData.industry &&
      app.institutionData.organizationSize &&
      app.institutionData.country &&
      app.institutionData.contactEmail
    );
    
    if (!institutionComplete) return 0;
    
    // Check each pillar
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const pillarKey = `pillar_${pillarId}`;
      const pillarData = app.pillarData[pillarKey];
      
      if (!pillarData || pillarData.completion < 80) {
        return pillarId;
      }
    }
    
    return 6; // All steps completed
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
  
  // Load application on mount
  useEffect(() => {
    if (session?.user?.email && !state.application && !state.isLoading) {
      loadApplication();
    }
  }, [session?.user?.email, state.application, state.isLoading, loadApplication]);
  
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
