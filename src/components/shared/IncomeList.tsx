"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import ContributionModal from "../modals/ContributionModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { Card, CardContent } from "@/components/ui/card";
import SummarySection from "@/components/shared/SummarySection";
import FilterSection from "@/components/shared/FilterSection";
import ItemCard from "@/components/shared/ItemCard";

interface IncomeListProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
  isAuthenticated?: boolean;
}

type IncomeType = "all" | "maintenance" | "works";

export default function IncomeList({
  title,
  contributions,
  lots,
  isAuthenticated = false,
}: IncomeListProps) {
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] =
    useState<Contribution | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [incomeFilter, setIncomeFilter] = useState<IncomeType>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const lotParam = searchParams.get("lot");
    const typeParam = searchParams.get("type") as IncomeType;

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

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contributions, incomeFilter, selectedLotId]);

  // Calculate summary for selected lot
  const lotSummary = useMemo(() => {
    if (!selectedLotId) return null;

    const lotContributions = contributions.filter(
      (c) => c.lotId === selectedLotId
    );
    const maintenanceContributions = lotContributions.filter(
      (c) => c.type === "maintenance"
    );
    const worksContributions = lotContributions.filter(
      (c) => c.type === "works"
    );

    return {
      maintenance: {
        count: maintenanceContributions.length,
        total: maintenanceContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      works: {
        count: worksContributions.length,
        total: worksContributions.reduce((sum, c) => sum + c.amount, 0),
      },
    };
  }, [contributions, selectedLotId]);

  // Calculate summary for all lots when no specific lot is selected
  const allLotsSummary = useMemo(() => {
    if (selectedLotId) return null;

    let contributionsToSummarize = contributions;

    // If filter is applied, only use filtered contributions for summary
    if (incomeFilter !== "all") {
      contributionsToSummarize = contributions.filter(
        (c) => c.type === incomeFilter
      );
    }

    const maintenanceContributions = contributionsToSummarize.filter(
      (c) => c.type === "maintenance"
    );
    const worksContributions = contributionsToSummarize.filter(
      (c) => c.type === "works"
    );

    return {
      maintenance: {
        count: maintenanceContributions.length,
        total: maintenanceContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      works: {
        count: worksContributions.length,
        total: worksContributions.reduce((sum, c) => sum + c.amount, 0),
      },
    };
  }, [contributions, selectedLotId, incomeFilter]);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with unified filters and actions */}
      <FilterSection
        title={title}
        typeFilter={{
          value: incomeFilter,
          onChange: (value) => handleIncomeFilterChange(value as IncomeType),
          options: [
            { value: "all", label: translations.filters.allIncome },
            { value: "maintenance", label: translations.labels.maintenance },
            { value: "works", label: translations.labels.works },
          ],
        }}
        lotFilter={{
          value: selectedLotId,
          onChange: (value) => handleLotFilterChange(value === "__all__" ? "" : value),
          lots: lots,
        }}
      />

      {/* Lot Summary - appears when a lot is selected */}
      {lotSummary && selectedLot && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">
            📊 {translations.labels.summary} - Lote {selectedLot.lotNumber} ({selectedLot.owner})
          </h3>
          <SummarySection
            items={[
              {
                type: "maintenance",
                total: lotSummary.maintenance.total,
                show: true,
              },
              {
                type: "works",
                total: lotSummary.works.total,
                show: true,
              },
            ]}
          />
        </div>
      )}

      {/* All Lots Summary - appears when all lots are selected */}
      {allLotsSummary && (
        <SummarySection
          items={[
            {
              type: "maintenance",
              total: allLotsSummary.maintenance.total,
              show: incomeFilter === "all" || incomeFilter === "maintenance",
            },
            {
              type: "works",
              total: allLotsSummary.works.total,
              show: incomeFilter === "all" || incomeFilter === "works",
            },
          ]}
        />
      )}

      {/* Income List Card */}
      <Card>
        <CardContent className="p-6">
          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {filteredContributions.length}{" "}
                {filteredContributions.length === 1
                  ? translations.labels.result
                  : translations.labels.results}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredContributions.map((contribution) => {
              const lot = getLotInfo(contribution.lotId);
              return (
                <ItemCard
                  key={contribution.id}
                  id={contribution.id}
                  date={contribution.date}
                  title={`Lote ${lot?.lotNumber} - ${lot?.owner}`}
                  type={contribution.type}
                  amount={contribution.amount}
                  description={contribution.description}
                  receiptNumber={contribution.receiptNumber}
                  amountColorClass="text-emerald-600"
                  isAuthenticated={isAuthenticated}
                  onEdit={() => setEditingContribution(contribution)}
                  onDelete={() => setDeletingContribution(contribution)}
                  editTitle={translations.actions.edit}
                  deleteTitle={translations.actions.delete}
                />
              );
            })}
            {filteredContributions.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-muted-foreground mb-4 text-6xl">📊</div>
                <p className="text-muted-foreground mb-2 text-lg">
                  {selectedLotId
                    ? translations.messages.noContributionsForLot
                    : translations.messages.noContributions}
                </p>
                <p className="text-muted-foreground text-sm">
                  {incomeFilter !== "all" && translations.messages.changeFilter}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
