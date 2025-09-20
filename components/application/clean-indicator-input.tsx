"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { validateEvidence, isEvidenceRequired } from "@/lib/application-utils"

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

// Helper functions for evidence requirements (same as validation logic)
const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    // Pillar 1
    "1.1.1": "Score (0-2)", "1.1.2": "Percentage (%)", "1.1.3": "Score (0-2)", "1.1.4": "Score (0-3)",
    "1.2.1": "Binary (0-1)", "1.2.2": "Percentage (%)", "1.2.3": "Percentage (%)", "1.2.4": "Score (1-5)",
    "1.3.1": "Score (0-3)", "1.3.2": "Percentage (%)", "1.3.3": "Score (0-2)", "1.3.4": "Percentage (%)",
    "1.4.1": "Score (0-3)", "1.4.2": "Percentage (%)", "1.4.3": "Binary (0-1)", "1.4.4": "Score (0-2)",
    
    // Pillar 2
    "2.1.1": "Percentage (%)", "2.1.2": "Percentage (%)", "2.1.3": "Score (1-5)",
    "2.2.1": "Score (0-3)", "2.2.2": "Score (0-3)", "2.2.3": "Hours per employee", "2.2.4": "Score (0-3)", "2.2.5": "Score (0-3)",
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

const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    "1.1.1": 2, "1.1.2": 100, "1.1.3": 2, "1.1.4": 3, "1.2.1": 1, "1.2.2": 100, "1.2.3": 100, "1.2.4": 5,
    "1.3.1": 3, "1.3.2": 100, "1.3.3": 2, "1.3.4": 100, "1.4.1": 3, "1.4.2": 100, "1.4.3": 1, "1.4.4": 2,
    "2.1.1": 100, "2.1.2": 100, "2.1.3": 5, "2.2.1": 3, "2.2.2": 3, "2.2.3": 40, "2.2.4": 3, "2.2.5": 3, "2.3.1": 5, "2.3.2": 5, "2.3.3": 5, "2.3.4": 5,
    "3.1.1": 5, "3.1.2": 100, "3.1.3": 5, "3.1.4": 5, "3.2.1": 100, "3.2.2": 5, "3.2.3": 1, "3.3.1": 5, "3.3.2": 100, "3.3.3": 100,
    "3.4.1": 5, "3.4.2": 5, "3.4.3": 3, "3.4.4": 5, "3.5.1": 5, "3.5.2": 5,
    "4.1.1": 5, "4.1.2": 1, "4.1.3": 5, "4.2.1": 100, "4.2.2": 5, "4.2.3": 100, "4.3.1": 3, "4.3.2": 100,
    "4.4.1": 100, "4.4.2": 100, "4.4.3": 100, "5.1.1": 5, "5.1.2": 100, "5.1.3": 100, "5.1.4": 5, "5.1.5": 3,
    "5.2.1": 100, "5.2.2": 5, "5.2.3": 100, "5.2.4": 100, "6.1.1": 100, "6.1.2": 100, "6.1.3": 5, "6.2.1": 3, "6.2.2": 2, "6.2.3": 5,
    "6.3.1": 100, "6.3.2": 100, "6.3.3": 4
  };
  return definitions[indicatorId as keyof typeof definitions] || 100;
};

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
  
  // Debug logging for data received (reduced to prevent excessive logging)
  // console.log(`🔍 CleanIndicatorInput(${indicator.id}): Received props:`, {
  //   indicatorId: indicator.id,
  //   pillarId,
  //   value,
  //   evidence,
  //   hasApplication: !!state.application
  // });
  
  const [localValue, setLocalValue] = useState(() => {
    try {
      return value
    } catch (error) {
      console.error(`❌ Error initializing localValue for ${indicator?.id}:`, error)
      return null
    }
  })
  const [localEvidence, setLocalEvidence] = useState(() => {
    try {
      return evidence || {}
    } catch (error) {
      console.error(`❌ Error initializing localEvidence for ${indicator?.id}:`, error)
      return {}
    }
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("input")

  // Refs to prevent infinite loops
  const isUpdatingEvidenceRef = useRef(false)
  const lastEvidenceRef = useRef(evidence)
  const valueChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const evidenceUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const evidenceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debug evidence props for indicator 6.1.3
  useEffect(() => {
    if (indicator.id === '6.1.3') {
      console.log(`🔍 CleanIndicatorInput 6.1.3 - Props received:`, {
        indicatorId: indicator.id,
        evidence: evidence,
        localEvidence: localEvidence
      });
    }
  }, [indicator.id, evidence, localEvidence]);
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  useEffect(() => {
    // Only update if we're not currently updating evidence to prevent loops
    if (!isUpdatingEvidenceRef.current) {
      setLocalEvidence(evidence || {})
      lastEvidenceRef.current = evidence
    }
  }, [evidence])
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (valueChangeTimeoutRef.current) {
        clearTimeout(valueChangeTimeoutRef.current)
      }
      if (evidenceUpdateTimeoutRef.current) {
        clearTimeout(evidenceUpdateTimeoutRef.current)
      }
      if (evidenceResetTimeoutRef.current) {
        clearTimeout(evidenceResetTimeoutRef.current)
      }
    }
  }, [])
  
  // Handle value change with debouncing
  const handleValueChange = useCallback((newValue: any) => {
    setLocalValue(newValue)
    
    // Clear existing timeout
    if (valueChangeTimeoutRef.current) {
      clearTimeout(valueChangeTimeoutRef.current)
    }
    
    // Debounce the onChange call - OPTIMIZED for real-time updates
    valueChangeTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 CleanIndicatorInput calling onChange for ${indicator.id}:`, newValue)
      onChange(newValue)
    }, 100) // Reduced to 100ms for faster auto-save
  }, [onChange, indicator.id])
  
  // Handle evidence change - IMMEDIATE saving for better UX
  const handleEvidenceChange = useCallback((type: 'text' | 'link' | 'file', field: string, evidenceValue: any) => {
    console.log(`🔄 handleEvidenceChange called:`, { type, field, evidenceValue, indicatorId: indicator.id })

    setLocalEvidence((prev: any) => {
      const updatedEvidence = { ...prev }

      if (!updatedEvidence[type]) {
        updatedEvidence[type] = {} as any
      }

      (updatedEvidence[type] as any)[field] = evidenceValue

      // Trigger immediate save for evidence changes (no debouncing for better UX)
      const evidenceData = {
        [type]: {
          ...updatedEvidence[type],
          _persisted: false // Mark as not persisted yet
        }
      }

      console.log(`💾 Immediate evidence save for ${indicator.id}:`, evidenceData)
      onEvidenceChange(evidenceData)

      return updatedEvidence
    })
  }, [indicator.id, onEvidenceChange])
  
  // Debounced evidence update to parent - ENHANCED with debugging
  const debouncedEvidenceUpdate = useCallback((evidenceData: any) => {
    console.log(`🔄 debouncedEvidenceUpdate called for ${indicator.id}:`, evidenceData)
    
    // Clear existing timeouts
    if (evidenceUpdateTimeoutRef.current) {
      clearTimeout(evidenceUpdateTimeoutRef.current)
    }
    if (evidenceResetTimeoutRef.current) {
      clearTimeout(evidenceResetTimeoutRef.current)
    }
    
    evidenceUpdateTimeoutRef.current = setTimeout(() => {
      if (!isUpdatingEvidenceRef.current) {
        isUpdatingEvidenceRef.current = true
        console.log(`🔄 Calling onEvidenceChange for ${indicator.id}:`, evidenceData)
        onEvidenceChange(evidenceData)
        evidenceResetTimeoutRef.current = setTimeout(() => {
          isUpdatingEvidenceRef.current = false
        }, 100)
      }
    }, 100) // Reduced to 100ms for faster auto-save
  }, [onEvidenceChange, indicator.id])
  
  // Use effect to call parent callback when evidence changes
  useEffect(() => {
    // Only call onEvidenceChange if the evidence has actually changed from the last known value
    const hasChanged = JSON.stringify(localEvidence) !== JSON.stringify(lastEvidenceRef.current)
    if (hasChanged) {
      lastEvidenceRef.current = localEvidence
      debouncedEvidenceUpdate(localEvidence)
    }
  }, [localEvidence, debouncedEvidenceUpdate])
  
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
      setLocalEvidence((prev: any) => ({
        ...prev,
        file: {
          ...prev.file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          url: URL.createObjectURL(file)
        }
      }))
      
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
  }, [toast])
  
  // Remove evidence type
  const removeEvidenceType = useCallback((type: 'text' | 'link' | 'file') => {
    setLocalEvidence((prev: any) => {
      const updatedEvidence = { ...prev }
      delete updatedEvidence[type]
      return updatedEvidence
    })
  }, [])
  
  // Calculate progress
  const hasValue = localValue !== null && localValue !== undefined && localValue !== ""
  
  // Check if evidence is required based on input value - use centralized function
  const evidenceRequired = isEvidenceRequired(indicator.id, localValue)
  const hasEvidence = validateEvidence(localEvidence)

  // Count evidence types using centralized validation
  const evidenceCount = useMemo(() => {
    const hasText = !!(localEvidence?.text?.description && localEvidence.text.description.trim() !== "")
    const hasLink = !!(localEvidence?.link?.url && localEvidence.link.url.trim() !== "") || 
                   !!(localEvidence?.link?.description && localEvidence.link.description.trim() !== "")
    const hasFile = !!(localEvidence?.file?.fileName && localEvidence.file.fileName.trim() !== "")
    
    const count = [hasText, hasLink, hasFile].filter(Boolean).length
    return { count, total: 3, hasText, hasLink, hasFile }
  }, [localEvidence])
  const isComplete = hasValue && (!evidenceRequired || hasEvidence)
  
  // Get progress percentage
  const getProgress = () => {
    if (!hasValue) return 0 // No value = 0% progress
    
    if (evidenceRequired) {
      return hasEvidence ? 100 : 50 // Value + evidence = 100%, value only = 50%
    } else {
      return 100 // Value only = 100% (no evidence required)
    }
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
          <Select 
            value={localValue?.toString() || ""} 
            onValueChange={(value) => {
              console.log(`🎯 Select onValueChange for ${indicator.id}:`, value)
              handleValueChange(parseFloat(value) || null)
            }}
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
            onChange={(e) => {
              console.log(`📊 Percentage onChange for ${indicator.id}:`, e.target.value)
              handleValueChange(parseFloat(e.target.value) || null)
            }}
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
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              Evidence
              {evidenceCount.count > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {evidenceCount.count}/{evidenceCount.total}
                </Badge>
              )}
            </TabsTrigger>
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
              
              {/* Evidence Summary */}
              {evidenceCount.count > 0 && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    Evidence Provided ({evidenceCount.count}/3 types):
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {evidenceCount.hasText && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Text
                      </Badge>
                    )}
                    {evidenceCount.hasLink && (
                      <Badge variant="secondary" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        Link
                      </Badge>
                    )}
                    {evidenceCount.hasFile && (
                      <Badge variant="secondary" className="text-xs">
                        <Upload className="h-3 w-3 mr-1" />
                        File
                      </Badge>
                    )}
                  </div>
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
                  onFocus={() => console.log(`🎯 Text input focused for ${indicator.id}`)}
                  onBlur={() => {
                    console.log(`👋 Text input blurred for ${indicator.id}, final save`)
                    // Trigger final save on blur with proper error handling
                    try {
                      if (localEvidence.text) {
                        const evidenceData = {
                          text: {
                            ...localEvidence.text,
                            _persisted: false
                          }
                        }
                        onEvidenceChange(evidenceData)
                      }
                    } catch (error) {
                      console.error(`❌ Error saving text evidence on blur for ${indicator.id}:`, error)
                    }
                  }}
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
                  onFocus={() => console.log(`🎯 Link URL input focused for ${indicator.id}`)}
                  onBlur={() => {
                    console.log(`👋 Link URL input blurred for ${indicator.id}, final save`)
                    try {
                      if (localEvidence.link) {
                        const evidenceData = {
                          link: {
                            ...localEvidence.link,
                            _persisted: false
                          }
                        }
                        onEvidenceChange(evidenceData)
                      }
                    } catch (error) {
                      console.error(`❌ Error saving link evidence on blur for ${indicator.id}:`, error)
                    }
                  }}
                  placeholder="Enter URL..."
                />
                <Textarea
                  value={localEvidence.link.description || ''}
                  onChange={(e) => handleEvidenceChange('link', 'description', e.target.value)}
                  onFocus={() => console.log(`🎯 Link description input focused for ${indicator.id}`)}
                  onBlur={() => {
                    console.log(`👋 Link description input blurred for ${indicator.id}, final save`)
                    try {
                      if (localEvidence.link) {
                        const evidenceData = {
                          link: {
                            ...localEvidence.link,
                            _persisted: false
                          }
                        }
                        onEvidenceChange(evidenceData)
                      }
                    } catch (error) {
                      console.error(`❌ Error saving link description evidence on blur for ${indicator.id}:`, error)
                    }
                  }}
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
                    onFocus={() => console.log(`🎯 File name input focused for ${indicator.id}`)}
                    onBlur={() => {
                      console.log(`👋 File name input blurred for ${indicator.id}, final save`)
                      try {
                        if (localEvidence.file) {
                          const evidenceData = {
                            file: {
                              ...localEvidence.file,
                              _persisted: false
                            }
                          }
                          onEvidenceChange(evidenceData)
                        }
                      } catch (error) {
                        console.error(`❌ Error saving file name evidence on blur for ${indicator.id}:`, error)
                      }
                    }}
                    placeholder="File name..."
                  />
                  <Textarea
                    value={localEvidence.file.description || ''}
                    onChange={(e) => handleEvidenceChange('file', 'description', e.target.value)}
                    onFocus={() => console.log(`🎯 File description input focused for ${indicator.id}`)}
                    onBlur={() => {
                      console.log(`👋 File description input blurred for ${indicator.id}, final save`)
                      try {
                        if (localEvidence.file) {
                          const evidenceData = {
                            file: {
                              ...localEvidence.file,
                              _persisted: false
                            }
                          }
                          onEvidenceChange(evidenceData)
                        }
                      } catch (error) {
                        console.error(`❌ Error saving file description evidence on blur for ${indicator.id}:`, error)
                      }
                    }}
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
                  onClick={() => setLocalEvidence((prev: any) => ({ ...prev, text: { description: '' } }))}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              )}
              {!localEvidence.link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalEvidence((prev: any) => ({ ...prev, link: { url: '', description: '' } }))}
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
