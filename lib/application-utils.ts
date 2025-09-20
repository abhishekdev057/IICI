/**
 * Centralized Application Utilities
 * All common functions for data operations, calculations, and validations
 */

// ============================================================================
// INDICATOR DEFINITIONS - SINGLE SOURCE OF TRUTH
// ============================================================================

export const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    // Pillar 1
    "1.1.1": "Score (0-2)", "1.1.2": "Percentage (%)", "1.1.3": "Score (0-2)", "1.1.4": "Score (0-3)",
    "1.2.1": "Binary (0-1)", "1.2.2": "Percentage (%)", "1.2.3": "Percentage (%)", "1.2.4": "Score (1-5)",
    "1.3.1": "Score (0-3)", "1.3.2": "Percentage (%)", "1.3.3": "Score (0-2)", "1.3.4": "Percentage (%)",
    "1.4.1": "Score (0-3)", "1.4.2": "Percentage (%)", "1.4.3": "Binary (0-1)", "1.4.4": "Score (0-2)",
    
    // Pillar 2
    "2.1.1": "Percentage (%)", "2.1.2": "Percentage (%)", "2.1.3": "Score (1-5)",
    "2.2.1": "Number", "2.2.2": "Percentage (%)", "2.2.3": "Hours per employee", "2.2.4": "Score (0-3)", "2.2.5": "Score (0-3)",
    "2.3.1": "Score (1-5)", "2.3.2": "Score (1-5)", "2.3.3": "Score (1-5)", "2.3.4": "Score (1-5)",
    
    // Pillar 3
    "3.1.1": "Score (1-5)", "3.1.2": "Percentage (%)", "3.1.3": "Score (1-5)", "3.1.4": "Score (1-5)",
    "3.2.1": "Percentage (%)", "3.2.2": "Score (1-5)", "3.2.3": "Binary (0-1)",
    "3.3.1": "Score (1-5)", "3.3.2": "Percentage (%)", "3.3.3": "Percentage (%)",
    "3.4.1": "Score (1-5)", "3.4.2": "Score (1-5)", "3.4.3": "Score (0-3)", "3.4.4": "Score (1-5)",
    "3.5.1": "Score (1-5)", "3.5.2": "Score (1-5)",
    
    // Pillar 4
    "4.1.1": "Score (1-5)", "4.1.2": "Ratio", "4.1.3": "Score (1-5)",
    "4.2.1": "Percentage (%)", "4.2.2": "Score (1-5)", "4.2.3": "Percentage (%)",
    "4.3.1": "Score (0-3)", "4.3.2": "Percentage (%)",
    "4.4.1": "Percentage (%)", "4.4.2": "Percentage (%)", "4.4.3": "Percentage (%)",
    
    // Pillar 5
    "5.1.1": "Score (1-5)", "5.1.2": "Percentage (%)", "5.1.3": "Percentage (%)", "5.1.4": "Number", "5.1.5": "Score (0-3)",
    "5.2.1": "Percentage (%)", "5.2.2": "Score (1-5)", "5.2.3": "Percentage (%)", "5.2.4": "Percentage (%)",
    
    // Pillar 6
    "6.1.1": "Percentage (%)", "6.1.2": "Percentage (%)", "6.1.3": "Score (1-5)",
    "6.2.1": "Score (0-3)", "6.2.2": "Number", "6.2.3": "Score (1-5)",
    "6.3.1": "Percentage (%)", "6.3.2": "Percentage (%)", "6.3.3": "Number"
  };
  return definitions[indicatorId as keyof typeof definitions] || "Percentage (%)";
};

