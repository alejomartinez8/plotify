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
import SummarySection from "@/components/shared/SummarySection";
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
  const [incomeFilter, setIncomeFilter] = useState<IncomeType>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get("type") as IncomeType;
    const yearParam = searchParams.get("year");

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
  }, [searchParams, router]);

  // Update URL when filters change

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

  const handleLotNavigation = (lotId: string) => {
    if (lotId !== "__all__") {
      router.push(`/income/${lotId}`);
    }
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

  // Calculate summary based on current filters
  const incomeSummary = React.useMemo(() => {
    let contributionsToSummarize = filteredContributions;
    
    // If type filter is applied, only use filtered contributions for summary
    if (incomeFilter !== "all") {
      contributionsToSummarize = contributionsToSummarize.filter((c) => c.type === incomeFilter);
    }

    const maintenanceContributions = contributionsToSummarize.filter(
      (c) => c.type === "maintenance"
    );
    const worksContributions = contributionsToSummarize.filter(
      (c) => c.type === "works"
    );
    const othersContributions = contributionsToSummarize.filter(
      (c) => c.type === "others"
    );

    return {
      maintenance: {
        total: maintenanceContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      works: {
        total: worksContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      others: {
        total: othersContributions.reduce((sum, c) => sum + c.amount, 0),
      },
    };
  }, [filteredContributions, incomeFilter]);

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
        lotFilter={{
          value: "__all__",
          onChange: handleLotNavigation,
          lots: lots,
        }}
      />

      {/* Income Summary */}
      <SummarySection
        items={[
          {
            type: "maintenance",
            total: incomeSummary.maintenance.total,
            show: incomeFilter === "all" || incomeFilter === "maintenance",
          },
          {
            type: "works",
            total: incomeSummary.works.total,
            show: incomeFilter === "all" || incomeFilter === "works",
          },
          {
            type: "others",
            total: incomeSummary.others.total,
            show: incomeFilter === "all" || incomeFilter === "others",
          },
        ]}
      />

      <div className="mt-6">
        <IncomeReceiptTable
          contributions={filteredContributions}
          lots={lots}
          incomeFilter={incomeFilter}
          isAuthenticated={isAuthenticated}
          onEdit={setEditingContribution}
          onDelete={setDeletingContribution}
        />
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
