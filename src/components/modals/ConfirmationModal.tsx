"use client";

import { AlertTriangle } from "lucide-react";
import { translations } from "@/lib/translations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = translations.actions.confirm,
  cancelText = translations.actions.cancel,
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-destructive",
          iconBg: "bg-destructive/10",
          confirmVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: "text-orange-600",
          iconBg: "bg-orange-50",
          confirmVariant: "default" as const,
        };
      default:
        return {
          icon: "text-primary",
          iconBg: "bg-primary/10",
          confirmVariant: "default" as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                styles.iconBg
              )}
            >
              <AlertTriangle className={cn("h-5 w-5", styles.icon)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              variant === "danger" && "bg-destructive hover:bg-destructive/90",
              variant === "warning" && "bg-orange-600 hover:bg-orange-700"
            )}
          >
            {isLoading ? translations.status.processing : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
