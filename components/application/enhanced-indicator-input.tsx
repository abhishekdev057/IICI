"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, LinkIcon, FileText, X, ChevronDown, ChevronUp, Info, CheckCircle, AlertCircle } from "lucide-react"
import { useState as useTooltipState } from "react"

interface IndicatorProps {
  id: string
  shortName: string
  description: string
  measurementUnit: string
  remark?: string
  example?: string
  evidenceRequired?: string
  maxScore?: number
}

interface EvidenceFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

interface EvidenceLink {
  id: string
  url: string
  title: string
  description?: string
  addedAt: Date
}

interface EvidenceData {
  files: EvidenceFile[]
  links: EvidenceLink[]
  notes?: string
}

interface EnhancedIndicatorInputProps {
  indicator: IndicatorProps
  value: any
  onChange: (value: any) => void
  onEvidenceChange: (evidence: EvidenceData) => void
  evidence?: EvidenceData
}

export function EnhancedIndicatorInput({
  indicator,
  value,
  onChange,
  onEvidenceChange,
  evidence = { files: [], links: [] },
}: EnhancedIndicatorInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleValueChange = (newValue: any) => {
    onChange(newValue)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newFile: EvidenceFile = {
          id: `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
          uploadedAt: new Date(),
        }

        const updatedEvidence = {
          ...evidence,
          files: [...evidence.files, newFile],
        }
        onEvidenceChange(updatedEvidence)
      }
      reader.readAsDataURL(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddLink = () => {
    if (!linkUrl.trim()) return

    const newLink: EvidenceLink = {
      id: `link_${Date.now()}`,
      url: linkUrl,
      title: linkTitle || linkUrl,
      description: linkDescription,
      addedAt: new Date(),
    }

    const updatedEvidence = {
      ...evidence,
      links: [...evidence.links, newLink],
    }
    onEvidenceChange(updatedEvidence)

    // Reset form
    setLinkUrl("")
    setLinkTitle("")
    setLinkDescription("")
  }

  const removeFile = (fileId: string) => {
    const updatedEvidence = {
      ...evidence,
      files: evidence.files.filter((f) => f.id !== fileId),
    }
    onEvidenceChange(updatedEvidence)
  }

  const removeLink = (linkId: string) => {
    const updatedEvidence = {
      ...evidence,
      links: evidence.links.filter((l) => l.id !== linkId),
    }
    onEvidenceChange(updatedEvidence)
  }

  const updateNotes = (notes: string) => {
    const updatedEvidence = {
      ...evidence,
      notes,
    }
    onEvidenceChange(updatedEvidence)
  }

  const getScoreValidation = () => {
    if (!value) return { status: "empty", message: "No value entered" }

    if (indicator.measurementUnit.includes("Score")) {
      const max = indicator.maxScore || 5
      if (value > max) return { status: "error", message: `Score cannot exceed ${max}` }
      if (value < 0) return { status: "error", message: "Score cannot be negative" }
    } else if (indicator.measurementUnit.includes("Percentage")) {
      if (value > 100) return { status: "error", message: "Percentage cannot exceed 100%" }
      if (value < 0) return { status: "error", message: "Percentage cannot be negative" }
    }

    const hasEvidence = evidence.files.length > 0 || evidence.links.length > 0
    const needsEvidence = value > (indicator.maxScore ? indicator.maxScore * 0.5 : 50)

    if (needsEvidence && !hasEvidence) {
      return { status: "warning", message: "Evidence recommended for this score" }
    }

    return { status: "success", message: "Valid entry" }
  }

  const validation = getScoreValidation()
  const totalEvidence = evidence.files.length + evidence.links.length

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              {indicator.shortName}
              <Badge variant="outline" className="text-xs">
                {indicator.id}
              </Badge>
              {totalEvidence > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {totalEvidence} evidence
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{indicator.description}</p>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="h-4 w-4" />
            </Button>
            {showTooltip && (
              <div className="absolute z-50 right-0 top-8 bg-popover border rounded-md p-2 shadow-md">
                <p className="text-sm">View details and examples</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Value Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={indicator.id} className="text-sm font-medium">
              Value ({indicator.measurementUnit})
            </Label>
            {validation.status !== "empty" && (
              <div className="flex items-center gap-1 text-xs">
                {validation.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                {validation.status === "warning" && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                {validation.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                <span
                  className={`${
                    validation.status === "success"
                      ? "text-green-600"
                      : validation.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {validation.message}
                </span>
              </div>
            )}
          </div>

          {indicator.measurementUnit.includes("Score") ? (
            <div className="flex items-center gap-2">
              <Select value={value?.toString() || ""} onValueChange={(val) => handleValueChange(Number(val))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: (indicator.maxScore || 5) + 1 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">/ {indicator.maxScore || 5}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                id={indicator.id}
                type="number"
                value={value || ""}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                placeholder="Enter value"
                className="w-32"
                min="0"
                max={indicator.measurementUnit.includes("Percentage") ? "100" : undefined}
              />
              {indicator.measurementUnit.includes("Percentage") && (
                <span className="text-sm text-muted-foreground">%</span>
              )}
            </div>
          )}
        </div>

        {/* Evidence Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Supporting Evidence</Label>
            <Button variant="outline" size="sm" onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}>
              {showEvidenceUpload ? "Hide" : "Add Evidence"}
            </Button>
          </div>

          {/* Evidence Upload */}
          {showEvidenceUpload && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />
              </div>

              <div className="space-y-2">
                <Input placeholder="Add link URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Input
                  placeholder="Link title (optional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Link description (optional)"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  rows={2}
                />
                <Button size="sm" onClick={handleAddLink} disabled={!linkUrl.trim()}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>
          )}

          {/* Evidence List */}
          {(evidence.files.length > 0 || evidence.links.length > 0) && (
            <div className="space-y-2">
              {evidence.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {evidence.links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-green-500" />
                    <div>
                      <span className="text-sm">{link.title}</span>
                      {link.description && <p className="text-xs text-muted-foreground">{link.description}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeLink(link.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Evidence Notes */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Notes</Label>
            <Textarea
              placeholder="Add any additional context or explanations..."
              value={evidence.notes || ""}
              onChange={(e) => updateNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm text-muted-foreground">{isExpanded ? "Hide" : "Show"} details and examples</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {indicator.remark && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Assessment Notes</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">{indicator.remark}</p>
              </div>
            )}

            {indicator.example && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Example</h4>
                <p className="text-sm text-green-800 dark:text-green-200">{indicator.example}</p>
              </div>
            )}

            {indicator.evidenceRequired && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Evidence Requirements</h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">{indicator.evidenceRequired}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
