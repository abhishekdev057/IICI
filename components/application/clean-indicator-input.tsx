"use client";

import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Link,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
  X,
  HelpCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useApplication } from "@/contexts/application-context";
import { validateEvidence, isEvidenceRequired } from "@/lib/application-utils";

interface Indicator {
  id: string;
  shortName: string;
  description: string;
  howToCalculate: string;
  measurementUnit: string;
  remark: string;
  example: string;
  evidenceRequired: string;
  maxScore?: number;
}

// Helper functions for evidence requirements (same as validation logic)
const getIndicatorMeasurementUnit = (indicatorId: string): string => {
  const definitions = {
    // Pillar 1
    "1.1.1": "Score (0-2)",
    "1.1.2": "Percentage (%)",
    "1.1.3": "Score (0-2)",
    "1.1.4": "Score (0-3)",
    "1.2.1": "Binary (0-1)",
    "1.2.2": "Percentage (%)",
    "1.2.3": "Percentage (%)",
    "1.2.4": "Score (1-5)",
    "1.3.1": "Score (0-3)",
    "1.3.2": "Percentage (%)",
    "1.3.3": "Score (0-2)",
    "1.3.4": "Percentage (%)",
    "1.4.1": "Score (0-3)",
    "1.4.2": "Percentage (%)",
    "1.4.3": "Binary (0-1)",
    "1.4.4": "Score (0-2)",

    // Pillar 2
    "2.1.1": "Percentage (%)",
    "2.1.2": "Percentage (%)",
    "2.1.3": "Score (1-5)",
    "2.2.1": "Score (0-3)",
    "2.2.2": "Score (0-3)",
    "2.2.3": "Hours per employee",
    "2.2.4": "Score (0-3)",
    "2.2.5": "Score (0-3)",
    "2.3.1": "Score (1-5)",
    "2.3.2": "Score (1-5)",
    "2.3.3": "Score (1-5)",
    "2.3.4": "Score (1-5)",

    // Pillar 3
    "3.1.1": "Score (1-5)",
    "3.1.2": "Percentage (%)",
    "3.1.3": "Score (1-5)",
    "3.1.4": "Score (1-5)",
    "3.2.1": "Percentage (%)",
    "3.2.2": "Score (1-5)",
    "3.2.3": "Binary (0-1)",
    "3.3.1": "Score (1-5)",
    "3.3.2": "Percentage (%)",
    "3.3.3": "Percentage (%)",
    "3.4.1": "Score (1-5)",
    "3.4.2": "Score (1-5)",
    "3.4.3": "Score (0-3)",
    "3.4.4": "Score (1-5)",
    "3.5.1": "Score (1-5)",
    "3.5.2": "Score (1-5)",

    // Pillar 4
    "4.1.1": "Score (1-5)",
    "4.1.2": "Ratio",
    "4.1.3": "Score (1-5)",
    "4.2.1": "Percentage (%)",
    "4.2.2": "Score (1-5)",
    "4.2.3": "Percentage (%)",
    "4.3.1": "Score (0-3)",
    "4.3.2": "Percentage (%)",
    "4.4.1": "Percentage (%)",
    "4.4.2": "Percentage (%)",
    "4.4.3": "Percentage (%)",

    // Pillar 5
    "5.1.1": "Score (1-5)",
    "5.1.2": "Percentage (%)",
    "5.1.3": "Percentage (%)",
    "5.1.4": "Number",
    "5.1.5": "Score (0-3)",
    "5.2.1": "Percentage (%)",
    "5.2.2": "Score (1-5)",
    "5.2.3": "Percentage (%)",
    "5.2.4": "Percentage (%)",

    // Pillar 6
    "6.1.1": "Percentage (%)",
    "6.1.2": "Percentage (%)",
    "6.1.3": "Score (1-5)",
    "6.2.1": "Score (0-3)",
    "6.2.2": "Number",
    "6.2.3": "Score (1-5)",
    "6.3.1": "Percentage (%)",
    "6.3.2": "Percentage (%)",
    "6.3.3": "Number",
  };
  return (
    definitions[indicatorId as keyof typeof definitions] || "Percentage (%)"
  );
};

