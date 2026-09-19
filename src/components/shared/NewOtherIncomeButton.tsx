"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import OtherIncomeModal from "../modals/OtherIncomeModal";
import { Button } from "@/components/ui/Button";
import { translations } from "@/lib/translations";

interface NewOtherIncomeButtonProps {
  isAdmin?: boolean;
}

export default function NewOtherIncomeButton({
  isAdmin = false,
}: NewOtherIncomeButtonProps) {
  const [showOtherIncomeModal, setShowOtherIncomeModal] = useState(false);

  const handleOtherIncomeSuccess = () => {
    // The server action handles the database update and revalidation
    setShowOtherIncomeModal(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowOtherIncomeModal(true)}
        variant="default"
        size="default"
      >
        <Plus className="h-4 w-4" />
        <span>{translations.titles.newOtherIncome}</span>
      </Button>

      {/* Modal */}
      {showOtherIncomeModal && (
        <OtherIncomeModal
          onClose={() => setShowOtherIncomeModal(false)}
          onSuccess={handleOtherIncomeSuccess}
        />
      )}
    </>
  );
}
