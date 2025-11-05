"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { translations } from "@/lib/translations";

interface PhotoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  collaboratorName: string;
}

export default function PhotoViewModal({
  isOpen,
  onClose,
  photoUrl,
  collaboratorName,
}: PhotoViewModalProps) {
  if (!photoUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {translations.labels.photo} - {collaboratorName}
          </DialogTitle>
        </DialogHeader>
        <div className="relative mt-4 flex h-[60vh] max-h-[600px] w-full items-center justify-center sm:h-[70vh]">
          <Image
            src={photoUrl}
            alt={`Photo of ${collaboratorName}`}
            fill
            className="rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