const getIndicatorMaxScore = (indicatorId: string): number => {
  const definitions = {
    "1.1.1": 2,
    "1.1.2": 100,
    "1.1.3": 2,
    "1.1.4": 3,
    "1.2.1": 1,
    "1.2.2": 100,
    "1.2.3": 100,
    "1.2.4": 5,
    "1.3.1": 3,
    "1.3.2": 100,
    "1.3.3": 2,
    "1.3.4": 100,
    "1.4.1": 3,
    "1.4.2": 100,
    "1.4.3": 1,
    "1.4.4": 2,
    "2.1.1": 100,
    "2.1.2": 100,
    "2.1.3": 5,
    "2.2.1": 3,
    "2.2.2": 3,
    "2.2.3": 40,
    "2.2.4": 3,
    "2.2.5": 3,
    "2.3.1": 5,
    "2.3.2": 5,
    "2.3.3": 5,
    "2.3.4": 5,
    "3.1.1": 5,
    "3.1.2": 100,
    "3.1.3": 5,
    "3.1.4": 5,
    "3.2.1": 100,
    "3.2.2": 5,
    "3.2.3": 1,
    "3.3.1": 5,
    "3.3.2": 100,
    "3.3.3": 100,
    "3.4.1": 5,
    "3.4.2": 5,
    "3.4.3": 3,
    "3.4.4": 5,
    "3.5.1": 5,
    "3.5.2": 5,
    "4.1.1": 5,
    "4.1.2": 1,
    "4.1.3": 5,
    "4.2.1": 100,
    "4.2.2": 5,
    "4.2.3": 100,
    "4.3.1": 3,
    "4.3.2": 100,
    "4.4.1": 100,
    "4.4.2": 100,
    "4.4.3": 100,
    "5.1.1": 5,
    "5.1.2": 100,
    "5.1.3": 100,
    "5.1.4": 5,
    "5.1.5": 3,
    "5.2.1": 100,
    "5.2.2": 5,
    "5.2.3": 100,
    "5.2.4": 100,
    "6.1.1": 100,
    "6.1.2": 100,
    "6.1.3": 5,
    "6.2.1": 3,
    "6.2.2": 2,
    "6.2.3": 5,
    "6.3.1": 100,
    "6.3.2": 100,
    "6.3.3": 4,
  };
  return definitions[indicatorId as keyof typeof definitions] || 100;
};

interface CleanIndicatorInputProps {
  indicator: Indicator;
  pillarId: number;
  value: any;
  evidence: any;
  onChange: (value: any) => void;
  onEvidenceChange: (evidence: any) => void;
  className?: string;
}

