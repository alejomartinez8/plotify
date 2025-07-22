"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ContributionModal from "../modals/ContributionModal";
import ExpenseModal from "../modals/ExpenseModal";
import Spinner from "../ui/Spinner";
import { Button } from "@/components/ui/button";
import { Contribution } from "@/types/contributions.types";
import { Expense } from "@/types/expenses.types";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";

export default function ActionButtons() {
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);

  const handleContributionSuccess = (
    contribution: Contribution,
    isUpdate: boolean
  ) => {
    console.log(
      isUpdate ? "Updated contribution:" : "Created contribution:",
      contribution
    );
    // The server action handles the database update and revalidation
  };

  const handleExpenseSuccess = (expense: Expense, isUpdate: boolean) => {
    console.log(isUpdate ? "Updated expense:" : "Created expense:", expense);
    // The server action handles the database update and revalidation
  };

  const loadLots = async () => {
    if (lots.length > 0) return;

    setLotsLoading(true);
    try {
      const { getLotsAction } = await import("@/lib/actions/lot-actions");
      const data = await getLotsAction();
      setLots(data);
    } catch (error) {
      console.error("Error loading lots:", error);
      setLots([]);
    } finally {
      setLotsLoading(false);
    }
  };

  const handleOpenContributionModal = async () => {
    await loadLots();
    setShowContributionModal(true);
  };

  return (
    <>
      <div className="flex space-x-2 py-2">
        <Button
          onClick={handleOpenContributionModal}
          disabled={lotsLoading}
          variant="default"
        >
          {lotsLoading ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
          <span>{translations.titles.newContribution}</span>
        </Button>
        <Button onClick={() => setShowExpenseModal(true)} variant="secondary">
          <Plus className="h-4 w-4" />
          <span>{translations.titles.newExpense}</span>
        </Button>
      </div>

      {/* Modals */}
      {showContributionModal && (
        <ContributionModal
          onClose={() => setShowContributionModal(false)}
          onSuccess={handleContributionSuccess}
          lots={lots}
          lotsLoading={lotsLoading}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </>
  );
}
