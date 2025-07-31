"use client";

import { useMemo } from "react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/Card";
import SummarySection from "@/components/shared/SummarySection";
import ItemCard from "@/components/shared/ItemCard";
export type IncomeType = "all" | "maintenance" | "works" | "others";

interface IncomeListProps {
  contributions: Contribution[];
  lots: Lot[];
  selectedLotId: string;
  incomeFilter: IncomeType;
  isAuthenticated?: boolean;
  onEdit: (contribution: Contribution) => void;
  onDelete: (contribution: Contribution) => void;
  getLotInfo: (lotId: string | number) => Lot | undefined;
}

export default function IncomeList({
  contributions,
  lots,
  selectedLotId,
  incomeFilter,
  isAuthenticated = false,
  onEdit,
  onDelete,
  getLotInfo,
}: IncomeListProps) {
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
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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
    const othersContributions = lotContributions.filter(
      (c) => c.type === "others"
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
      others: {
        count: othersContributions.length,
        total: othersContributions.reduce((sum, c) => sum + c.amount, 0),
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
    const othersContributions = contributionsToSummarize.filter(
      (c) => c.type === "others"
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
      others: {
        count: othersContributions.length,
        total: othersContributions.reduce((sum, c) => sum + c.amount, 0),
      },
    };
  }, [contributions, selectedLotId, incomeFilter]);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);

  return (
    <div>

      {/* Lot Summary - appears when a lot is selected */}
      {lotSummary && selectedLot && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">
            📊 {translations.labels.summary} - Lote{" "}
            {selectedLot.lotNumber} ({selectedLot.owner})
          </h3>
          <SummarySection
            items={[
              {
                type: "maintenance",
                total: lotSummary.maintenance.total,
                show: incomeFilter === "all" || incomeFilter === "maintenance",
              },
              {
                type: "works",
                total: lotSummary.works.total,
                show: incomeFilter === "all" || incomeFilter === "works",
              },
              {
                type: "others",
                total: lotSummary.others.total,
                show: incomeFilter === "all" || incomeFilter === "others",
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
              show:
                incomeFilter === "all" || incomeFilter === "maintenance",
            },
            {
              type: "works",
              total: allLotsSummary.works.total,
              show: incomeFilter === "all" || incomeFilter === "works",
            },
            {
              type: "others",
              total: allLotsSummary.others.total,
              show: incomeFilter === "all" || incomeFilter === "others",
            },
          ]}
        />
      )}

      {/* Income List Card */}
      <Card>
        <CardContent className="p-6">
          {/* Results Header */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredContributions.length}{" "}
              {filteredContributions.length === 1
                ? translations.labels.result
                : translations.labels.results}
            </p>
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
                  receiptFileUrl={contribution.receiptFileUrl}
                  amountColorClass="text-emerald-600"
                  isAuthenticated={isAuthenticated}
                  onEdit={() => onEdit(contribution)}
                  onDelete={() => onDelete(contribution)}
                  editTitle={translations.actions.edit}
                  deleteTitle={translations.actions.delete}
                />
              );
            })}
            {filteredContributions.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-muted-foreground mb-4 text-6xl">
                  📊
                </div>
                <p className="text-muted-foreground mb-2 text-lg">
                  {selectedLotId
                    ? translations.messages.noContributionsForLot
                    : translations.messages.noContributions}
                </p>
                <p className="text-muted-foreground text-sm">
                  {incomeFilter !== "all" &&
                    translations.messages.changeFilter}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}