"use client";

import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { months } from "@/lib/constants";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";

interface PaymentGridProps {
  title: string;
  lots: Lot[];
  contributions: Contribution[];
  type: ContributionType;
  headerColor: string;
  cellColor: string;
}

export default function PaymentGrid({
  title,
  lots,
  contributions,
  type,
  headerColor,
  cellColor,
}: PaymentGridProps) {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] = useState<Contribution | null>(null);

  const getContribution = (lotId: string | number, month: string): Contribution | null => {
    return contributions.find(
      (c) => {
        const contributionDate = new Date(c.date);
        const contributionMonth = contributionDate.toLocaleString('en-US', { month: 'short' });
        const contributionYear = contributionDate.getFullYear();
        return (
          c.lotId === lotId &&
          contributionMonth === month &&
          contributionYear === selectedYear &&
          c.type === type
        );
      }
    ) || null;
  };

  const handleContributionSuccess = (contribution: Contribution, isUpdate: boolean) => {
    console.log(isUpdate ? "Updated contribution:" : "Created contribution:", contribution);
    setEditingContribution(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContribution) return;
    
    try {
      const { deleteContributionAction } = await import("@/lib/actions/contribution-actions");
      await deleteContributionAction(deletingContribution.id);
      console.log("Deleted contribution:", deletingContribution);
    } catch (error) {
      console.error("Error deleting contribution:", error);
    } finally {
      setDeletingContribution(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {title} {selectedYear}
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border rounded-sm px-3 py-1"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={headerColor}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                {translations.grid.lotNo}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                {translations.grid.owner}
              </th>
              {months.map((month) => (
                <th
                  key={month}
                  className="px-3 py-3 text-center text-xs font-medium text-black uppercase tracking-wider"
                >
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-gray-50">
                <td
                  className={`px-4 py-4 text-sm font-medium text-gray-900 ${cellColor}`}
                >
                  {lot.lotNumber}
                </td>
                <td className={`px-4 py-4 text-sm text-gray-900 ${cellColor}`}>
                  {lot.owner}
                </td>
                {months.map((month) => {
                  const contribution = getContribution(lot.id, month);
                  return (
                    <td key={month} className="px-3 py-4 text-center relative group">
                      {contribution ? (
                        <div className="relative">
                          <div className="w-6 h-6 bg-green-500 rounded-sm mx-auto flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          {/* Edit/Delete buttons - appear on hover */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded border flex z-10">
                            <button
                              onClick={() => setEditingContribution(contribution)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-l"
                              title={translations.tooltips.editContribution}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeletingContribution(contribution)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-r border-l"
                              title={translations.tooltips.deleteContribution}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded-sm mx-auto"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingContribution && (
        <ContributionModal
          contribution={editingContribution}
          onClose={() => setEditingContribution(null)}
          onSuccess={handleContributionSuccess}
          lots={lots}
          lotsLoading={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingContribution}
        title={translations.confirmations.deleteContribution.title}
        message={`¿Estás seguro de que quieres eliminar la contribución de ${lots.find(l => l.id === deletingContribution?.lotId)?.owner}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingContribution(null)}
        variant="danger"
      />
    </div>
  );
}
