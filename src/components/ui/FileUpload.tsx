"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, FileText, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { translations } from "@/lib/translations";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  value?: File | null;
  error?: string;
  className?: string;
  showPreview?: boolean;
  previewFileName?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export function FileUpload({
  onFileSelect,
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  maxSize = MAX_FILE_SIZE,
  disabled = false,
  value = null,
  error,
  className,
  showPreview = true,
  previewFileName,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string>("");

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    const acceptedMimes = accept.split(",").map(mime => mime.trim());
    if (!acceptedMimes.includes(file.type)) {
      return "Invalid file type. Please select PDF, JPG, PNG, or WebP files.";
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File | null) => {
    setLocalError("");
    
    if (!file) {
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, validateFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" aria-label="Image file" />;
    }
    return <FileText className="h-8 w-8 text-red-500" aria-label="Document file" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const displayError = error || localError;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="receipt-upload">
        {translations.labels.receiptFile}
      </Label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          displayError && "border-destructive bg-destructive/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? handleButtonClick : undefined}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          id="receipt-upload"
        />

        {value || previewFileName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {value ? getFileIcon(value) : <FileText className="h-8 w-8 text-gray-500" />}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {previewFileName || value?.name}
                </p>
                {value && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(value.size)}
                  </p>
                )}
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <div className="text-sm">
              <span className="font-medium text-primary">
                {translations.actions.uploadFile}
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, PNG up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {displayError && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}

      {showPreview && value && value.type.startsWith("image/") && (
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700">Preview:</Label>
          <div className="mt-2 border rounded-lg p-2 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(value)}
              alt="Receipt preview"
              className="max-w-full h-auto max-h-48 rounded object-contain mx-auto"
              onLoad={(e) => {
                // Clean up object URL after loading
                const img = e.target as HTMLImageElement;
                setTimeout(() => URL.revokeObjectURL(img.src), 1000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}