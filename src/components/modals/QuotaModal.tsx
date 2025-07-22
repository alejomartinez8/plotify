"use client";

import { useEffect, useActionState, useTransition } from "react";
import { X } from "lucide-react";
import {
  createOrUpdateQuotaAction,
  QuotaState,
} from "@/lib/actions/quota-actions";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";

interface QuotaModalProps {
  onClose: () => void;
  quotas: Array<{
    id: number;
    year: number;
    monthlyAmount: number;
  }>;
}

export default function QuotaModal({
  onClose,
  quotas,
}: QuotaModalProps) {
  const initialState: QuotaState = { message: "", errors: {} };
  const [state, formAction] = useActionState(createOrUpdateQuotaAction, initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.message && state.message.includes("exitosamente")) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {translations.modals.maintenanceQuotaConfiguration}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-600 text-sm">
            {translations.modals.maintenanceQuotaDescription}
          </p>

          {/* Quotas Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{translations.modals.quotasDefinedByYear}</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">{translations.modals.year}</th>
                    <th className="px-4 py-2 text-right">{translations.modals.monthlyMaintenanceQuota}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                        {translations.modals.notDefined}
                      </td>
                    </tr>
                  ) : (
                    quotas.map((quota) => (
                      <tr key={quota.id} className="border-t">
                        <td className="px-4 py-2 font-medium">{quota.year}</td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(quota.monthlyAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to Add/Update Quota */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">{translations.modals.addOrUpdateQuota}</h3>
            
            <form action={handleSubmit} className="space-y-4">
              {state.message && (
                <div
                  className={`text-sm mb-4 ${
                    state.message.includes("exitosamente")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {state.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.modals.year}
                </label>
                <select
                  name="year"
                  className="w-full border rounded-sm px-3 py-2"
                  required
                  disabled={isPending}
                >
                  <option value="">Selecciona el año</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                      {quotas.find(q => q.year === year) && (
                        ` (Actual: ${formatCurrency(quotas.find(q => q.year === year)!.monthlyAmount)})`
                      )}
                    </option>
                  ))}
                </select>
                {state.errors?.year && (
                  <div className="text-red-500 text-sm mt-1">
                    {state.errors.year}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.modals.monthlyAmount}
                </label>
                <input
                  type="number"
                  name="monthlyAmount"
                  className="w-full border rounded-sm px-3 py-2"
                  placeholder={translations.modals.monthlyAmountPlaceholder}
                  required
                  min="0"
                  step="1000"
                  disabled={isPending}
                />
                {state.errors?.monthlyAmount && (
                  <div className="text-red-500 text-sm mt-1">
                    {state.errors.monthlyAmount}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {translations.buttons.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending
                    ? translations.status.processing
                    : translations.buttons.saveQuota}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}