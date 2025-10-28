"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { translations } from "@/lib/translations";

interface ImportButtonProps {
  onImport: (csvContent: string) => Promise<{
    success: boolean;
    message: string;
    imported?: number;
    errors?: string[];
  }>;
  children: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  acceptedFormats?: string;
}

export function ImportButton({
  onImport,
  children,
  variant = "outline",
  size = "default",
  acceptedFormats = ".csv",
}: ImportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    imported?: number;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setResult({
        success: false,
        message: translations.errors.import.fileType,
      });
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;

      startTransition(async () => {
        try {
          setResult(null);
          const importResult = await onImport(csvContent);
          setResult(importResult);
        } catch (error) {
          console.error("Import error:", error);
          setResult({
            success: false,
            message: translations.errors.import.unexpected,
          });
        }
      });
    };

    reader.onerror = () => {
      setResult({
        success: false,
        message: translations.errors.import.fileRead,
      });
    };

    reader.readAsText(file, "UTF-8");

    // Reset file input
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        onClick={handleFileSelect}
        disabled={isPending}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {children}
      </Button>

      {result && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            result.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{result.message}</p>

              {result.imported && result.imported > 0 && (
                <p className="mt-1">Registros importados: {result.imported}</p>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errores encontrados:</p>
                  <ul className="mt-1 ml-4 space-y-1">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-xs">
                        • {error}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-xs text-gray-600">
                        ... y {result.errors.length - 5} errores más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
