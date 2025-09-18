"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Upload, 
  Link, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Save,
  X,
  HelpCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useApplication } from "@/contexts/application-context"

interface Indicator {
  id: string
  shortName: string
  description: string
  howToCalculate: string
  measurementUnit: string
  remark: string
  example: string
  evidenceRequired: string
  maxScore?: number
}

interface CleanIndicatorInputProps {
  indicator: Indicator
  pillarId: number
  value: any
  evidence: any
  onChange: (value: any) => void
  onEvidenceChange: (evidence: any) => void
  className?: string
}

export function CleanIndicatorInput({
  indicator,
  pillarId,
  value,
  evidence,
  onChange,
  onEvidenceChange,
  className
}: CleanIndicatorInputProps) {
  const { state } = useApplication()
  const { toast } = useToast()
  
  const [localValue, setLocalValue] = useState(value)
  const [localEvidence, setLocalEvidence] = useState(evidence || {})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("input")
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  useEffect(() => {
    setLocalEvidence(evidence || {})
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
  const handleEvidenceChange = useCallback((type: 'text' | 'link' | 'file', field: string, evidenceValue: any) => {
    setLocalEvidence(prev => {
      const updatedEvidence = { ...prev }
      
      if (!updatedEvidence[type]) {
        updatedEvidence[type] = {} as any
      }
      
      (updatedEvidence[type] as any)[field] = evidenceValue
      
      // Call parent callback
      onEvidenceChange(updatedEvidence)
      
      return updatedEvidence
    })
  }, [onEvidenceChange])
  
  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)
      
      // In a real implementation, you would upload to a file storage service
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Update evidence with file information
      handleEvidenceChange('file', 'fileName', file.name)
      handleEvidenceChange('file', 'fileSize', file.size)
      handleEvidenceChange('file', 'fileType', file.type)
      handleEvidenceChange('file', 'url', URL.createObjectURL(file))
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [handleEvidenceChange, toast])
  
  // Remove evidence type
  const removeEvidenceType = useCallback((type: 'text' | 'link' | 'file') => {
    setLocalEvidence(prev => {
      const updatedEvidence = { ...prev }
      delete updatedEvidence[type]
      onEvidenceChange(updatedEvidence)
      return updatedEvidence
    })
  }, [onEvidenceChange])
  
  // Calculate progress
  const hasValue = localValue !== null && localValue !== undefined && localValue !== ""
  
  // Check if evidence is required based on input value
  const isEvidenceRequired = () => {
    if (!hasValue) return false
    
    // Binary indicators: evidence required if input is positive (1)
    if (indicator.measurementUnit.includes('Binary')) {
      return Number(localValue) === 1
    }
    
    // Percentage indicators: evidence required if input > 50%
    if (indicator.measurementUnit.includes('Percentage')) {
      return Number(localValue) > 50
    }
    
    // Number indicators: evidence required if input > 50
    if (indicator.measurementUnit === 'Number') {
      return Number(localValue) > 50
    }
    
    // Score indicators: evidence required if input > 50% of max score
    if (indicator.measurementUnit.includes('Score')) {
      const maxScore = indicator.maxScore || 5
      return Number(localValue) > (maxScore * 0.5)
    }
    
    // Hours indicators: evidence required if input > 20 hours
    if (indicator.measurementUnit.includes('Hours')) {
      return Number(localValue) > 20
    }
    
    // Ratio indicators: evidence required if input is not empty
    if (indicator.measurementUnit === 'Ratio') {
      return true
    }
    
    // Default: evidence required if input is not empty
    return true
  }
  
  const evidenceRequired = isEvidenceRequired()
  const hasEvidence = !!(
    localEvidence.text?.description ||
    localEvidence.link?.url ||
    localEvidence.file?.fileName
  )
  const isComplete = hasValue && (!evidenceRequired || hasEvidence)
  
  // Get progress percentage
  const getProgress = () => {
    let progress = 0
    if (hasValue) progress += 50
    if (evidenceRequired) {
      if (hasEvidence) progress += 50
    } else {
      progress += 50 // Evidence not required, so full progress
    }
    return progress
  }
  
  // Get status badge
  const getStatusBadge = () => {
    if (isComplete) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
    } else if (hasValue) {
      if (evidenceRequired && !hasEvidence) {
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Evidence Required</Badge>
      } else {
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>
      }
    } else {
      return <Badge variant="outline">Not Started</Badge>
    }
  }
  
  // Render input based on measurement unit
  const renderInput = () => {
    const measurementUnit = indicator.measurementUnit
    const maxScore = indicator.maxScore || 100
    
    if (measurementUnit.includes('Score')) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-score`}>Score (0-{maxScore}) <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-score`}
            type="number"
            min="0"
            max={maxScore}
            step="0.1"
            value={localValue || ''}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || null)}
            placeholder={`Enter score between 0 and ${maxScore}`}
          />
        </div>
      )
    } else if (measurementUnit.includes('Percentage')) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-percentage`}>Percentage (%) <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-percentage`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={localValue || ''}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || null)}
            placeholder="Enter percentage (0-100)"
          />
        </div>
      )
    } else if (measurementUnit.includes('Binary')) {
      return (
        <div className="space-y-2">
          <Label>Binary Choice <span className="text-red-500">*</span></Label>
          <div className="flex gap-4">
            <Button
              variant={localValue === 1 ? "default" : "outline"}
              onClick={() => handleValueChange(1)}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={localValue === 0 ? "default" : "outline"}
              onClick={() => handleValueChange(0)}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>
      )
    } else if (measurementUnit === 'Ratio') {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-ratio`}>Ratio (e.g., 3:1) <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-ratio`}
            type="text"
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter ratio (e.g., 3:1)"
          />
        </div>
      )
    } else if (measurementUnit.includes('Hours per employee')) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-hours`}>Hours per Employee <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-hours`}
            type="number"
            min="0"
            step="0.5"
            value={localValue || ''}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || null)}
            placeholder="Enter hours per employee"
          />
        </div>
      )
    } else if (measurementUnit === 'Number') {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-number`}>Number <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-number`}
            type="number"
            min="0"
            value={localValue || ''}
            onChange={(e) => handleValueChange(parseInt(e.target.value) || null)}
            placeholder="Enter number"
          />
        </div>
      )
    } else {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-text`}>Value <span className="text-red-500">*</span></Label>
          <Input
            id={`${indicator.id}-text`}
            type="text"
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
          />
        </div>
      )
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{indicator.id}</span>
              {indicator.shortName}
              <span className="text-red-500 text-lg">*</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{indicator.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          Instructions for {indicator.shortName}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">How to Calculate</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {indicator.howToCalculate}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Example</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {indicator.example}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Remark</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {indicator.remark}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View calculation instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            {renderInput()}
          </TabsContent>
          
          <TabsContent value="evidence" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Evidence Required</Label>
                {evidenceRequired && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Required
                  </Badge>
                )}
                {!evidenceRequired && hasValue && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Not Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {indicator.evidenceRequired}
              </p>
              {evidenceRequired && !hasEvidence && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Evidence is required for this input value. Please provide supporting documentation.
                  </p>
                </div>
              )}
            </div>
            
            {/* Text Evidence */}
            {localEvidence.text && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text Evidence
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidenceType('text')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={localEvidence.text.description || ''}
                  onChange={(e) => handleEvidenceChange('text', 'description', e.target.value)}
                  placeholder="Enter text evidence..."
                  rows={3}
                />
              </div>
            )}
            
            {/* Link Evidence */}
            {localEvidence.link && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Link Evidence
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidenceType('link')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={localEvidence.link.url || ''}
                  onChange={(e) => handleEvidenceChange('link', 'url', e.target.value)}
                  placeholder="Enter URL..."
                />
                <Textarea
                  value={localEvidence.link.description || ''}
                  onChange={(e) => handleEvidenceChange('link', 'description', e.target.value)}
                  placeholder="Enter link description..."
                  rows={2}
                />
              </div>
            )}
            
            {/* File Evidence */}
            {localEvidence.file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    File Evidence
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidenceType('file')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input
                    value={localEvidence.file.fileName || ''}
                    onChange={(e) => handleEvidenceChange('file', 'fileName', e.target.value)}
                    placeholder="File name..."
                  />
                  <Textarea
                    value={localEvidence.file.description || ''}
                    onChange={(e) => handleEvidenceChange('file', 'description', e.target.value)}
                    placeholder="File description..."
                    rows={2}
                  />
                </div>
              </div>
            )}
            
            {/* Add Evidence Buttons */}
            <div className="flex gap-2">
              {!localEvidence.text && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalEvidence(prev => ({ ...prev, text: { description: '' } }))}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              )}
              {!localEvidence.link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalEvidence(prev => ({ ...prev, link: { url: '', description: '' } }))}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              )}
              {!localEvidence.file && (
                <div>
                  <input
                    type="file"
                    id={`file-upload-${indicator.id}`}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`file-upload-${indicator.id}`)?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
