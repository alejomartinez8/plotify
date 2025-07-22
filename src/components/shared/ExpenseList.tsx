"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expense } from "@/types/expenses.types";
import { ContributionType } from "@/types/contributions.types";
import { formatCurrency, cn } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
  type: ContributionType;
  variant: "default" | "secondary";
}

export default function ExpenseList({
  title,
  expenses,
  type,
  variant = "default",
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const filteredExpenses = expenses.filter((e) => e.type === type);

  // Remove color classes - using semantic variants instead

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-sm group"
          >
            <div className="flex-1">
              <p className="font-medium">{expense.description}</p>
              <p className="text-sm text-gray-600">{expense.date}</p>
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
          <p className="text-muted-foreground text-center py-4">
            {translations.messages.noExpenses}
          </p>
        )}
      </div>
      </CardContent>

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
    </Card>
  );
}
