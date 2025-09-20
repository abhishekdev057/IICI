# CONDITIONAL EVIDENCE REQUIREMENT FIX

## Issue Description
**PROBLEM**: The system was incorrectly requiring evidence for indicators that shouldn't need it based on conditional evidence requirements. Users were seeing "Evidence required" for indicators where evidence should only be required under specific conditions (e.g., high scores, positive binary values, etc.).

## Root Cause
The validation logic in `clean-form-wizard.tsx` had an old `isEvidenceRequired` function that was defaulting to `return true` for most indicators, causing evidence to be required even when it shouldn't be based on the conditional logic.

## Evidence Requirements Logic (Fixed)

### **Conditional Evidence Requirements:**
- **Binary indicators**: Evidence required ONLY if value = 1 (positive)
- **Percentage indicators**: Evidence required ONLY if value > 50%
- **Number indicators**: Evidence required ONLY if value > 50
- **Score indicators**: Evidence required ONLY if value > 50% of max score
- **Hours indicators**: Evidence required ONLY if value > 20 hours
- **Ratio indicators**: Evidence NOT required (too strict)
- **Default**: Evidence NOT required unless explicitly needed

### **Examples:**
- Indicator 1.1.3 (Score 1-2): Evidence required only if score > 1 (50% of max)
- Indicator 1.1.4 (Score 1-3): Evidence required only if score > 1.5 (50% of max)
- Indicator 1.2.1 (Binary): Evidence required only if value = 1
- Indicator 1.2.2 (Score 1-3): Evidence required only if score > 1.5
- Indicator 1.2.3 (Score 1-2): Evidence required only if score > 1
- Indicator 1.3.2 (Score 1-2): Evidence required only if score > 1
- Indicator 1.3.4 (Score 1-3): Evidence required only if score > 1.5
- Indicator 1.4.2 (Score 1-2): Evidence required only if score > 1

## Fixes Applied

### 1. **Fixed Form Validation Logic** (`clean-form-wizard.tsx`)
```typescript
// BEFORE: Old function defaulted to requiring evidence
const isEvidenceRequired = (indicatorId: string, value: any, measurementUnit: string) => {
  // ... conditional logic ...
  return true; // ❌ WRONG: Always required evidence
}

// AFTER: Fixed function with proper conditional logic
const checkEvidenceRequired = useCallback((indicatorId: string, value: any) => {
  // ... conditional logic ...
  return false; // ✅ CORRECT: Default to NOT requiring evidence
}, [])
```

### 2. **Updated Progress Calculation** (`application-context.tsx`)
```typescript
// BEFORE: Simple completion check
const completedIndicators = allIndicators.filter(indicatorId => {
  const hasValue = indicator.value !== null && indicator.value !== undefined && indicator.value !== "";
  const hasEvidence = /* evidence check */;
  return hasValue || hasEvidence; // ❌ WRONG: Didn't consider conditional evidence
});

// AFTER: Conditional evidence logic
const completedIndicators = allIndicators.filter(indicatorId => {
  const hasValue = indicator.value !== null && indicator.value !== undefined && indicator.value !== "";
  const hasEvidence = /* evidence check */;
  
  // Check if evidence is conditionally required
  let evidenceRequired = false;
  if (measurementUnit.includes('Binary')) {
    evidenceRequired = Number(value) === 1;
  } else if (measurementUnit.includes('Percentage')) {
    evidenceRequired = Number(value) > 50;
  }
  // ... other conditions ...
  
  return hasValue && (!evidenceRequired || hasEvidence); // ✅ CORRECT: Conditional logic
});
```

### 3. **Removed Conflicting Function**
- Removed the old `isEvidenceRequired` function that was causing conflicts
- Consolidated all evidence requirement logic into `checkEvidenceRequired`

## Files Modified

### 1. `components/application/clean-form-wizard.tsx`
- ✅ Removed old `isEvidenceRequired` function
- ✅ Fixed `checkEvidenceRequired` function with proper conditional logic
- ✅ Added detailed console logging for debugging
- ✅ Default evidence requirement set to `false` unless explicitly needed

### 2. `contexts/application-context.tsx`
- ✅ Updated `calculatePillarProgress` function
- ✅ Applied same conditional evidence logic to progress calculation
- ✅ Ensured consistency between form validation and progress calculation

## Expected Behavior After Fix

✅ **Low Values**: No evidence required for low scores/percentages  
✅ **High Values**: Evidence required only for high scores/percentages  
✅ **Binary Values**: Evidence required only for positive (1) values  
✅ **Progress Calculation**: Accurate completion percentage based on conditional evidence  
✅ **Step Navigation**: Users can proceed when indicators are properly completed  

## Testing Instructions

### 1. **Test Low Values (No Evidence Required)**
1. Enter low values (e.g., score 1, percentage 30%, number 20)
2. Verify no "Evidence required" message appears
3. Check that progress increases without evidence

### 2. **Test High Values (Evidence Required)**
1. Enter high values (e.g., score 2, percentage 80%, number 100)
2. Verify "Evidence required" message appears
3. Add evidence and verify completion

### 3. **Test Binary Values**
1. Enter 0 for binary indicator - no evidence required
2. Enter 1 for binary indicator - evidence required
3. Verify conditional logic works correctly

### 4. **Test Progress Calculation**
1. Complete indicators with low values (no evidence needed)
2. Verify progress percentage increases correctly
3. Check that step navigation works properly

## Console Debugging

The fix includes detailed console logging:
```javascript
🔍 Checking evidence requirement for 1.1.3: { value: 1, measurementUnit: "Score (1-2)", valueType: "number" }
Score check for 1.1.3: value=1, maxScore=2, threshold=1, result=false
```

## Status: ✅ RESOLVED

The conditional evidence requirement issue has been fixed. Users will now only be required to provide evidence when it's actually needed based on the conditional logic, not for every indicator with a value.

**Key Changes:**
- Evidence is now required only when values exceed thresholds
- Progress calculation respects conditional evidence requirements
- Step navigation works correctly with proper validation
- Detailed logging helps with debugging any remaining issues
