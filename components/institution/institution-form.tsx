"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Building2, Upload, CheckCircle } from "lucide-react"
import { useData } from "@/contexts/data-context"

const industries = [
  "Technology",
  "Healthcare & Medical",
  "Financial Services",
  "Manufacturing",
  "Education",
  "Retail & E-commerce",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Media & Entertainment",
  "Consulting",
  "Government & Public Sector",
  "Non-profit",
  "Other"
]

const organizationSizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5000+ employees"
]

const countries = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "India",
  "China",
  "Japan",
  "Australia",
  "Brazil",
  "Other"
]

export function InstitutionForm() {
  const { state, updateInstitution } = useData()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const institutionData = state.currentApplication?.institutionData

  // Initialize logo preview
  useEffect(() => {
    if (institutionData?.logo) {
      setLogoPreview(institutionData.logo)
    }
  }, [institutionData?.logo])

  // Validation function
  const validateField = useCallback((field: string, value: any) => {
    const errors: {[key: string]: string} = {}
    
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          errors.name = "Institution name must be at least 2 characters"
        }
        break
      case 'contactEmail':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.contactEmail = "Please enter a valid email address"
        }
        break
      case 'yearFounded':
        const currentYear = new Date().getFullYear()
        if (value && (value < 1800 || value > currentYear)) {
          errors.yearFounded = `Year must be between 1800 and ${currentYear}`
        }
        break
      case 'website':
        if (value && !/^https?:\/\/.+/.test(value)) {
          errors.website = "Website must start with http:// or https://"
        }
        break
    }
    
    setValidationErrors(prev => {
      const updated = { ...prev, ...errors }
      if (!errors[field]) {
        delete updated[field]
      }
      return updated
    })
    
    return Object.keys(errors).length === 0
  }, [])

  // Handle input changes with validation
  const handleInputChange = useCallback((field: string, value: any) => {
    // Clean value for strings
    if (typeof value === 'string') {
      value = value.trim()
    }
    
    // Validate the field
    validateField(field, value)
    
    // Update the data
    updateInstitution({ [field]: value })
  }, [updateInstitution, validateField])

  // Handle logo upload
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Logo file must be smaller than 2MB")
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        updateInstitution({ logo: result })
      }
      reader.readAsDataURL(file)
    }
  }, [updateInstitution])

  // Get missing required fields
  const getMissingFields = useCallback(() => {
    if (!institutionData) return ["All fields"]
    
    const missing = []
    if (!institutionData.name || institutionData.name.trim().length < 2) missing.push("Institution Name")
    if (!institutionData.industry) missing.push("Industry")
    if (!institutionData.organizationSize) missing.push("Organization Size")
    if (!institutionData.country) missing.push("Country")
    if (!institutionData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(institutionData.contactEmail)) missing.push("Valid Contact Email")
    
    return missing
  }, [institutionData])

  const missingFields = getMissingFields()
  const isComplete = missingFields.length === 0

  if (!institutionData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading institution data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Summary */}
      <Card className={`border-l-4 ${isComplete ? 'border-l-green-500 bg-green-50/50' : 'border-l-orange-500 bg-orange-50/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            <h3 className="font-semibold">
              {isComplete ? "Institution Setup Complete" : "Required Fields Missing"}
            </h3>
          </div>
        </CardHeader>
        {!isComplete && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-2">Please complete the following required fields:</p>
            <div className="flex flex-wrap gap-1">
              {missingFields.map((field, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Institution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Institution Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={institutionData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., IIICI Innovation Labs"
                className={validationErrors.name ? "border-destructive" : ""}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive">{validationErrors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-1">
                Industry <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={institutionData.industry || ""} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Organization Size */}
            <div className="space-y-2">
              <Label htmlFor="organizationSize" className="flex items-center gap-1">
                Organization Size <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={institutionData.organizationSize || ""} 
                onValueChange={(value) => handleInputChange('organizationSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization size" />
                </SelectTrigger>
                <SelectContent>
                  {organizationSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-1">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={institutionData.country || ""} 
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Founded */}
            <div className="space-y-2">
              <Label htmlFor="yearFounded">Year Founded</Label>
              <Input
                id="yearFounded"
                type="number"
                value={institutionData.yearFounded || ""}
                onChange={(e) => handleInputChange('yearFounded', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 1995"
                min="1800"
                max={new Date().getFullYear()}
                className={validationErrors.yearFounded ? "border-destructive" : ""}
              />
              {validationErrors.yearFounded && (
                <p className="text-xs text-destructive">{validationErrors.yearFounded}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={institutionData.website || ""}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className={validationErrors.website ? "border-destructive" : ""}
              />
              {validationErrors.website && (
                <p className="text-xs text-destructive">{validationErrors.website}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-1">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={institutionData.contactEmail || ""}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
                className={validationErrors.contactEmail ? "border-destructive" : ""}
              />
              {validationErrors.contactEmail && (
                <p className="text-xs text-destructive">{validationErrors.contactEmail}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={institutionData.contactPhone || ""}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Institution Logo</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground">
                PNG, JPG up to 2MB
              </span>
            </div>
            {logoPreview && (
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain border rounded"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}