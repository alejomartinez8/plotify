"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { translations } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export type ApprovalActionKind = "approve" | "reject" | "unapprove";

interface ApprovalNoteModalProps {
  isOpen: boolean;
  action: ApprovalActionKind;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isLoading?: boolean;
}

const ACTION_CONFIG: Record<
  ApprovalActionKind,
  {
    icon: typeof CheckCircle2;
    iconClass: string;
    iconBg: string;
    title: string;
    message: string;
    noteRequired: boolean;
    confirmLabel: string;
    confirmClass: string;
  }
> = {
  approve: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: translations.confirmations.approveTitle,
    message: translations.confirmations.approveMessage,
    noteRequired: false,
    confirmLabel: translations.actions.approve,
    confirmClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  reject: {
    icon: XCircle,
    iconClass: "text-destructive",
    iconBg: "bg-destructive/10",
    title: translations.confirmations.rejectTitle,
    message: translations.confirmations.rejectMessage,
    noteRequired: true,
    confirmLabel: translations.actions.reject,
    confirmClass: "bg-destructive hover:bg-destructive/90",
  },
  unapprove: {
    icon: RotateCcw,
    iconClass: "text-orange-600",
    iconBg: "bg-orange-50",
    title: translations.confirmations.unapproveTitle,
    message: translations.confirmations.unapproveMessage,
    noteRequired: false,
    confirmLabel: translations.actions.unapprove,
    confirmClass: "bg-orange-600 hover:bg-orange-700",
  },
};

export default function ApprovalNoteModal({
  isOpen,
  action,
  onClose,
  onConfirm,
  isLoading = false,
}: ApprovalNoteModalProps) {
  const [note, setNote] = useState("");
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  const canConfirm = !config.noteRequired || note.trim().length > 0;

  const handleClose = () => {
    setNote("");
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(note.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                config.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", config.iconClass)} />
            </div>
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="approval-note">
            {translations.labels.approvalNote}
            {!config.noteRequired && " (opcional)"}
          </Label>
          <Textarea
            id="approval-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              config.noteRequired
                ? translations.placeholders.rejectionNoteRequired
                : translations.placeholders.approvalNoteOptional
            }
            disabled={isLoading}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {translations.actions.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
            className={config.confirmClass}
          >
            {isLoading
              ? translations.status.processing
              : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
