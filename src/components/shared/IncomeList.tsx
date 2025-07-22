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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface IncomeListProps {
  title: string;
  contributions: Contribution[];
  lots: Lot[];
}

type IncomeType = "all" | "maintenance" | "works";

export default function IncomeList({
  title,
  contributions,
  lots,
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

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);
  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with unified filters and actions */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {/* Income Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <Select
                value={incomeFilter}
                onValueChange={(value) =>
                  handleIncomeFilterChange(value as IncomeType)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {translations.filters.allIncome}
                  </SelectItem>
                  <SelectItem value="maintenance">
                    {translations.labels.maintenance}
                  </SelectItem>
                  <SelectItem value="works">
                    {translations.labels.works}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lot Filter */}
            <div className="flex items-center space-x-2">
              <Select
                value={selectedLotId || "__all__"}
                onValueChange={(value) => handleLotFilterChange(value || "")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={translations.filters.allLots} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {translations.filters.allLots}
                  </SelectItem>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      Lote {lot.lotNumber} - {lot.owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Income List Card */}
      <Card>
        <CardContent className="p-6">
          {/* Lot Summary - appears when a lot is selected */}
          {lotSummary && selectedLot && (
            <div className="from-primary/5 to-secondary/5 mb-6 rounded-lg border bg-gradient-to-r p-4">
              <h4 className="mb-3 font-semibold">
                📊 {translations.labels.summary} - Lote {selectedLot.lotNumber}{" "}
                ({selectedLot.owner})
              </h4>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-muted-foreground mb-1">
                      {translations.labels.maintenance}:
                    </p>
                    <p className="text-primary font-semibold">
                      {lotSummary.maintenance.count}{" "}
                      {translations.labels.payments} -{" "}
                      {formatCurrency(lotSummary.maintenance.total)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-muted-foreground mb-1">
                      {translations.labels.works}:
                    </p>
                    <p className="text-secondary-foreground font-semibold">
                      {lotSummary.works.count} {translations.labels.payments} -{" "}
                      {formatCurrency(lotSummary.works.total)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

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
                <div
                  key={contribution.id}
                  className="bg-muted/30 hover:bg-muted/50 group flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          Lote {lot?.lotNumber} - {lot?.owner}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              contribution.type === "maintenance"
                                ? "bg-primary/10 text-primary"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {contribution.type === "maintenance"
                              ? translations.labels.maintenance
                              : translations.labels.works}
                          </span>
                          <p className="text-muted-foreground text-sm">
                            {new Date(contribution.date).toISOString().split('T')[0]}
                          </p>
                        </div>
                        {contribution.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            📝 {contribution.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(contribution.amount)}
                    </span>
                    <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingContribution(contribution)}
                        title={translations.actions.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingContribution(contribution)}
                        className="text-destructive hover:text-destructive"
                        title={translations.actions.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
