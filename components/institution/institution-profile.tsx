"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { Building2, Globe, Mail, Phone, MapPin, Calendar, Edit, Save, X, Users } from "lucide-react"

export function InstitutionProfile() {
  const { state, updateInstitution } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const application = state.currentApplication
  const institutionData = application?.institutionData

  if (!institutionData) return null

  const handleEdit = () => {
    setEditData(institutionData)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateInstitution(editData)
    setIsEditing(false)
    setEditData({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input
                  value={editData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label>Year Founded</Label>
                <Input
                  type="number"
                  value={editData.yearFounded || ""}
                  onChange={(e) => handleChange("yearFounded", Number.parseInt(e.target.value) || 0)}
                  placeholder="e.g., 1995"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={editData.industry || ""} onValueChange={(value) => handleChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization Size</Label>
                <Select
                  value={editData.organizationSize || ""}
                  onValueChange={(value) => handleChange("organizationSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup (1-10 employees)">Startup (1-10 employees)</SelectItem>
                    <SelectItem value="Small (11-50 employees)">Small (11-50 employees)</SelectItem>
                    <SelectItem value="Medium (51-250 employees)">Medium (51-250 employees)</SelectItem>
                    <SelectItem value="Large (251-1000 employees)">Large (251-1000 employees)</SelectItem>
                    <SelectItem value="Enterprise (1000+ employees)">Enterprise (1000+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Institution Name</div>
                  <div className="text-sm text-muted-foreground">{institutionData.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Founded</div>
                  <div className="text-sm text-muted-foreground">{institutionData.yearFounded || "Not specified"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </Badge>
                <div>
                  <div className="text-sm font-medium">Industry</div>
                  <div className="text-sm text-muted-foreground">{institutionData.industry}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Organization Size</div>
                  <div className="text-sm text-muted-foreground">{institutionData.organizationSize}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Country</div>
                  <div className="text-sm text-muted-foreground">{institutionData.country}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={editData.contactEmail || ""}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={editData.contactPhone || ""}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Website</Label>
                <Input
                  value={editData.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{institutionData.contactEmail}</div>
                </div>
              </div>
              {institutionData.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">{institutionData.contactPhone}</div>
                  </div>
                </div>
              )}
              {institutionData.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Website</div>
                    <a
                      href={institutionData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {institutionData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of your institution..."
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {institutionData.description ? (
                <p className="text-sm text-muted-foreground">{institutionData.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description provided</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
