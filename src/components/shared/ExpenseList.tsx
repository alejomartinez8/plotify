"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import SummarySection from "@/components/shared/SummarySection";
import FilterSection from "@/components/shared/FilterSection";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportExpensesAction } from "@/lib/actions/export-actions";
import NewExpenseButton from "@/components/shared/NewExpenseButton";
import ExpenseTable from "@/components/shared/ExpenseTable";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
  isAuthenticated?: boolean;
}

type ExpenseType = "all" | "maintenance" | "works" | "others";

export default function ExpenseList({ title, expenses, isAuthenticated = false }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseType>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get("type") as ExpenseType;
    const yearParam = searchParams.get("year");

    if (typeParam && (typeParam === "maintenance" || typeParam === "works" || typeParam === "others")) {
      setExpenseFilter(typeParam);
    } else {
      setExpenseFilter("all");
    }

    if (yearParam) {
      setYearFilter(yearParam);
    } else {
      setYearFilter("all");
    }
  }, [searchParams]);

  const handleExpenseFilterChange = (expenseType: ExpenseType) => {
    setExpenseFilter(expenseType);

    const params = new URLSearchParams(searchParams.toString());
    if (expenseType !== "all") {
      params.set("type", expenseType);
    } else {
      params.delete("type");
    }

    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)
  }, [expenses]);

  const yearFilterOptions = useMemo(() => [
    { value: "all", label: translations.filters.allYears },
    ...availableYears.map(year => ({ value: year, label: year }))
  ], [availableYears]);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    // Filter by expense type
    if (expenseFilter !== "all") {
      filtered = filtered.filter((expense) => expense.type === expenseFilter);
    }
    
    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter(expense => {
        const date = new Date(expense.date);
        return !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter;
      });
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, expenseFilter, yearFilter]);

  // Calculate summary based on current filters
  const expenseSummary = useMemo(() => {
    let expensesToSummarize = expenses;
    
    // Apply year filter
    if (yearFilter !== "all") {
      expensesToSummarize = expensesToSummarize.filter(expense => {
        const date = new Date(expense.date);
        return !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter;
      });
    }
    
    // If type filter is applied, only use filtered expenses for summary
    if (expenseFilter !== "all") {
      expensesToSummarize = expensesToSummarize.filter((e) => e.type === expenseFilter);
    }

    const maintenanceExpenses = expensesToSummarize.filter(
      (e) => e.type === "maintenance"
    );
    const worksExpenses = expensesToSummarize.filter(
      (e) => e.type === "works"
    );
    const othersExpenses = expensesToSummarize.filter(
      (e) => e.type === "others"
    );

    return {
      maintenance: {
        total: maintenanceExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
      works: {
        total: worksExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
      others: {
        total: othersExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
    };
  }, [expenses, expenseFilter, yearFilter]);

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
          isAuthenticated ? (
            <div className="flex items-center gap-2">
              <ExportButton 
                onExport={exportExpensesAction}
                variant="outline"
                size="default"
              >
                {translations.actions.export} {translations.labels.expenses} CSV
              </ExportButton>
              <NewExpenseButton isAuthenticated={isAuthenticated} />
            </div>
          ) : null
        }
        typeFilter={{
          value: expenseFilter,
          onChange: (value) => handleExpenseFilterChange(value as ExpenseType),
          options: [
            { value: "all", label: translations.filters.allExpenses },
            { value: "maintenance", label: translations.labels.maintenance },
            { value: "works", label: translations.labels.works },
            { value: "others", label: translations.labels.others },
          ],
        }}
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: yearFilterOptions,
        }}
      />

      {/* Expenses Summary */}
      <SummarySection
        items={[
          {
            type: "maintenance",
            total: expenseSummary.maintenance.total,
            show: expenseFilter === "all" || expenseFilter === "maintenance",
          },
          {
            type: "works",
            total: expenseSummary.works.total,
            show: expenseFilter === "all" || expenseFilter === "works",
          },
          {
            type: "others",
            total: expenseSummary.others.total,
            show: expenseFilter === "all" || expenseFilter === "others",
          },
        ]}
      />

      {/* Expenses Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        expenseFilter={expenseFilter}
        isAuthenticated={isAuthenticated}
        onEdit={setEditingExpense}
        onDelete={setDeletingExpense}
      />

      {/* Edit Modal */}
      {editingExpense && isAuthenticated && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAuthenticated && (
        <ConfirmationModal
          isOpen={!!deletingExpense}
          title={translations.confirmations.deleteTitle}
          message={`¿Estás seguro de que quieres eliminar el gasto "${deletingExpense?.description}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingExpense(null)}
          variant="danger"
        />
      )}
    </div>
  );
}
