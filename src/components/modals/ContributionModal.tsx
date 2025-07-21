"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { months } from "@/lib/constants";
import { translations } from "@/lib/translations";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contribution: Omit<Contribution, "id">) => void;
  lots: Lot[];
  lotsLoading?: boolean;
}

export default function ContributionModal({
  isOpen,
  onClose,
  onSubmit,
  lots,
  lotsLoading = false,
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
      date: new Date(formData.date),
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
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {translations.modals.registerNewContribution}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.modals.lot}
              </label>
              <select
                value={formData.lotId}
                onChange={(e) => handleChange("lotId", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
                disabled={lotsLoading}
              >
                <option value="">
                  {lotsLoading ? translations.status.loading : translations.modals.selectLot}
                </option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotNumber} - {lot.owner}
                  </option>
                ))}
              </select>
            </div>

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
                {translations.modals.month}
              </label>
              <select
                value={formData.month}
                onChange={(e) => handleChange("month", e.target.value)}
                className="w-full border rounded-sm px-3 py-2"
                required
              >
                <option value="">{translations.modals.selectMonth}</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
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
                placeholder={translations.modals.optionalDescription}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700"
              >
                {translations.buttons.saveContribution}
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
