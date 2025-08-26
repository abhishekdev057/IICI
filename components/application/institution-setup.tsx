"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/contexts/data-context"
import { Building2, Upload, X, Image } from "lucide-react"

export function InstitutionSetup() {
  const { state, updateInstitution } = useData()
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    organizationSize: "",
    country: "",
    contactEmail: "",
    website: "",
    description: "",
    logo: ""
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const application = state.currentApplication

  useEffect(() => {
    if (application?.institutionData) {
      setFormData({
        name: application.institutionData.name || "",
        industry: application.institutionData.industry || "",
        organizationSize: application.institutionData.organizationSize || "",
        country: application.institutionData.country || "",
        contactEmail: application.institutionData.contactEmail || "",
        website: application.institutionData.website || "",
        description: application.institutionData.description || "",
        logo: application.institutionData.logo || ""
      })
      // Set logo preview if logo exists
      if (application.institutionData.logo) {
        setLogoPreview(application.institutionData.logo)
      }
    }
  }, [application?.institutionData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateInstitution({ [field]: value })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setFormData(prev => ({ ...prev, logo: result }))
        updateInstitution({ logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setFormData(prev => ({ ...prev, logo: "" }))
    updateInstitution({ logo: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.industry.trim() &&
      formData.organizationSize.trim() &&
      formData.country.trim() &&
      formData.contactEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Institution Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your institution name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationSize">Organization Size *</Label>
              <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange("organizationSize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                  <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                  <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                  <SelectItem value="201-1000 employees">201-1000 employees</SelectItem>
                  <SelectItem value="1001-5000 employees">1001-5000 employees</SelectItem>
                  <SelectItem value="5000+ employees">5000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter your country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                placeholder="Enter contact email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://your-website.com"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label>Institution Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Institution logo"
                    className="w-20 h-20 object-contain border rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground/50" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square image, max 5MB (PNG, JPG, GIF)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your institution"
              className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-red-500">*</span>
            <span>Required fields</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
