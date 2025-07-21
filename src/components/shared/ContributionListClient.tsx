"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";

interface ContributionListClientProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
  color: "blue" | "orange";
}

export default function ContributionListClient({
  title,
  contributions,
  lots,
  color,
}: ContributionListClientProps) {
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] = useState<Contribution | null>(null);

  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  const getLotInfo = (lotId: string | number) => {
    return lots.find(lot => lot.id === lotId);
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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className={`text-lg font-semibold mb-4 ${colorClasses[color]}`}>
        {title}
      </h3>
      <div className="space-y-3">
        {contributions.map((contribution) => {
          const lot = getLotInfo(contribution.lotId);
          return (
            <div
              key={contribution.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-sm group"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">Lote {lot?.lotNumber} - {lot?.owner}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(contribution.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-green-600">
                  {formatCurrency(contribution.amount)}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingContribution(contribution)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title={translations.tooltips.editContribution}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingContribution(contribution)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title={translations.tooltips.deleteContribution}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {contributions.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            {translations.messages.noContributionsRecorded}
          </p>
        )}
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
        message={`¿Estás seguro de que quieres eliminar la contribución de ${deletingContribution ? getLotInfo(deletingContribution.lotId)?.owner : ''}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingContribution(null)}
        variant="danger"
      />
    </div>
  );
}