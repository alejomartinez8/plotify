"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { translations } from "@/lib/translations";
import QuotaModal from "@/components/modals/QuotaModal";

interface NewQuotaButtonProps {
  onSuccess: () => void;
}

export default function NewQuotaButton({ onSuccess }: NewQuotaButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {translations.titles.newQuota}
      </Button>

      {isModalOpen && (
        <QuotaModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
