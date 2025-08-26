"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Upload, File, Link, CheckCircle, AlertCircle } from "lucide-react"

interface Indicator {
  id: string
  shortName: string
  description: string
  measurementUnit: string
  remark?: string
  example?: string
  evidenceRequired: string
  maxScore?: number
}

interface IndicatorInputProps {
  indicator: Indicator
  value: any
  onChange: (value: any) => void
  onEvidenceChange: (evidence: any) => void
  evidence?: any
}

export function IndicatorInput({
  indicator,
  value,
  onChange,
  onEvidenceChange,
  evidence
}: IndicatorInputProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [localValue, setLocalValue] = useState(value || "")
  const [localEvidence, setLocalEvidence] = useState(evidence || {
    type: "text",
    description: "",
    url: "",
    fileName: ""
  })

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || "")
  }, [value])

  // Update local evidence when prop changes
  useEffect(() => {
    if (evidence) {
      setLocalEvidence(evidence)
    }
  }, [evidence])

  // Handle value change with debouncing
  const handleValueChange = useCallback((newValue: any) => {
    setLocalValue(newValue)
    
    // Debounce the onChange call
    const timeoutId = setTimeout(() => {
      onChange(newValue)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [onChange])

  // Handle evidence change
  const handleEvidenceChange = useCallback((field: string, value: any) => {
    const updatedEvidence = {
      ...localEvidence,
      [field]: value
    }
    setLocalEvidence(updatedEvidence)
    onEvidenceChange(updatedEvidence)
  }, [localEvidence, onEvidenceChange])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File must be smaller than 10MB")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleEvidenceChange('url', result)
        handleEvidenceChange('fileName', file.name)
        handleEvidenceChange('type', 'file')
      }
      reader.readAsDataURL(file)
    }
  }, [handleEvidenceChange])

  // Get input type based on measurement unit
  const getInputType = () => {
    if (indicator.measurementUnit.includes("Percentage")) return "percentage"
    if (indicator.measurementUnit.includes("Score")) return "score"
    if (indicator.measurementUnit.includes("Binary")) return "binary"
    if (indicator.measurementUnit.includes("Number")) return "number"
    return "text"
  }

  // Render input based on type
  const renderInput = () => {
    const inputType = getInputType()
    
    switch (inputType) {
      case "percentage":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={localValue}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                placeholder="0-100"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        )
        
      case "score":
        const maxScore = indicator.maxScore || 5
        return (
          <div className="space-y-2">
            <Select 
              value={localValue?.toString() || ""} 
              onValueChange={(value) => handleValueChange(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select score (0-${maxScore})`} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxScore + 1 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} / {maxScore}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        
      case "binary":
        return (
          <div className="space-y-2">
            <Select 
              value={localValue?.toString() || ""} 
              onValueChange={(value) => handleValueChange(value === "1" ? 1 : 0)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
        
      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              min="0"
              max="1000"
              value={localValue}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              placeholder="Enter number (0-1000)"
            />
          </div>
        )
        
      default:
        return (
          <div className="space-y-2">
            <Textarea
              value={localValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter your response..."
              rows={3}
            />
          </div>
        )
    }
  }

  const hasValue = localValue !== "" && localValue !== undefined && localValue !== null
  const hasEvidence = localEvidence.description || localEvidence.url || localEvidence.fileName

  return (
    <Card className={`relative ${hasValue ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {indicator.shortName}
              <Badge variant="outline" className="text-xs">
                {indicator.measurementUnit}
              </Badge>
              {hasValue && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {indicator.description}
            </p>
          </div>
          
          {/* Info Tooltip */}
          <div className="relative">
            <Info
              className="h-4 w-4 text-muted-foreground cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute z-50 right-0 top-6 bg-popover border rounded-md p-3 shadow-md max-w-sm">
                <div className="space-y-2">
                  {indicator.remark && (
                    <>
                      <p className="font-medium text-sm">Note:</p>
                      <p className="text-xs">{indicator.remark}</p>
                    </>
                  )}
                  {indicator.example && (
                    <>
                      <p className="font-medium text-sm">Example:</p>
                      <p className="text-xs">{indicator.example}</p>
                    </>
                  )}
                  <div>
                    <p className="font-medium text-sm">Evidence Required:</p>
                    <p className="text-xs">{indicator.evidenceRequired}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Value Input */}
        <div>
          <Label className="text-sm font-medium">Response</Label>
          {renderInput()}
        </div>

        {/* Evidence Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Supporting Evidence</Label>
            {hasEvidence && (
              <Badge variant="outline" className="text-xs text-green-600">
                Evidence Provided
              </Badge>
            )}
          </div>
          
          {/* Evidence Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={localEvidence.type === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => handleEvidenceChange('type', 'text')}
              className="flex items-center gap-1"
            >
              <File className="h-3 w-3" />
              Text
            </Button>
            <Button
              type="button"
              variant={localEvidence.type === "link" ? "default" : "outline"}
              size="sm"
              onClick={() => handleEvidenceChange('type', 'link')}
              className="flex items-center gap-1"
            >
              <Link className="h-3 w-3" />
              Link
            </Button>
            <Button
              type="button"
              variant={localEvidence.type === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => document.getElementById(`file-${indicator.id}`)?.click()}
              className="flex items-center gap-1"
            >
              <Upload className="h-3 w-3" />
              File
            </Button>
          </div>

          {/* Evidence Input Based on Type */}
          {localEvidence.type === "text" && (
            <Textarea
              value={localEvidence.description || ""}
              onChange={(e) => handleEvidenceChange('description', e.target.value)}
              placeholder="Describe your evidence..."
              rows={2}
            />
          )}

          {localEvidence.type === "link" && (
            <div className="space-y-2">
              <Input
                value={localEvidence.url || ""}
                onChange={(e) => handleEvidenceChange('url', e.target.value)}
                placeholder="https://example.com/evidence"
              />
              <Textarea
                value={localEvidence.description || ""}
                onChange={(e) => handleEvidenceChange('description', e.target.value)}
                placeholder="Brief description of the link..."
                rows={2}
              />
            </div>
          )}

          {localEvidence.type === "file" && (
            <div className="space-y-2">
              <input
                id={`file-${indicator.id}`}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              />
              {localEvidence.fileName && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <File className="h-4 w-4" />
                  <span className="text-sm">{localEvidence.fileName}</span>
                </div>
              )}
              <Textarea
                value={localEvidence.description || ""}
                onChange={(e) => handleEvidenceChange('description', e.target.value)}
                placeholder="Brief description of the file..."
                rows={2}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}