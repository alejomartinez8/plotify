"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import FilterSection from "@/components/shared/FilterSection";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportExpensesAction } from "@/lib/actions/export-actions";
import NewExpenseButton from "@/components/shared/NewExpenseButton";
import ExpenseTable from "@/components/shared/ExpenseTable";

interface ExpenseViewProps {
  title: string;
  expenses: Expense[];
  isAdmin?: boolean;
}

type ExpenseType = "all";

export default function ExpenseView({
  title,
  expenses,
  isAdmin = false,
}: ExpenseViewProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const yearParam = searchParams.get("year");

    if (yearParam) {
      setYearFilter(yearParam);
    } else {
      setYearFilter("all");
    }
  }, [searchParams]);

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);

    const params = new URLSearchParams(searchParams.toString());
    if (year !== "all") {
      params.set("year", year);
    } else {
      params.delete("year");
    }

    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Extract unique years from expenses for filter options
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)
  }, [expenses]);

  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: translations.filters.allYears },
      ...availableYears.map((year) => ({ value: year, label: year })),
    ],
    [availableYears]
  );

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter((expense) => {
        const date = new Date(expense.date);
        return (
          !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter
        );
      });
    }

    // Sort by date (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, yearFilter]);

  const handleExpenseSuccess = (expense: Expense, isUpdate: boolean) => {
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    try {
      const { deleteExpenseAction } = await import(
        "@/lib/actions/expense-actions"
      );
      await deleteExpenseAction(deletingExpense.id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeletingExpense(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with filters */}
      <FilterSection
        title={title}
        actionButton={
          isAdmin ? (
            <div className="flex items-center gap-2">
              <ExportButton
                onExport={exportExpensesAction}
                variant="outline"
                size="default"
              >
                {translations.actions.export} {translations.labels.expenses} CSV
              </ExportButton>
              <NewExpenseButton isAdmin={isAdmin} />
            </div>
          ) : null
        }
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: yearFilterOptions,
        }}
      />

      {/* Expenses Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        isAdmin={isAdmin}
        onEdit={setEditingExpense}
        onDelete={setDeletingExpense}
      />

      {/* Edit Modal */}
      {editingExpense && isAdmin && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <ConfirmationModal
          isOpen={!!deletingExpense}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteExpense}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingExpense(null)}
          variant="danger"
        />
      )}
    </div>
  );
}
