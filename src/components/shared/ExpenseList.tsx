"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Card, CardContent } from "@/components/ui/card";
import SummarySection from "@/components/shared/SummarySection";
import FilterSection from "@/components/shared/FilterSection";
import ItemCard from "@/components/shared/ItemCard";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
  isAuthenticated?: boolean;
}

type ExpenseType = "all" | "maintenance" | "works";

export default function ExpenseList({ title, expenses, isAuthenticated = false }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseType>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get("type") as ExpenseType;

    if (typeParam && (typeParam === "maintenance" || typeParam === "works")) {
      setExpenseFilter(typeParam);
    } else {
      setExpenseFilter("all");
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

  const filteredExpenses = useMemo(() => {
    if (expenseFilter === "all") {
      return expenses;
    }
    return expenses.filter((expense) => expense.type === expenseFilter);
  }, [expenses, expenseFilter]);

  // Calculate summary based on current filter
  const expenseSummary = useMemo(() => {
    let expensesToSummarize = expenses;
    
    // If filter is applied, only use filtered expenses for summary
    if (expenseFilter !== "all") {
      expensesToSummarize = expenses.filter((e) => e.type === expenseFilter);
    }

    const maintenanceExpenses = expensesToSummarize.filter(
      (e) => e.type === "maintenance"
    );
    const worksExpenses = expensesToSummarize.filter(
      (e) => e.type === "works"
    );

    return {
      maintenance: {
        total: maintenanceExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
      works: {
        total: worksExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
    };
  }, [expenses, expenseFilter]);

  const handleExpenseSuccess = (expense: Expense, isUpdate: boolean) => {
    console.log(isUpdate ? "Updated expense:" : "Created expense:", expense);
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    try {
      const { deleteExpenseAction } = await import(
        "@/lib/actions/expense-actions"
      );
      await deleteExpenseAction(deletingExpense.id);
      console.log("Deleted expense:", deletingExpense);
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
        typeFilter={{
          value: expenseFilter,
          onChange: (value) => handleExpenseFilterChange(value as ExpenseType),
          options: [
            { value: "all", label: translations.filters.allExpenses },
            { value: "maintenance", label: translations.labels.maintenance },
            { value: "works", label: translations.labels.works },
          ],
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
        ]}
      />

      {/* Expenses List Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ItemCard
                key={expense.id}
                id={expense.id}
                date={expense.date}
                title={expense.description}
                type={expense.type}
                amount={expense.amount}
                amountColorClass="text-destructive"
                isAuthenticated={isAuthenticated}
                onEdit={() => setEditingExpense(expense)}
                onDelete={() => setDeletingExpense(expense)}
                editTitle={`${translations.actions.edit} ${translations.labels.expenses.toLowerCase()}`}
                deleteTitle={`${translations.actions.delete} ${translations.labels.expenses.toLowerCase()}`}
              />
            ))}
            {filteredExpenses.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-muted-foreground mb-4 text-6xl">💳</div>
                <p className="text-muted-foreground mb-2 text-lg">
                  {translations.messages.noExpenses}
                </p>
                {expenseFilter !== "all" && (
                  <p className="text-muted-foreground text-sm">
                    Intenta cambiar el filtro de tipo de gasto
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
