"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { months } from "@/lib/constants";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contribution: Omit<Contribution, "id">) => void;
  lots: Lot[];
}

export default function ContributionModal({
  isOpen,
  onClose,
  onSubmit,
  lots,
}: ContributionModalProps) {
  const [formData, setFormData] = useState({
    lotId: "",
    type: "maintenance" as ContributionType,
    amount: "",
    month: "",
    year: 2024,
    date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      lotId: formData.lotId,
      amount: parseFloat(formData.amount),
    });
    setFormData({
      lotId: "",
      type: "maintenance",
      amount: "",
      month: "",
      year: 2024,
      date: "",
      description: "",
    });
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Register New Contribution
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot
              </label>
              <select
                value={formData.lotId}
                onChange={(e) => handleChange("lotId", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              >
                <option value="">Select lot</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.id} - {lot.owner}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fund Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              >
                <option value="maintenance">Maintenance</option>
                <option value="works">Works</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={formData.month}
                onChange={(e) => handleChange("month", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              >
                <option value="">Select month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
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
                Date
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
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                placeholder="Optional description"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700"
              >
                Save Contribution
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-400 text-white py-2 rounded-sm hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
