"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit, Trash2, Filter } from "lucide-react";
import { Expense } from "@/types/expenses.types";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
}

type ExpenseType = "all" | "maintenance" | "works";

export default function ExpenseList({ title, expenses }: ExpenseListProps) {
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
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {/* Expense Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <Select
                value={expenseFilter}
                onValueChange={(value) =>
                  handleExpenseFilterChange(value as ExpenseType)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {translations.filters.allExpenses}
                  </SelectItem>
                  <SelectItem value="maintenance">
                    {translations.labels.maintenance}
                  </SelectItem>
                  <SelectItem value="works">
                    {translations.labels.works}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-muted/30 hover:bg-muted/50 group flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{expense.description}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        expense.type === "maintenance"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary-foreground"
                      }`}
                    >
                      {expense.type === "maintenance"
                        ? translations.labels.maintenance
                        : translations.labels.works}
                    </span>
                    <p className="text-muted-foreground text-sm">
                      {new Date(expense.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {expense.category && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      📂 {expense.category}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-destructive font-semibold">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingExpense(expense)}
                      title={`${translations.actions.edit} ${translations.labels.expenses.toLowerCase()}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingExpense(expense)}
                      className="text-destructive hover:text-destructive"
                      title={`${translations.actions.delete} ${translations.labels.expenses.toLowerCase()}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
      {editingExpense && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingExpense}
        title={translations.confirmations.deleteTitle}
        message={`¿Estás seguro de que quieres eliminar el gasto "${deletingExpense?.description}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingExpense(null)}
        variant="danger"
      />
    </div>
  );
}
