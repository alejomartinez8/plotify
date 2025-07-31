"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import FilterSection from "@/components/shared/FilterSection";
import IncomeReceiptTable, { IncomeType } from "@/components/shared/IncomeReceiptTable";
import IncomeTable from "@/components/shared/IncomeTable";
import NewContributionButton from "@/components/shared/NewContributionButton";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportIncomesAction } from "@/lib/actions/export-actions";

interface IncomeViewProps {
  contributions: Contribution[];
  lots: Lot[];
  isAuthenticated?: boolean;
}


export default function IncomeView({
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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("list");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const lotParam = searchParams.get("lot");
    const typeParam = searchParams.get("type") as IncomeType;
    const yearParam = searchParams.get("year");
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

    if (
      typeParam &&
      ["all", "maintenance", "works", "others"].includes(typeParam)
    ) {
      setIncomeFilter(typeParam);
    } else if (typeParam) {
      // If type in URL is invalid, clear it
      const params = new URLSearchParams(searchParams.toString());
      params.delete("type");
      router.replace(`?${params.toString()}`, { scroll: false });
      setIncomeFilter("all");
    }

    if (yearParam) {
      setYearFilter(yearParam);
    } else {
      setYearFilter("all");
    }

    if (tabParam && ["list", "summary"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (tabParam) {
      // If tab in URL is invalid, clear it
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`?${params.toString()}`, { scroll: false });
      setActiveTab("list");
    } else if (!tabParam) {
      setActiveTab("list");
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

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);

    const params = new URLSearchParams(searchParams.toString());
    if (year !== "all") {
      params.set("year", year);
    } else {
      params.delete("year");
    }

    // Update URL without causing a page refresh
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const getLotInfo = (lotId: string | number) => {
    return lots.find((lot) => lot.id === lotId);
  };

  const handleContributionSuccess = () => {
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
    if (tabValue !== "list") {
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

  // Extract unique years from contributions for filter options
  const availableYears = React.useMemo(() => {
    const years = new Set<string>();
    contributions.forEach(contribution => {
      const date = new Date(contribution.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)
  }, [contributions]);

  const yearFilterOptions = React.useMemo(() => [
    { value: "all", label: translations.filters.allYears },
    ...availableYears.map(year => ({ value: year, label: year }))
  ], [availableYears]);

  // Filter contributions by year
  const filteredContributions = React.useMemo(() => {
    if (yearFilter === "all") {
      return contributions;
    }
    return contributions.filter(contribution => {
      const date = new Date(contribution.date);
      return !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter;
    });
  }, [contributions, yearFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with unified filters and actions */}
      <FilterSection
        title="Aportes"
        actionButton={
          isAuthenticated ? (
            <div className="flex items-center gap-2">
              <ExportButton 
                onExport={exportIncomesAction}
                variant="outline"
                size="default"
              >
                {translations.actions.export} {translations.labels.income} CSV
              </ExportButton>
              <NewContributionButton 
                isAuthenticated={isAuthenticated}
                lots={lots}
              />
            </div>
          ) : null
        }
        viewFilter={{
          value: activeTab,
          onChange: handleTabChange,
          options: [
            { value: "list", label: translations.labels.list },
            { value: "summary", label: translations.labels.summaryByLot },
          ],
        }}
        typeFilter={{
          value: incomeFilter,
          onChange: (value) => handleIncomeFilterChange(value as IncomeType),
          options: [
            { value: "all", label: translations.filters.allIncome },
            { value: "maintenance", label: translations.labels.maintenance },
            { value: "works", label: translations.labels.works },
            { value: "others", label: translations.labels.others },
          ],
        }}
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: yearFilterOptions,
        }}
        lotFilter={
          activeTab === "list"
            ? {
                value: selectedLotId,
                onChange: (value) =>
                  handleLotFilterChange(value === "__all__" ? "" : value),
                lots: lots,
              }
            : undefined
        }
      />

      <div className="mt-6">
        {activeTab === "list" && (
          <IncomeReceiptTable
            contributions={filteredContributions}
            lots={lots}
            selectedLotId={selectedLotId}
            incomeFilter={incomeFilter}
            isAuthenticated={isAuthenticated}
            onEdit={setEditingContribution}
            onDelete={setDeletingContribution}
          />
        )}

        {activeTab === "summary" && (
          <IncomeTable
            lots={lots}
            contributions={filteredContributions}
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
