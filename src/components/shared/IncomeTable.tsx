"use client";

import { useMemo } from "react";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LotSummaryTable from "./LotSummaryTable";
import SummarySection from "./SummarySection";

interface IncomeTableProps {
  lots: Lot[];
  contributions: Contribution[];
  incomeFilter: "all" | "maintenance" | "works";
  onLotClick?: (lotId: string) => void;
}

export default function IncomeTable({
  lots,
  contributions,
  incomeFilter,
  onLotClick,
}: IncomeTableProps) {
  
  // Filter contributions based on income filter
  const filteredContributions = useMemo(() => {
    if (incomeFilter === "all") {
      return contributions;
    }
    return contributions.filter((c) => c.type === incomeFilter);
  }, [contributions, incomeFilter]);

  // Calculate summary data for overview cards
  const summaryData = useMemo(() => {
    const maintenanceContributions = filteredContributions.filter(
      (c) => c.type === "maintenance"
    );
    const worksContributions = filteredContributions.filter(
      (c) => c.type === "works"
    );

    const activeLots = new Set(filteredContributions.map(c => c.lotId)).size;

    return {
      maintenance: {
        count: maintenanceContributions.length,
        total: maintenanceContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      works: {
        count: worksContributions.length,
        total: worksContributions.reduce((sum, c) => sum + c.amount, 0),
      },
      activeLots,
    };
  }, [filteredContributions]);

  return (
    <div className="space-y-6">
      {/* Overview Summary Cards */}
      <SummarySection
        items={[
          {
            type: "maintenance",
            total: summaryData.maintenance.total,
            show: incomeFilter === "all" || incomeFilter === "maintenance",
          },
          {
            type: "works",
            total: summaryData.works.total,
            show: incomeFilter === "all" || incomeFilter === "works",
          },
        ]}
      />

      {/* Lot Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            📋 {translations.labels.lotDetail}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LotSummaryTable
            lots={lots}
            contributions={filteredContributions}
            onLotClick={onLotClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}