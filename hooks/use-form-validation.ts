import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FormValidation {
  [key: string]: ValidationRule
}

export function useFormValidation(validationRules: FormValidation) {
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})

  const validateField = useCallback((fieldName: string, value: any): string[] => {
    const rules = validationRules[fieldName]
    if (!rules) return []

    const fieldErrors: string[] = []

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      fieldErrors.push(`${fieldName} is required`)
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      fieldErrors.push(`${fieldName} must be at least ${rules.minLength} characters`)
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      fieldErrors.push(`${fieldName} must be no more than ${rules.maxLength} characters`)
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      fieldErrors.push(`${fieldName} format is invalid`)
    }

    // Custom validation
    if (rules.custom && value) {
      const customResult = rules.custom(value)
      if (typeof customResult === 'string') {
        fieldErrors.push(customResult)
      } else if (!customResult) {
        fieldErrors.push(`${fieldName} is invalid`)
      }
    }

    return fieldErrors
  }, [validationRules])

  const validateForm = useCallback((formData: { [key: string]: any }): boolean => {
    const newErrors: { [key: string]: string[] } = {}
    let isValid = true

    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName])
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validationRules, validateField])

  const validateSingleField = useCallback((fieldName: string, value: any): boolean => {
    const fieldErrors = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }))
    return fieldErrors.length === 0
  }, [validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  }
}
