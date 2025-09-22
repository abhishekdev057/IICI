"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Info,
  Upload,
  File,
  Link,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileIcon,
  Plus,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";

interface Indicator {
  id: string;
  shortName: string;
  description: string;
  measurementUnit: string;
  remark?: string;
  example?: string;
  evidenceRequired: string;
  maxScore?: number;
}

interface EvidenceData {
  text?: {
    description: string;
    _persisted?: boolean;
  };
  link?: {
    url: string;
    description: string;
    _persisted?: boolean;
  };
  file?: {
    fileName: string;
    fileSize: number | null;
    fileType: string | null;
    url: string;
    description: string;
    _persisted?: boolean;
  };
}

interface IndicatorInputProps {
  indicator: Indicator;
  value: any;
  onChange: (value: any) => void;
  onEvidenceChange: (evidence: EvidenceData) => void;
  evidence?: EvidenceData;
}

export function IndicatorInput({
  indicator,
  value,
  onChange,
  onEvidenceChange,
  evidence,
}: IndicatorInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [localValue, setLocalValue] = useState(value || "");

  // Initialize evidence state with all three types
  const [localEvidence, setLocalEvidence] = useState<EvidenceData>(() => {
    if (!evidence) {
      return {};
    }

    // Convert from old format to new format if needed
    const newEvidence: EvidenceData = {};

    if (evidence.text || (evidence as any).description) {
      newEvidence.text = {
        description:
          evidence.text?.description || (evidence as any).description || "",
        _persisted:
          (evidence as any).text?._persisted ||
          (evidence as any)._persisted ||
          false,
      };
    }

    if (evidence.link || (evidence as any).url) {
      newEvidence.link = {
        url: evidence.link?.url || (evidence as any).url || "",
        description: evidence.link?.description || "",
        _persisted:
          (evidence as any).link?._persisted ||
          (evidence as any)._persisted ||
          false,
      };
    }

    if (evidence.file || (evidence as any).fileName) {
      newEvidence.file = {
        fileName: evidence.file?.fileName || (evidence as any).fileName || "",
        fileSize: evidence.file?.fileSize || (evidence as any).fileSize || null,
        fileType: evidence.file?.fileType || (evidence as any).fileType || null,
        url: evidence.file?.url || (evidence as any).url || "",
        description: evidence.file?.description || "",
        _persisted:
          (evidence as any).file?._persisted ||
          (evidence as any)._persisted ||
          false,
      };
    }

    return newEvidence;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeEvidenceType, setActiveEvidenceType] = useState<
    "text" | "link" | "file" | null
  >(null);
  // Using Sonner toast directly

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Update local evidence when prop changes
  useEffect(() => {
    if (evidence) {
      const newEvidence: EvidenceData = {};

      if (evidence.text || (evidence as any).description) {
        newEvidence.text = {
          description:
            evidence.text?.description || (evidence as any).description || "",
          _persisted:
            (evidence as any).text?._persisted ||
            (evidence as any)._persisted ||
            false,
        };
      }

      if (evidence.link || (evidence as any).url) {
        newEvidence.link = {
          url: evidence.link?.url || (evidence as any).url || "",
          description: evidence.link?.description || "",
          _persisted:
            (evidence as any).link?._persisted ||
            (evidence as any)._persisted ||
            false,
        };
      }

      if (evidence.file || (evidence as any).fileName) {
        newEvidence.file = {
          fileName: evidence.file?.fileName || (evidence as any).fileName || "",
          fileSize:
            evidence.file?.fileSize || (evidence as any).fileSize || null,
          fileType:
            evidence.file?.fileType || (evidence as any).fileType || null,
          url: evidence.file?.url || (evidence as any).url || "",
          description: evidence.file?.description || "",
          _persisted:
            (evidence as any).file?._persisted ||
            (evidence as any)._persisted ||
            false,
        };
      }

      setLocalEvidence(newEvidence);
    }
  }, [evidence]);

  // Handle value change with debouncing - OPTIMIZED for real-time updates
  const handleValueChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);

      // Debounce the onChange call - optimized timing
      const timeoutId = setTimeout(() => {
        onChange(newValue);
      }, 150); // Reduced to 150ms for faster real-time updates

      return () => clearTimeout(timeoutId);
    },
    [onChange]
  );

  // Handle evidence change for specific type
  const handleEvidenceChange = useCallback(
    (type: "text" | "link" | "file", field: string, value: any) => {
      console.log(
        `🔄 handleEvidenceChange called - indicator: ${indicator.id}, type: ${type}, field: ${field}, value:`,
        value
      );

      setLocalEvidence((prev) => {
        const updatedEvidence = { ...prev };

        if (!updatedEvidence[type]) {
          updatedEvidence[type] = {} as any;
        }

        (updatedEvidence[type] as any)[field] = value;

        console.log("Updated evidence object:", updatedEvidence);

        return updatedEvidence;
      });
    },
    [indicator.id]
  );

  // Effect to call parent callback when evidence changes
  useEffect(() => {
    if (Object.keys(localEvidence).length > 0) {
      console.log("Calling onEvidenceChange with:", localEvidence);
      onEvidenceChange(localEvidence);
    }
  }, [localEvidence, onEvidenceChange]);

  // Remove evidence type
  const removeEvidenceType = useCallback(
    (type: "text" | "link" | "file") => {
      console.log(
        `Removing evidence type: ${type} for indicator: ${indicator.id}`
      );

      setLocalEvidence((prev) => {
        const updatedEvidence = { ...prev };
        delete updatedEvidence[type];

        console.log("Updated evidence after removal:", updatedEvidence);

        return updatedEvidence;
      });

      if (activeEvidenceType === type) {
        setActiveEvidenceType(null);
      }
    },
    [indicator.id, activeEvidenceType]
  );

  // Handle file upload with progress tracking
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        console.log("No file selected for indicator:", indicator.id);
        return;
      }

      console.log("File selected for indicator", indicator.id, ":", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      // Reset states
      setUploadError(null);
      setUploadProgress(0);
      setIsUploading(true);

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setUploadError("File must be smaller than 10MB");
        setIsUploading(false);
        toast.error("File Too Large", {
          description: "Please select a file smaller than 10MB",
        });
        return;
      }

      // Validate file type
      const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".txt",
        ".csv",
        ".zip",
      ];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        setUploadError(
          `File type not supported. Allowed: ${allowedExtensions.join(", ")}`
        );
        setIsUploading(false);
        toast.error("Unsupported File Type", {
          description: `Please select a file with one of these extensions: ${allowedExtensions.join(
            ", "
          )}`,
        });
        return;
      }

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;

        console.log("File upload completed for indicator", indicator.id, ":", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          urlLength: result.length,
        });

        // Update file evidence
        handleEvidenceChange("file", "fileName", file.name);
        handleEvidenceChange("file", "fileSize", file.size);
        handleEvidenceChange("file", "fileType", file.type);
        handleEvidenceChange("file", "url", result);

        setIsUploading(false);
        setUploadProgress(100);

        toast.success("File Uploaded Successfully!", {
          description: `${file.name} has been uploaded as evidence for ${indicator.id}.`,
        });

        // Reset progress after a delay
        setTimeout(() => setUploadProgress(0), 2000);
      };

      reader.onerror = () => {
        setUploadError("Failed to read file. Please try again.");
        setIsUploading(false);
        toast.error("Upload Failed", {
          description: "Failed to read file. Please try again.",
        });
      };

      reader.readAsDataURL(file);
    },
    [handleEvidenceChange]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        console.log("File dropped for indicator", indicator.id, ":", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Process the file directly
        if (!file) return;

        // Reset states
        setUploadError(null);
        setUploadProgress(0);
        setIsUploading(true);

        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          setUploadError("File must be smaller than 10MB");
          setIsUploading(false);
          toast.error("File Too Large", {
            description: "Please select a file smaller than 10MB",
          });
          return;
        }

        // Validate file type
        const allowedExtensions = [
          ".pdf",
          ".doc",
          ".docx",
          ".jpg",
          ".jpeg",
          ".png",
          ".xls",
          ".xlsx",
          ".ppt",
          ".pptx",
          ".txt",
          ".csv",
          ".zip",
        ];
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          setUploadError(
            `File type not supported. Allowed: ${allowedExtensions.join(", ")}`
          );
          setIsUploading(false);
          toast.error("Unsupported File Type", {
            description: `Please select a file with one of these extensions: ${allowedExtensions.join(
              ", "
            )}`,
          });
          return;
        }

        const reader = new FileReader();

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        reader.onload = (e) => {
          const result = e.target?.result as string;

          console.log(
            "File upload completed for indicator",
            indicator.id,
            "via drag-drop:",
            {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              urlLength: result.length,
            }
          );

          // Update file evidence
          handleEvidenceChange("file", "fileName", file.name);
          handleEvidenceChange("file", "fileSize", file.size);
          handleEvidenceChange("file", "fileType", file.type);
          handleEvidenceChange("file", "url", result);

          setIsUploading(false);
          setUploadProgress(100);

          toast.success("File Uploaded Successfully!", {
            description: `${file.name} has been uploaded as evidence for ${indicator.id} via drag & drop.`,
          });

          // Reset progress after a delay
          setTimeout(() => setUploadProgress(0), 2000);
        };

        reader.onerror = () => {
          setUploadError("Failed to read file. Please try again.");
          setIsUploading(false);
          toast.error("Upload Failed", {
            description: "Failed to read file. Please try again.",
          });
        };

        reader.readAsDataURL(file);
      }
    },
    [handleEvidenceChange]
  );

  // Get input type based on measurement unit
  const getInputType = () => {
    if (indicator.measurementUnit.includes("Percentage")) return "percentage";
    if (indicator.measurementUnit.includes("Score")) return "score";
    if (indicator.measurementUnit.includes("Binary")) return "binary";
    if (indicator.measurementUnit.includes("Number")) return "number";
    return "text";
  };

  // Render input based on type
  const renderInput = () => {
    const inputType = getInputType();

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
        );

      case "score":
        const maxScore = indicator.maxScore || 5;
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
        );

      case "binary":
        return (
          <div className="space-y-2">
            <Select
              value={localValue?.toString() || ""}
              onValueChange={(value) => handleValueChange(value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            min="0"
            value={localValue}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            placeholder="Enter number"
            className="w-full"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
            className="w-full"
          />
        );
    }
  };

  // Helper functions for file display
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <ImageIcon className="h-6 w-6 text-green-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case "ppt":
      case "pptx":
        return <FileIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Check if evidence exists
  const hasEvidence = !!(
    localEvidence &&
    (localEvidence.text?.description ||
      localEvidence.link?.url ||
      localEvidence.file?.fileName)
  );

  // Count evidence types
  const evidenceCount = [
    localEvidence.text?.description ? 1 : 0,
    localEvidence.link?.url ? 1 : 0,
    localEvidence.file?.fileName ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {indicator.shortName}
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
              <div className="absolute z-50 right-0 top-6 bg-popover border rounded-md p-3 shadow-md w-80 break-words whitespace-normal">
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
        <div
          className="space-y-3"
          data-evidence-section={`indicator-${indicator.id}`}
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Supporting Evidence</Label>
            {hasEvidence && (
              <Badge variant="outline" className="text-xs text-green-600">
                {evidenceCount} Evidence Type{evidenceCount > 1 ? "s" : ""}{" "}
                Provided
              </Badge>
            )}
          </div>

          {/* Evidence Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={activeEvidenceType === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("Text button clicked for indicator:", indicator.id);
                setActiveEvidenceType(
                  activeEvidenceType === "text" ? null : "text"
                );
              }}
              className="flex items-center gap-1"
            >
              <File className="h-3 w-3" />
              Text
              {localEvidence.text?._persisted && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </Button>
            <Button
              type="button"
              variant={activeEvidenceType === "link" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("Link button clicked for indicator:", indicator.id);
                setActiveEvidenceType(
                  activeEvidenceType === "link" ? null : "link"
                );
              }}
              className="flex items-center gap-1"
            >
              <Link className="h-3 w-3" />
              Link
              {localEvidence.link?._persisted && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </Button>
            <Button
              type="button"
              variant={activeEvidenceType === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("File button clicked for indicator:", indicator.id);
                setActiveEvidenceType(
                  activeEvidenceType === "file" ? null : "file"
                );
              }}
              className="flex items-center gap-1"
            >
              <Upload className="h-3 w-3" />
              File
              {localEvidence.file?._persisted && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </Button>
          </div>

          {/* Always render file input (hidden) for reliability */}
          <input
            id={`file-${indicator.id}`}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
            disabled={isUploading}
            onClick={(e) => {
              // Clear the value so the same file can be selected again
              (e.target as HTMLInputElement).value = "";
              console.log("File input clicked for indicator:", indicator.id);
            }}
          />

          {/* Evidence Input Based on Active Type */}
          {activeEvidenceType === "text" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Text Evidence</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvidenceType("text")}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={localEvidence.text?.description || ""}
                onChange={(e) =>
                  handleEvidenceChange("text", "description", e.target.value)
                }
                placeholder="Describe your evidence..."
                rows={3}
                className="w-full"
              />
            </div>
          )}

          {activeEvidenceType === "link" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Link Evidence</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvidenceType("link")}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1">
                    Evidence URL
                  </Label>
                  <Input
                    value={localEvidence.link?.url || ""}
                    onChange={(e) =>
                      handleEvidenceChange("link", "url", e.target.value)
                    }
                    placeholder="https://example.com/evidence"
                    className="w-full"
                  />
                </div>
                <div style={{ display: "none" }}>
                  <Label className="text-xs font-medium text-gray-700 mb-1">
                    Description
                  </Label>
                  <Textarea
                    value={localEvidence.link?.description || ""}
                    onChange={(e) =>
                      handleEvidenceChange(
                        "link",
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Brief description of the link..."
                    rows={2}
                    className="w-full"
                  />
                </div>
                {localEvidence.link?.url && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <Link className="h-4 w-4 text-blue-600" />
                    <a
                      href={localEvidence.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1"
                    >
                      {localEvidence.link.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeEvidenceType === "file" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">File Evidence</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvidenceType("file")}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <svg viewBox="0 0 36 36" className="h-10 w-10">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray={`${uploadProgress} ${
                          100 - uploadProgress
                        }`}
                        transform="rotate(-90 18 18)"
                      />
                      <text
                        x="18"
                        y="20.5"
                        textAnchor="middle"
                        className="fill-current text-[9px]"
                        fill="#111827"
                      >
                        {uploadProgress}%
                      </text>
                    </svg>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Uploading file...
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm mb-3">
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

              {/* Enhanced File Preview */}
              {localEvidence.file?.fileName && !isUploading && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white mb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {getFileIcon(localEvidence.file.fileName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {localEvidence.file.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(localEvidence.file.fileSize)}
                        {localEvidence.file.fileType &&
                          ` • ${localEvidence.file.fileType}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open file selector to replace
                          const fileInput = document.getElementById(
                            `file-${indicator.id}`
                          ) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                        className="h-8 text-xs"
                      >
                        Replace
                      </Button>
                    </div>
                  </div>

                  {/* Image Preview for image files */}
                  {localEvidence.file.url &&
                    localEvidence.file.fileType?.startsWith("image/") && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={localEvidence.file.url}
                          alt={localEvidence.file.fileName}
                          className="max-h-48 w-auto mx-auto"
                        />
                      </div>
                    )}
                </div>
              )}

              {/* Simple Upload Area (when no file is present) */}
              {!localEvidence.file?.fileName && !isUploading && (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-3 ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload
                    className={`h-6 w-6 mx-auto mb-2 ${
                      isDragOver ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p className="text-sm text-muted-foreground mb-2">
                    {isDragOver
                      ? "Drop your file here"
                      : "Upload a file or drag and drop"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fileInputId = `file-${indicator.id}`;
                      const fileInput = document.getElementById(
                        fileInputId
                      ) as HTMLInputElement;
                      console.log(
                        "Choose File clicked - Looking for file input with ID:",
                        fileInputId
                      );
                      console.log("File input element:", fileInput);
                      if (fileInput) {
                        fileInput.click();
                      } else {
                        console.error(
                          "File input not found for indicator:",
                          indicator.id
                        );
                        console.error(
                          "Available elements with file- prefix:",
                          Array.from(
                            document.querySelectorAll('[id^="file-"]')
                          ).map((el) => el.id)
                        );
                      }
                    }}
                  >
                    Choose File
                  </Button>
                </div>
              )}

              {/* File Type Info */}
              <div className="text-xs text-muted-foreground mb-3">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, PPT,
                PPTX, TXT, CSV, ZIP (max 10MB)
              </div>

              <Textarea
                value={localEvidence.file?.description || ""}
                onChange={(e) =>
                  handleEvidenceChange("file", "description", e.target.value)
                }
                placeholder="Brief description of the file..."
                rows={2}
              />
            </div>
          )}

          {/* Show existing evidence when no type is active */}
          {!activeEvidenceType && hasEvidence && (
            <div className="space-y-3">
              {localEvidence.text?.description && (
                <div className="border border-gray-200 rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Text Evidence
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveEvidenceType("text")}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-green-800">
                    {localEvidence.text.description}
                  </p>
                </div>
              )}

              {localEvidence.link?.url && (
                <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Link Evidence
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveEvidenceType("link")}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={localEvidence.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1"
                    >
                      {localEvidence.link.url}
                    </a>
                  </div>
                  {localEvidence.link.description && (
                    <p className="text-sm text-blue-800 mt-1">
                      {localEvidence.link.description}
                    </p>
                  )}
                </div>
              )}

              {localEvidence.file?.fileName && (
                <div className="border border-gray-200 rounded-lg p-3 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        File Evidence
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveEvidenceType("file")}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFileIcon(localEvidence.file.fileName)}
                    <span className="text-sm font-medium">
                      {localEvidence.file.fileName}
                    </span>
                  </div>
                  {localEvidence.file.description && (
                    <p className="text-sm text-purple-800 mt-1">
                      {localEvidence.file.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