export const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    // Pillar 1
    "1.1.1": 2, "1.1.2": 100, "1.1.3": 2, "1.1.4": 3, "1.2.1": 1, "1.2.2": 100, "1.2.3": 100, "1.2.4": 5,
    "1.3.1": 3, "1.3.2": 100, "1.3.3": 2, "1.3.4": 100, "1.4.1": 3, "1.4.2": 100, "1.4.3": 1, "1.4.4": 2,
    
    // Pillar 2
    "2.1.1": 100, "2.1.2": 100, "2.1.3": 5, "2.2.1": 200, "2.2.2": 100, "2.2.3": 40, "2.2.4": 3, "2.2.5": 3, 
    "2.3.1": 5, "2.3.2": 5, "2.3.3": 5, "2.3.4": 5,
    
    // Pillar 3
    "3.1.1": 5, "3.1.2": 100, "3.1.3": 5, "3.1.4": 5, "3.2.1": 100, "3.2.2": 5, "3.2.3": 1, 
    "3.3.1": 5, "3.3.2": 100, "3.3.3": 100, "3.4.1": 5, "3.4.2": 5, "3.4.3": 3, "3.4.4": 5, 
    "3.5.1": 5, "3.5.2": 5,
    
    // Pillar 4
    "4.1.1": 5, "4.1.2": 1, "4.1.3": 5, "4.2.1": 100, "4.2.2": 5, "4.2.3": 100, "4.3.1": 3, "4.3.2": 100,
    "4.4.1": 100, "4.4.2": 100, "4.4.3": 100,
    
    // Pillar 5
    "5.1.1": 5, "5.1.2": 100, "5.1.3": 100, "5.1.4": 5, "5.1.5": 3, "5.2.1": 100, "5.2.2": 5, 
    "5.2.3": 100, "5.2.4": 100,
    
    // Pillar 6
    "6.1.1": 100, "6.1.2": 100, "6.1.3": 5, "6.2.1": 3, "6.2.2": 2, "6.2.3": 5, "6.3.1": 100, 
    "6.3.2": 100, "6.3.3": 4
  };
  return definitions[indicatorId as keyof typeof definitions] || 100;
};

// ============================================================================
// EVIDENCE REQUIREMENT LOGIC - CENTRALIZED
// ============================================================================

export const isEvidenceRequired = (indicatorId: string, value: any): boolean => {
  if (value === null || value === undefined || value === "") return false;
  
  const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
  const numericValue = Number(value);
  
  // Binary indicators: evidence required if input is positive (1)
  if (measurementUnit.includes('Binary')) {
    return numericValue === 1;
  }
  
  // Percentage indicators: evidence required if input > 90% (very high performance)
  if (measurementUnit.includes('Percentage')) {
    return numericValue > 90;
  }
  
  // Number indicators: evidence required if input > 90% of max score (very high performance)
  if (measurementUnit === 'Number') {
    const maxScore = getIndicatorMaxScore(indicatorId);
    const threshold = maxScore * 0.9;
    return numericValue > threshold;
  }
  
  // Score indicators: evidence required if input > 90% of max score (more reasonable threshold)
  if (measurementUnit.includes('Score')) {
    const maxScore = getIndicatorMaxScore(indicatorId);
    const threshold = maxScore * 0.9;
    return numericValue > threshold;
  }
  
  // Hours indicators: evidence required if input > 35 hours (more reasonable threshold)
  if (measurementUnit.includes('Hours')) {
    return numericValue > 35;
  }
  
  // Ratio indicators: evidence NOT required (too strict)
  if (measurementUnit === 'Ratio') {
    return false;
  }
  
  // Default: evidence NOT required
  return false;
};

// ============================================================================
// SCORING CALCULATIONS - CENTRALIZED
// ============================================================================

export const calculateIndicatorScore = (indicatorId: string, value: any): number => {
  if (value === null || value === undefined || value === "") return 0;
  
  const measurementUnit = getIndicatorMeasurementUnit(indicatorId);
  const maxScore = getIndicatorMaxScore(indicatorId);
  const numericValue = Number(value);
  
  if (measurementUnit.includes("Score")) {
    return Math.min((numericValue / maxScore) * 100, 100);
  } else if (measurementUnit.includes("Percentage")) {
    return Math.min(numericValue, 100);
  } else if (measurementUnit.includes("Binary")) {
    return numericValue ? 100 : 0;
  } else if (measurementUnit === "Number") {
    return Math.min((numericValue / 200) * 100, 100);
  } else if (measurementUnit === "Ratio") {
    if (typeof value === 'string' && value.includes(':')) {
      const [proactive, reactive] = value.split(':').map(Number);
      const total = proactive + reactive;
      return total > 0 ? (proactive / total) * 100 : 0;
    }
    return Math.min(numericValue * 100, 100);
  } else if (measurementUnit.includes("Hours per employee")) {
    return Math.min((numericValue / 40) * 100, 100);
  }
  
  return 0;
};

