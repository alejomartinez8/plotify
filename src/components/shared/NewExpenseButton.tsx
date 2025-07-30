"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ExpenseModal from "../modals/ExpenseModal";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translations";

interface NewExpenseButtonProps {
  isAuthenticated?: boolean;
}

export default function NewExpenseButton({ 
  isAuthenticated = false
}: NewExpenseButtonProps) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const handleExpenseSuccess = () => {
    // The server action handles the database update and revalidation
    setShowExpenseModal(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setShowExpenseModal(true)} 
        variant="default"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        <span>{translations.titles.newExpense}</span>
      </Button>

      {/* Modal */}
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </>
  );
}