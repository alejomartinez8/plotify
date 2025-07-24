"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import FilterSection from "@/components/shared/FilterSection";
import IncomeList from "@/components/shared/IncomeList";
import IncomeTable from "@/components/shared/IncomeTable";

interface IncomeViewProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
  isAuthenticated?: boolean;
}

type IncomeType = "all" | "maintenance" | "works";

export default function IncomeView({
  title,
  contributions,
  lots,
  isAuthenticated = false,
}: IncomeViewProps) {
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] =
    useState<Contribution | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [incomeFilter, setIncomeFilter] = useState<IncomeType>("all");
  const [activeTab, setActiveTab] = useState<string>("summary");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const lotParam = searchParams.get("lot");
    const typeParam = searchParams.get("type") as IncomeType;
    const tabParam = searchParams.get("tab");

    if (lotParam && lots.some((lot) => lot.id === lotParam)) {
      setSelectedLotId(lotParam);
    } else if (lotParam && !lots.some((lot) => lot.id === lotParam)) {
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

    if (tabParam && ["list", "summary"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (tabParam) {
      // If tab in URL is invalid, clear it
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`?${params.toString()}`, { scroll: false });
      setActiveTab("summary");
    } else if (!tabParam) {
      setActiveTab("summary");
    }
  }, [searchParams, lots, router]);

  // Update URL when filters change
  const handleLotFilterChange = (lotId: string) => {
    const actualLotId = lotId === "__all__" ? "" : lotId;
    setSelectedLotId(actualLotId);

    const params = new URLSearchParams(searchParams.toString());
    if (actualLotId) {
      params.set("lot", actualLotId);
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

  const getLotInfo = (lotId: string | number) => {
    return lots.find((lot) => lot.id === lotId);
  };

  const handleContributionSuccess = (
    contribution: Contribution,
    isUpdate: boolean
  ) => {
    setEditingContribution(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContribution) return;

    try {
      const { deleteContributionAction } = await import(
        "@/lib/actions/contribution-actions"
      );
      await deleteContributionAction(deletingContribution.id);
    } catch (error) {
      console.error("Error deleting contribution:", error);
    } finally {
      setDeletingContribution(null);
    }
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);

    const params = new URLSearchParams(searchParams.toString());
    if (tabValue !== "summary") {
      params.set("tab", tabValue);
    } else {
      params.delete("tab");
    }

    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleLotClickFromSummary = (lotId: string) => {
    setActiveTab("list");
    handleLotFilterChange(lotId);
    
    // Update tab in URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "list");
    if (lotId) {
      params.set("lot", lotId);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with unified filters and actions */}
      <FilterSection
        title="Aportes"
        viewFilter={{
          value: activeTab,
          onChange: handleTabChange,
          options: [
            { value: "summary", label: translations.labels.summaryByLot },
            { value: "list", label: translations.labels.list },
          ],
        }}
        typeFilter={{
          value: incomeFilter,
          onChange: (value) => handleIncomeFilterChange(value as IncomeType),
          options: [
            { value: "all", label: translations.filters.allIncome },
            { value: "maintenance", label: translations.labels.maintenance },
            { value: "works", label: translations.labels.works },
          ],
        }}
        lotFilter={activeTab === "list" ? {
          value: selectedLotId,
          onChange: (value) =>
            handleLotFilterChange(value === "__all__" ? "" : value),
          lots: lots,
        } : undefined}
      />

      <div className="mt-6">
        {activeTab === "list" && (
          <IncomeList
            contributions={contributions}
            lots={lots}
            selectedLotId={selectedLotId}
            incomeFilter={incomeFilter}
            isAuthenticated={isAuthenticated}
            onEdit={setEditingContribution}
            onDelete={setDeletingContribution}
            getLotInfo={getLotInfo}
          />
        )}

        {activeTab === "summary" && (
          <IncomeTable
            lots={lots}
            contributions={contributions}
            incomeFilter={incomeFilter}
            onLotClick={handleLotClickFromSummary}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editingContribution && isAuthenticated && (
        <ContributionModal
          contribution={editingContribution}
          onClose={() => setEditingContribution(null)}
          onSuccess={handleContributionSuccess}
          lots={lots}
          lotsLoading={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAuthenticated && (
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
      )}
    </div>
  );
}