// ============================================================================
// PROGRESS CALCULATIONS - CENTRALIZED
// ============================================================================

export interface IndicatorData {
  value: any;
  evidence?: {
    text?: { description?: string };
    link?: { url?: string; description?: string };
    file?: { fileName?: string; description?: string };
  };
}

export interface PillarData {
  indicators: { [indicatorId: string]: IndicatorData };
}

export const calculatePillarProgress = (pillarData: PillarData, pillarId: number, allIndicators: string[]): { completion: number; score: number } => {
  if (!pillarData || !pillarData.indicators) {
    return { completion: 0, score: 0 };
  }
  
  let completedIndicators = 0;
  let totalScore = 0;
  let scoredIndicators = 0;
  
  allIndicators.forEach(indicatorId => {
    const indicator = pillarData.indicators[indicatorId];
    if (!indicator) return;
    
    const hasValue = indicator.value !== null && indicator.value !== undefined && indicator.value !== "";
    const hasEvidence = indicator.evidence && (
      (indicator.evidence.text?.description && indicator.evidence.text.description.trim() !== '') ||
      (indicator.evidence.link?.url && indicator.evidence.link.url.trim() !== '') ||
      (indicator.evidence.file?.fileName && indicator.evidence.file.fileName.trim() !== '')
    );
    
    // If no value, indicator is not complete
    if (!hasValue) return;
    
    // Check if evidence is conditionally required
    const evidenceRequired = isEvidenceRequired(indicatorId, indicator.value);
    
    // Indicator is complete if it has a value AND (evidence is not required OR evidence is provided)
    const isComplete = hasValue && (!evidenceRequired || hasEvidence);
    
    if (isComplete) {
      completedIndicators++;
    }
    
    // Calculate score for this indicator
    const score = calculateIndicatorScore(indicatorId, indicator.value);
    if (hasValue) {
      totalScore += score;
      scoredIndicators++;
    }
  });
  
  const completion = allIndicators.length > 0 ? (completedIndicators / allIndicators.length) * 100 : 0;
  const averageScore = scoredIndicators > 0 ? totalScore / scoredIndicators : 0;
  
  return { completion, score: averageScore };
};

// ============================================================================
// VALIDATION HELPERS - CENTRALIZED
// ============================================================================

export const validateInstitutionData = (institutionData: any): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = [
    { key: 'name', label: 'Institution Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'organizationSize', label: 'Organization Size' },
    { key: 'country', label: 'Country' },
    { key: 'contactEmail', label: 'Contact Email' }
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = institutionData[field.key];
    if (field.key === 'name') {
      return !value || value.trim().length < 2;
    }
    if (field.key === 'contactEmail') {
      return !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return !value || value.trim() === '';
  }).map(field => field.label);
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// ============================================================================
// EVIDENCE VALIDATION - CENTRALIZED
// ============================================================================

export const validateEvidence = (evidence: any): boolean => {
  if (!evidence) return false;
  
  const hasValidEvidence = !!(
    (evidence.text?.description && evidence.text.description.trim() !== '') ||
    (evidence.link?.url && evidence.link.url.trim() !== '') ||
    (evidence.link?.description && evidence.link.description.trim() !== '') ||
    (evidence.file?.fileName && evidence.file.fileName.trim() !== '')
  );
  
  // Debug logging for evidence validation
  if (!hasValidEvidence && evidence) {
    console.log('🔍 Evidence validation failed:', {
      hasText: !!(evidence.text?.description && evidence.text.description.trim() !== ''),
      hasLinkUrl: !!(evidence.link?.url && evidence.link.url.trim() !== ''),
      hasLinkDescription: !!(evidence.link?.description && evidence.link.description.trim() !== ''),
      hasFile: !!(evidence.file?.fileName && evidence.file.fileName.trim() !== ''),
      evidence: evidence
    });
  }
  
  return hasValidEvidence;
};

// ============================================================================
// DEBOUNCE UTILITY - CENTRALIZED
// ============================================================================

export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
};
