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

interface ExpensePageListProps {
  title: string;
  expenses: Expense[];
}

type ExpenseType = "all" | "maintenance" | "works";

export default function ExpensePageList({
  title,
  expenses,
}: ExpensePageListProps) {
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
    return expenses.filter(expense => expense.type === expenseFilter);
  }, [expenses, expenseFilter]);

  const handleExpenseSuccess = (expense: Expense, isUpdate: boolean) => {
    console.log(isUpdate ? "Updated expense:" : "Created expense:", expense);
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    
    try {
      const { deleteExpenseAction } = await import("@/lib/actions/expense-actions");
      await deleteExpenseAction(deletingExpense.id);
      console.log("Deleted expense:", deletingExpense);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeletingExpense(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Expense Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select 
                value={expenseFilter} 
                onValueChange={(value) => handleExpenseFilterChange(value as ExpenseType)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.filters.allExpenses}</SelectItem>
                  <SelectItem value="maintenance">{translations.labels.maintenance}</SelectItem>
                  <SelectItem value="works">{translations.labels.works}</SelectItem>
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
                className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1">
                  <p className="font-medium">{expense.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      expense.type === "maintenance" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary/10 text-secondary-foreground"
                    }`}>
                      {expense.type === "maintenance" ? translations.labels.maintenance : translations.labels.works}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long", 
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {expense.category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📂 {expense.category}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-destructive">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingExpense(expense)}
                      title={`${translations.actions.edit} ${translations.labels.expenses.toLowerCase()}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingExpense(expense)}
                      className="text-destructive hover:text-destructive"
                      title={`${translations.actions.delete} ${translations.labels.expenses.toLowerCase()}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-6xl mb-4">💳</div>
                <p className="text-muted-foreground text-lg mb-2">
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