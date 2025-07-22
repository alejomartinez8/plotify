"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit, Trash2, Filter } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";

interface ContributionListProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
  color: "blue" | "orange";
}

export default function ContributionList({
  title,
  contributions,
  lots,
  color,
}: ContributionListProps) {
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] =
    useState<Contribution | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filter from URL parameter
  useEffect(() => {
    const lotParam = searchParams.get("lot");
    if (lotParam && lots.some(lot => lot.id === lotParam)) {
      setSelectedLotId(lotParam);
    } else if (lotParam && !lots.some(lot => lot.id === lotParam)) {
      // If lot ID in URL doesn't exist, clear the parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lot");
      router.replace(`?${params.toString()}`, { scroll: false });
      setSelectedLotId("");
    } else if (!lotParam) {
      setSelectedLotId("");
    }
  }, [searchParams, lots, router]);

  // Update URL when filter changes
  const handleLotFilterChange = (lotId: string) => {
    setSelectedLotId(lotId);
    
    const params = new URLSearchParams(searchParams.toString());
    if (lotId) {
      params.set("lot", lotId);
    } else {
      params.delete("lot");
    }
    
    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  const getLotInfo = (lotId: string | number) => {
    return lots.find((lot) => lot.id === lotId);
  };

  const handleContributionSuccess = (
    contribution: Contribution,
    isUpdate: boolean
  ) => {
    console.log(
      isUpdate ? "Updated contribution:" : "Created contribution:",
      contribution
    );
    setEditingContribution(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContribution) return;

    try {
      const { deleteContributionAction } = await import(
        "@/lib/actions/contribution-actions"
      );
      await deleteContributionAction(deletingContribution.id);
      console.log("Deleted contribution:", deletingContribution);
    } catch (error) {
      console.error("Error deleting contribution:", error);
    } finally {
      setDeletingContribution(null);
    }
  };

  // Filter contributions by selected lot
  const filteredContributions = useMemo(() => {
    if (!selectedLotId) return contributions;
    return contributions.filter((c) => c.lotId === selectedLotId);
  }, [contributions, selectedLotId]);

  // Calculate summary for selected lot
  const lotSummary = useMemo(() => {
    if (!selectedLotId) return null;
    
    const lotContributions = contributions.filter((c) => c.lotId === selectedLotId);
    const maintenanceContributions = lotContributions.filter((c) => c.type === "maintenance");
    const worksContributions = lotContributions.filter((c) => c.type === "works");
    
    return {
      maintenance: {
        count: maintenanceContributions.length,
        total: maintenanceContributions.reduce((sum, c) => sum + c.amount, 0)
      },
      works: {
        count: worksContributions.length,
        total: worksContributions.reduce((sum, c) => sum + c.amount, 0)
      }
    };
  }, [contributions, selectedLotId]);

  const selectedLot = lots.find(lot => lot.id === selectedLotId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${colorClasses[color]}`}>
          {title}
        </h3>
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedLotId}
            onChange={(e) => handleLotFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los lotes</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                Lote {lot.lotNumber} - {lot.owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lot Summary */}
      {lotSummary && selectedLot && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Resumen - Lote {selectedLot.lotNumber} ({selectedLot.owner})
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Mantenimiento:</p>
              <p className="font-semibold text-blue-600">
                {lotSummary.maintenance.count} pagos - {formatCurrency(lotSummary.maintenance.total)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Obras:</p>
              <p className="font-semibold text-orange-600">
                {lotSummary.works.count} pagos - {formatCurrency(lotSummary.works.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredContributions.map((contribution) => {
          const lot = getLotInfo(contribution.lotId);
          return (
            <div
              key={contribution.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-sm group"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">
                      Lote {lot?.lotNumber} - {lot?.owner}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(contribution.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
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
        {filteredContributions.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            {selectedLotId 
              ? `No hay contribuciones registradas para este lote` 
              : translations.messages.noContributionsRecorded
            }
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
        message={`¿Estás seguro de que quieres eliminar la contribución de ${
          deletingContribution
            ? getLotInfo(deletingContribution.lotId)?.owner
            : ""
        }? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingContribution(null)}
        variant="danger"
      />
    </div>
  );
}
