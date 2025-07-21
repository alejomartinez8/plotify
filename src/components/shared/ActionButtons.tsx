"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ContributionModal from "../modals/ContributionModal";
import ExpenseModal from "../modals/ExpenseModal";
import Spinner from "../ui/Spinner";
import { Contribution } from "@/types/contributions.types";
import { Expense } from "@/types/expenses.types";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";

export default function ActionButtons() {
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotsLoading, setLotsLoading] = useState(false);

  const handleContributionSubmit = (contribution: Omit<Contribution, "id">) => {
    const newContribution: Contribution = {
      id: Date.now(),
      ...contribution,
    };
    // TODO: POST new contribution
  };

  const handleExpenseSubmit = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      id: Date.now(),
      ...expense,
    };
    // TODO: POST new expense
  };

  const loadLots = async () => {
    if (lots.length > 0) return; // Ya están cargados
    
    setLotsLoading(true);
    try {
      const response = await fetch("/api/lots");
      const data = await response.json();
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
        <button
          onClick={handleOpenContributionModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
          disabled={lotsLoading}
        >
          {lotsLoading ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
          <span>{translations.buttons.newContribution}</span>
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          <span>{translations.buttons.newExpense}</span>
        </button>
      </div>

      {/* Modals */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSubmit={handleContributionSubmit}
        lots={lots}
        lotsLoading={lotsLoading}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
      />
    </>
  );
}