const CleanIndicatorInput = memo(function CleanIndicatorInput({
  indicator,
  pillarId,
  value,
  evidence,
  onChange,
  onEvidenceChange,
  className,
}: CleanIndicatorInputProps) {
  const { state } = useApplication();
  // Using Sonner toast directly

  // Component initialized

  const [localValue, setLocalValue] = useState(value);
  const [localEvidence, setLocalEvidence] = useState(evidence || {});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("input");

  // Focus/blur tracking for smart saving
  const [isFocused, setIsFocused] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [hasEvidenceChanged, setHasEvidenceChanged] = useState(false);
  const [originalValue, setOriginalValue] = useState(value);
  const [originalEvidence, setOriginalEvidence] = useState(evidence || {});
  const [isSaving, setIsSaving] = useState(false);

  // Refs to prevent infinite loops
  const isUpdatingEvidenceRef = useRef(false);
  const lastEvidenceRef = useRef(evidence);
  const valueChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const evidenceUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const evidenceResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
    setOriginalValue(value);
  }, [value]);

  useEffect(() => {
    // Only update if we're not currently updating evidence to prevent loops
    if (!isUpdatingEvidenceRef.current) {
      setLocalEvidence(evidence || {});
      setOriginalEvidence(evidence || {});
      lastEvidenceRef.current = evidence;
    }
  }, [evidence, indicator.id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (valueChangeTimeoutRef.current) {
        clearTimeout(valueChangeTimeoutRef.current);
      }
      if (evidenceUpdateTimeoutRef.current) {
        clearTimeout(evidenceUpdateTimeoutRef.current);
      }
      if (evidenceResetTimeoutRef.current) {
        clearTimeout(evidenceResetTimeoutRef.current);
      }
    };
  }, []);

  // Handle value change - only update local state, don't save yet
  const handleValueChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);

      // Save immediately for better performance
      if (originalValue !== newValue) {
        console.log(`⚡ Immediate save for ${indicator.id}:`, newValue);
        setIsSaving(true);
        onChange(newValue);
        setIsSaving(false);

        // Update original value and reset change flag after successful save
        setOriginalValue(newValue);
        setHasValueChanged(false);
      }
    },
    [originalValue, onChange, indicator.id]
  );

  // Handle focus - track that user is editing
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - only for evidence, values are saved immediately
  const handleBlur = useCallback(async () => {
    setIsFocused(false);

    // Only handle evidence changes on blur, values are saved immediately
    if (hasEvidenceChanged) {
      console.log(
        `🔄 CleanIndicatorInput saving evidence change for ${indicator.id}:`,
        localEvidence
      );
      setIsSaving(true);
      try {
        onEvidenceChange(localEvidence);
        setOriginalEvidence(JSON.parse(JSON.stringify(localEvidence)));
        setHasEvidenceChanged(false);
      } finally {
        setIsSaving(false);
      }
    }
  }, [hasEvidenceChanged, localEvidence, onEvidenceChange, indicator.id]);

  // Handle evidence change - only update local state, don't save yet
  const handleEvidenceChange = useCallback(
    (type: "text" | "link" | "file", field: string, evidenceValue: any) => {
      console.log(`🔄 handleEvidenceChange called:`, {
        type,
        field,
        evidenceValue,
        indicatorId: indicator.id,
      });

      setLocalEvidence((prev: any) => {
        const updatedEvidence = { ...prev };

        if (!updatedEvidence[type]) {
          updatedEvidence[type] = {} as any;
        }

        (updatedEvidence[type] as any)[field] = evidenceValue;

        console.log(
          `🔄 Updated evidence for ${indicator.id}:`,
          updatedEvidence
        );

        return updatedEvidence;
      });

      // Mark that evidence has changed
      setHasEvidenceChanged(true);
    },
    [indicator.id]
  );

  // Handle link evidence change - update local state only
  const handleLinkEvidenceChange = useCallback(
    (field: "url" | "description", value: any) => {
      console.log(`🔄 handleLinkEvidenceChange called:`, {
        field,
        value,
        indicatorId: indicator.id,
      });

      setLocalEvidence((prev: any) => {
        const updatedEvidence = { ...prev };

        if (!updatedEvidence.link) {
          updatedEvidence.link = {} as any;
        }

        updatedEvidence.link[field] = value;

        console.log(
          `🔄 Updated link evidence for ${indicator.id}:`,
          updatedEvidence
        );

        return updatedEvidence;
      });

      // Mark that evidence has changed
      setHasEvidenceChanged(true);
    },
    [indicator.id]
  );

  // Handle link evidence blur - save if URL or description changed
  const handleLinkEvidenceBlur = useCallback(async () => {
    setIsFocused(false);

    // Only save if evidence actually changed
    if (
      hasEvidenceChanged &&
      JSON.stringify(localEvidence) !== JSON.stringify(originalEvidence)
    ) {
      console.log(
        `🔄 CleanIndicatorInput saving link evidence change for ${indicator.id}:`,
        localEvidence
      );
      setIsSaving(true);
      try {
        onEvidenceChange(localEvidence);
        setOriginalEvidence(localEvidence);
        setHasEvidenceChanged(false);
      } finally {
        setIsSaving(false);
      }
    }
  }, [
    hasEvidenceChanged,
    localEvidence,
    originalEvidence,
    onEvidenceChange,
    indicator.id,
  ]);

  // Handle evidence focus - track that user is editing evidence
  const handleEvidenceFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle evidence blur - save if evidence changed
  const handleEvidenceBlur = useCallback(async () => {
    setIsFocused(false);

    // Only save if evidence actually changed
    if (
      hasEvidenceChanged &&
      JSON.stringify(localEvidence) !== JSON.stringify(originalEvidence)
    ) {
      console.log(
        `🔄 CleanIndicatorInput saving evidence change for ${indicator.id}:`,
        localEvidence
      );
      setIsSaving(true);
      try {
        onEvidenceChange(localEvidence);
        setOriginalEvidence(localEvidence);
        setHasEvidenceChanged(false);
      } finally {
        setIsSaving(false);
      }
    }
  }, [
    hasEvidenceChanged,
    localEvidence,
    originalEvidence,
    onEvidenceChange,
    indicator.id,
  ]);

  // Remove old debounced evidence update - now using focus/blur pattern

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (5MB limit for base64 storage)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: "Please select a file smaller than 5MB",
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported File Type", {
          description: "Please select a PDF, Word, Excel, image, or text file",
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Convert file to base64 for storage
        const reader = new FileReader();

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        reader.onload = async (e) => {
          try {
            const base64String = e.target?.result as string;

            // Update evidence with file information including base64 data
            const updatedEvidence = {
              ...localEvidence,
              file: {
                ...localEvidence.file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                url: base64String, // Store base64 data as URL
                description: localEvidence.file?.description || "",
              },
            };

            setLocalEvidence(updatedEvidence);
            setOriginalEvidence(updatedEvidence);
            setHasEvidenceChanged(false);

            // Auto-save file evidence immediately
            onEvidenceChange(updatedEvidence);

            toast.success("File Uploaded", {
              description: `${file.name} has been uploaded successfully.`,
            });
          } catch (error) {
            console.error("File processing error:", error);
            toast.error("Upload Failed", {
              description: "Failed to process file. Please try again.",
            });
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        };

        reader.onerror = () => {
          console.error("File reading error");
          toast.error("Upload Failed", {
            description: "Failed to read file. Please try again.",
          });
          setIsUploading(false);
          setUploadProgress(0);
        };

        // Start reading the file
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload Failed", {
          description: "Failed to upload file. Please try again.",
        });
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [localEvidence, indicator.id, onEvidenceChange]
  );

  // Remove evidence type
  const removeEvidenceType = useCallback((type: "text" | "link" | "file") => {
    setLocalEvidence((prev: any) => {
      const updatedEvidence = { ...prev };
      delete updatedEvidence[type];
      return updatedEvidence;
    });
    setHasEvidenceChanged(true);
  }, []);

  // Calculate progress
  const hasValue =
    localValue !== null && localValue !== undefined && localValue !== "";

  // Check if evidence is required based on input value - use centralized function
  const evidenceRequired = isEvidenceRequired(indicator.id, localValue);
  const hasEvidence = validateEvidence(localEvidence);

  // Count evidence types using centralized validation
  const evidenceCount = useMemo(() => {
    const hasText = !!(
      localEvidence?.text?.description &&
      localEvidence.text.description.trim() !== ""
    );
    const hasLink =
      !!(localEvidence?.link?.url && localEvidence.link.url.trim() !== "") ||
      !!(
        localEvidence?.link?.description &&
        localEvidence.link.description.trim() !== ""
      );
    const hasFile = !!(
      localEvidence?.file?.fileName && localEvidence.file.fileName.trim() !== ""
    );

    const count = [hasText, hasLink, hasFile].filter(Boolean).length;
    return { count, total: 3, hasText, hasLink, hasFile };
  }, [localEvidence, indicator.id]);
  const isComplete = hasValue && (!evidenceRequired || hasEvidence);

  // Get progress percentage
  const getProgress = () => {
    if (!hasValue) return 0; // No value = 0% progress

    if (evidenceRequired) {
      return hasEvidence ? 100 : 50; // Value + evidence = 100%, value only = 50%
    } else {
      return 100; // Value only = 100% (no evidence required)
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (isSaving) {
      return (
        <Badge variant="secondary" className="bg-blue-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Saving...
        </Badge>
      );
    } else if (hasValueChanged || hasEvidenceChanged) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700">
          <Clock className="h-3 w-3 mr-1" />
          Unsaved Changes
        </Badge>
      );
    } else if (isComplete) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    } else if (hasValue) {
      if (evidenceRequired && !hasEvidence) {
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Evidence Required
          </Badge>
        );
      } else {
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      }
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  // Render input based on measurement unit
  const renderInput = () => {
    const measurementUnit = indicator.measurementUnit;
    const maxScore = indicator.maxScore || 100;

    if (measurementUnit.includes("Score")) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-score`}>
            Score (0-{maxScore}) <span className="text-red-500">*</span>
          </Label>
          <Select
            value={localValue?.toString() || ""}
            onValueChange={(value) => {
              const newValue = parseFloat(value) || null;
              console.log(
                `🎯 Select onValueChange for ${indicator.id}:`,
                newValue
              );
              setLocalValue(newValue);
              setOriginalValue(newValue);
              setHasValueChanged(false);
              onChange(newValue);
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
      );
    } else if (measurementUnit.includes("Percentage")) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-percentage`}>
            Percentage (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${indicator.id}-percentage`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={localValue || ""}
            onChange={(e) => {
              console.log(
                `📊 Percentage onChange for ${indicator.id}:`,
                e.target.value
              );
              handleValueChange(parseFloat(e.target.value) || null);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter percentage (0-100)"
          />
        </div>
      );
    } else if (measurementUnit.includes("Binary")) {
      return (
        <div className="space-y-2">
          <Label>
            Binary Choice <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <Button
              variant={localValue === 1 ? "default" : "outline"}
              onClick={async () => {
                setLocalValue(1);
                setOriginalValue(1);
                setHasValueChanged(false);
                console.log(
                  `🔄 CleanIndicatorInput saving binary value for ${indicator.id}:`,
                  1
                );
                onChange(1);
              }}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={localValue === 0 ? "default" : "outline"}
              onClick={async () => {
                setLocalValue(0);
                setOriginalValue(0);
                setHasValueChanged(false);
                console.log(
                  `🔄 CleanIndicatorInput saving binary value for ${indicator.id}:`,
                  0
                );
                onChange(0);
              }}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>
      );
    } else if (measurementUnit === "Ratio") {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-ratio`}>
            Ratio (e.g., 3:1) <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${indicator.id}-ratio`}
            type="text"
            value={localValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter ratio (e.g., 3:1)"
          />
        </div>
      );
    } else if (measurementUnit.includes("Hours per employee")) {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-hours`}>
            Hours per Employee <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${indicator.id}-hours`}
            type="number"
            min="0"
            step="0.5"
            value={localValue || ""}
            onChange={(e) =>
              handleValueChange(parseFloat(e.target.value) || null)
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter hours per employee"
          />
        </div>
      );
    } else if (measurementUnit === "Number") {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-number`}>
            Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${indicator.id}-number`}
            type="number"
            min="0"
            value={localValue || ""}
            onChange={(e) =>
              handleValueChange(parseInt(e.target.value) || null)
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter number"
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label htmlFor={`${indicator.id}-text`}>
            Value <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${indicator.id}-text`}
            type="text"
            value={localValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter value"
          />
        </div>
      );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {indicator.id}
              </span>
              {indicator.shortName}
              <span className="text-red-500 text-lg">*</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {indicator.description}
            </p>
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
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
                    Evidence is required for this input value. Please provide
                    supporting documentation.
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
                    onClick={() => removeEvidenceType("text")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={localEvidence.text.description || ""}
                  onChange={(e) =>
                    handleEvidenceChange("text", "description", e.target.value)
                  }
                  onFocus={handleEvidenceFocus}
                  onBlur={handleEvidenceBlur}
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
                    onClick={() => removeEvidenceType("link")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={localEvidence.link.url || ""}
                  onChange={(e) =>
                    handleLinkEvidenceChange("url", e.target.value)
                  }
                  onFocus={handleEvidenceFocus}
                  onBlur={handleLinkEvidenceBlur}
                  placeholder="Enter URL..."
                />
                <Textarea
                  value={localEvidence.link.description || ""}
                  onChange={(e) =>
                    handleLinkEvidenceChange("description", e.target.value)
                  }
                  onFocus={handleEvidenceFocus}
                  onBlur={handleLinkEvidenceBlur}
                  placeholder="Enter link description..."
                  rows={2}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {/* File Evidence */}
            {(localEvidence.file || evidenceCount.hasFile) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    File Evidence
                    {(localEvidence.file?.fileName ||
                      evidenceCount.hasFile) && (
                      <Badge variant="secondary" className="text-xs">
                        {localEvidence.file?.fileName || "File Uploaded"}
                      </Badge>
                    )}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidenceType("file")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input
                    value={localEvidence.file?.fileName || ""}
                    onChange={(e) =>
                      handleEvidenceChange("file", "fileName", e.target.value)
                    }
                    onFocus={handleEvidenceFocus}
                    onBlur={handleEvidenceBlur}
                    placeholder="File name..."
                  />
                  <Textarea
                    value={localEvidence.file?.description || ""}
                    onChange={(e) =>
                      handleEvidenceChange(
                        "file",
                        "description",
                        e.target.value
                      )
                    }
                    onFocus={handleEvidenceFocus}
                    onBlur={handleEvidenceBlur}
                    placeholder="File description..."
                    rows={2}
                  />
                  {localEvidence.file?.url && (
                    <div className="text-xs text-muted-foreground">
                      <a
                        href={localEvidence.file.url}
                        download={localEvidence.file.fileName}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        📎 Download {localEvidence.file.fileName}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Evidence Buttons */}
            <div className="flex gap-2">
              {!localEvidence.text && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalEvidence((prev: any) => ({
                      ...prev,
                      text: { description: "" },
                    }));
                    setHasEvidenceChanged(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              )}
              {!localEvidence.link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalEvidence((prev: any) => ({
                      ...prev,
                      link: { url: "", description: "" },
                    }));
                    setHasEvidenceChanged(true);
                  }}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              )}
              {!localEvidence.file && !evidenceCount.hasFile && (
                <div>
                  <input
                    type="file"
                    id={`file-upload-${indicator.id}`}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Just trigger the file input, don't initialize file evidence yet
                      document
                        .getElementById(`file-upload-${indicator.id}`)
                        ?.click();
                    }}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload File"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export { CleanIndicatorInput };
