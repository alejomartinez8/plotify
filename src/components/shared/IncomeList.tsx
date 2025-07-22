"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit, Trash2, Filter, Settings } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { formatCurrency } from "@/lib/utils";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import QuotaModal from "../modals/QuotaModal";

interface IncomeListProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
  quotas: Array<{
    id: number;
    year: number;
    monthlyAmount: number;
  }>;
}

type IncomeType = "all" | "maintenance" | "works";

export default function IncomeList({
  title,
  contributions,
  lots,
  quotas,
}: IncomeListProps) {
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] =
    useState<Contribution | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [incomeFilter, setIncomeFilter] = useState<IncomeType>("all");
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const lotParam = searchParams.get("lot");
    const typeParam = searchParams.get("type") as IncomeType;
    
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

    if (typeParam && ["all", "maintenance", "works"].includes(typeParam)) {
      setIncomeFilter(typeParam);
    } else if (typeParam) {
      // If type in URL is invalid, clear it
      const params = new URLSearchParams(searchParams.toString());
      params.delete("type");
      router.replace(`?${params.toString()}`, { scroll: false });
      setIncomeFilter("all");
    }
  }, [searchParams, lots, router]);

  // Update URL when filters change
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

  const handleIncomeFilterChange = (incomeType: IncomeType) => {
    setIncomeFilter(incomeType);
    
    const params = new URLSearchParams(searchParams.toString());
    if (incomeType !== "all") {
      params.set("type", incomeType);
    } else {
      params.delete("type");
    }
    
    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const getColorForFilter = (filter: IncomeType): "blue" | "orange" => {
    switch (filter) {
      case "maintenance":
        return "blue";
      case "works":
        return "orange";
      default:
        return "blue";
    }
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

  // Filter contributions by selected filters
  const filteredContributions = useMemo(() => {
    let filtered = contributions;
    
    // Filter by income type
    if (incomeFilter !== "all") {
      filtered = filtered.filter((c) => c.type === incomeFilter);
    }
    
    // Filter by selected lot
    if (selectedLotId) {
      filtered = filtered.filter((c) => c.lotId === selectedLotId);
    }
    
    return filtered;
  }, [contributions, incomeFilter, selectedLotId]);

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
  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with unified filters and actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Income Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={incomeFilter}
                onChange={(e) => handleIncomeFilterChange(e.target.value as IncomeType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">{translations.filters.allIncome}</option>
                <option value="maintenance">{translations.labels.maintenance}</option>
                <option value="works">{translations.labels.works}</option>
              </select>
            </div>
            
            {/* Lot Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedLotId}
                onChange={(e) => handleLotFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">{translations.filters.allLots}</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    Lote {lot.lotNumber} - {lot.owner}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Quota Configuration Button */}
            <button
              onClick={() => setShowQuotaModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{translations.titles.quotaConfig}</span>
              <span className="sm:hidden">Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* Income List Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm">

        {/* Lot Summary - appears when a lot is selected */}
        {lotSummary && selectedLot && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">
              📊 {translations.labels.summary} - Lote {selectedLot.lotNumber} ({selectedLot.owner})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600 mb-1">{translations.labels.maintenance}:</p>
                <p className="font-semibold text-blue-600">
                  {lotSummary.maintenance.count} {translations.labels.payments} - {formatCurrency(lotSummary.maintenance.total)}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600 mb-1">{translations.labels.works}:</p>
                <p className="font-semibold text-orange-600">
                  {lotSummary.works.count} {translations.labels.payments} - {formatCurrency(lotSummary.works.total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${colorClasses[getColorForFilter(incomeFilter)]}`}>
              {incomeFilter === "all" 
                ? translations.navigation.income
                : incomeFilter === "maintenance" 
                  ? translations.titles.maintenanceContributions
                  : translations.titles.worksContributions}
            </h3>
            <p className="text-sm text-gray-600">
              {filteredContributions.length} {filteredContributions.length === 1 ? translations.labels.result : translations.labels.results}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredContributions.map((contribution) => {
            const lot = getLotInfo(contribution.lotId);
            return (
              <div
                key={contribution.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        Lote {lot?.lotNumber} - {lot?.owner}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contribution.type === "maintenance" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {contribution.type === "maintenance" ? translations.labels.maintenance : translations.labels.works}
                        </span>
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
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-green-600">
                    {formatCurrency(contribution.amount)}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingContribution(contribution)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title={translations.actions.edit}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingContribution(contribution)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title={translations.actions.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredContributions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">
                {selectedLotId 
                  ? translations.messages.noContributionsForLot
                  : translations.messages.noContributions
                }
              </p>
              <p className="text-gray-400 text-sm">
                {incomeFilter !== "all" && translations.messages.changeFilter}
              </p>
            </div>
          )}
        </div>
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
        title={translations.confirmations.deleteTitle}
        message={`¿Estás seguro de que quieres eliminar la contribución de ${
          deletingContribution
            ? getLotInfo(deletingContribution.lotId)?.owner
            : ""
        }? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingContribution(null)}
        variant="danger"
      />

      {/* Quota Configuration Modal */}
      {showQuotaModal && (
        <QuotaModal onClose={() => setShowQuotaModal(false)} quotas={quotas} />
      )}
    </div>
  );
}