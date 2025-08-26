"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Info, Upload, File, Link, CheckCircle, AlertCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
    fileName: "",
    fileSize: null,
    fileType: null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { toast } = useToast()

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

  // Handle file upload with progress tracking
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setUploadError(null)
    setUploadProgress(0)
    setIsUploading(true)

    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError("File must be smaller than 10MB")
      setIsUploading(false)
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`File type not supported. Allowed: ${allowedExtensions.join(', ')}`)
      setIsUploading(false)
      toast({
        title: "Unsupported File Type",
        description: `Please select a file with one of these extensions: ${allowedExtensions.join(', ')}`,
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        setUploadProgress(progress)
      }
    }

    reader.onload = (e) => {
      const result = e.target?.result as string
      handleEvidenceChange('url', result)
      handleEvidenceChange('fileName', file.name)
      handleEvidenceChange('fileSize', file.size)
      handleEvidenceChange('fileType', file.type)
      handleEvidenceChange('type', 'file')
      
      setIsUploading(false)
      setUploadProgress(100)
      
      toast({
        title: "File Uploaded Successfully!",
        description: `${file.name} has been uploaded as evidence.`,
        variant: "default",
      })

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000)
    }

    reader.onerror = () => {
      setUploadError("Failed to read file. Please try again.")
      setIsUploading(false)
      toast({
        title: "Upload Failed",
        description: "Failed to read file. Please try again.",
        variant: "destructive",
      })
    }

    reader.readAsDataURL(file)
  }, [handleEvidenceChange, toast])

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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                disabled={isUploading}
              />
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadError(null)}
                    className="h-auto p-1 ml-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* File Display */}
              {localEvidence.fileName && !isUploading && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <File className="h-4 w-4" />
                  <span className="text-sm flex-1">{localEvidence.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleEvidenceChange('fileName', '')
                      handleEvidenceChange('url', '')
                      handleEvidenceChange('fileSize', null)
                      handleEvidenceChange('fileType', null)
                      handleEvidenceChange('type', 'text')
                      setUploadError(null)
                    }}
                    className="h-auto p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* File Type Info */}
              <div className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP (max 10MB)
              </div>

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