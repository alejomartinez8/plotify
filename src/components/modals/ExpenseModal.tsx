"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, "id">) => void;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    type: "maintenance" as "maintenance" | "works",
    amount: "",
    date: "",
    description: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      category: formData.category,
    });
    setFormData({
      type: "maintenance",
      amount: "",
      date: "",
      description: "",
      category: "",
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {translations.modals.registerNewExpense}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.fundType}
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              >
                <option value="maintenance">
                  {translations.modals.maintenance}
                </option>
                <option value="works">{translations.modals.works}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.amount}
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.date}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.description}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                placeholder={translations.modals.expenseDescription}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.category}
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                placeholder={translations.modals.categoryPlaceholder}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-2 rounded-sm hover:bg-red-700"
              >
                {translations.buttons.saveExpense}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-400 text-white py-2 rounded-sm hover:bg-gray-500"
              >
                {translations.buttons.cancel}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
