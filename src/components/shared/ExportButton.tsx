"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";
import { translations } from "@/lib/translations";

interface ExportButtonProps {
  onExport: () => Promise<{
    success: boolean;
    data?: string;
    filename?: string;
    error?: string;
  }>;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({ 
  onExport, 
  children, 
  variant = "outline",
  size = "default"
}: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await onExport();
        
        if (result.success && result.data && result.filename) {
          // Create and download the CSV file
          const blob = new Blob([result.data], { 
            type: "text/csv;charset=utf-8;" 
          });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement("a");
          link.href = url;
          link.download = result.filename;
          link.style.display = "none";
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
        } else {
          setError(result.error || translations.errors.export.defaultError);
        }
      } catch (err) {
        console.error("Export error:", err);
        setError(translations.errors.export.unexpectedError);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={isPending}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {children}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}