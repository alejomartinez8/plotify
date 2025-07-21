"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expense } from "@/types/expenses.types";
import { ContributionType } from "@/types/contributions.types";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
  type: ContributionType;
  color: "blue" | "orange";
}

export default function ExpenseList({
  title,
  expenses,
  type,
  color,
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const filteredExpenses = expenses.filter((e) => e.type === type);

  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className={`text-lg font-semibold mb-4 ${colorClasses[color]}`}>
        {title}
      </h3>
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
              <span className="font-semibold text-red-600">
                {formatCurrency(expense.amount)}
              </span>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingExpense(expense)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title={translations.tooltips.editExpense}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingExpense(expense)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title={translations.tooltips.deleteExpense}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            {translations.expenseList.noExpensesRecorded}
          </p>
        )}
      </div>

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
        title={translations.confirmations.deleteExpense.title}
        message={`¿Estás seguro de que quieres eliminar el gasto "${deletingExpense?.description}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingExpense(null)}
        variant="danger"
      />
    </div>
  );
}
