"use client";

import { useState, useMemo, useEffect } from "react";
import { parseLocalDate } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Expense, ExpenseType } from "@/types/expenses.types";
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

type ExpenseFilter = "all" | ExpenseType;

export default function ExpenseView({
  title,
  expenses,
  isAdmin = false,
}: ExpenseViewProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [typeFilter, setTypeFilter] = useState<ExpenseFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const yearParam = searchParams.get("year");
    const typeParam = searchParams.get("type") as ExpenseFilter | null;

    setYearFilter(yearParam || "all");
    setTypeFilter(typeParam || "all");
  }, [searchParams]);

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type as ExpenseFilter);
    updateURL({ type });
  };

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);
    updateURL({ year });
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    expenses.forEach((expense) => {
      const date = parseLocalDate(expense.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [expenses]);

  const typeFilterOptions = [
    { value: "all", label: translations.filters.allExpenses },
    { value: "maintenance", label: translations.labels.maintenance },
    { value: "works", label: translations.labels.works },
    { value: "others", label: translations.labels.others },
  ];

  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: translations.filters.allYears },
      ...availableYears.map((year) => ({ value: year, label: year })),
    ],
    [availableYears]
  );

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (typeFilter !== "all") {
      filtered = filtered.filter((expense) => expense.type === typeFilter);
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((expense) => {
        const date = parseLocalDate(expense.date);
        return (
          !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter
        );
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, typeFilter, yearFilter]);

  const handleExpenseSuccess = (_expense: Expense, _isUpdate: boolean) => {
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
        typeFilter={{
          value: typeFilter,
          onChange: handleTypeFilterChange,
          options: typeFilterOptions,
        }}
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: yearFilterOptions,
        }}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        isAdmin={isAdmin}
        onEdit={setEditingExpense}
        onDelete={setDeletingExpense}
      />

      {editingExpense && isAdmin && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}

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
