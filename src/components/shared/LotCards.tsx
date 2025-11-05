"use client";

import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Info, Eye, Mail } from "lucide-react";
import Link from "next/link";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { getStatusColor, formatCurrency } from "@/lib/utils";
import { SimpleLotBalance } from "@/types/quotas.types";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import LotModal from "@/components/modals/LotModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { deleteLotAction } from "@/lib/actions/lot-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface LotWithSummary extends Lot {
  contributions: Contribution[];
  balance: SimpleLotBalance | null;
  totals: {
    maintenance: number;
    works: number;
    others: number;
    total: number;
  };
}

interface LotCardsProps {
  lots: Lot[];
  contributions: Contribution[];
  lotBalances: SimpleLotBalance[];
  isAdmin?: boolean;
}

type SortField = "lot" | "total" | "balance" | "status" | "initialDebt";
type SortDirection = "asc" | "desc";

export default function LotCards({
  lots,
  contributions,
  lotBalances,
  isAdmin = false,
}: LotCardsProps) {
  const [sortField, setSortField] = useState<SortField>("lot");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [deletingLot, setDeletingLot] = useState<Lot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Calculate lot summaries
  const lotsWithSummary = useMemo((): LotWithSummary[] => {
    return lots.map((lot) => {
      const lotContributions = contributions.filter(
        (contrib) => contrib.lotId === lot.id
      );
      const balance = lotBalances.find((b) => b.lotId === lot.id) || null;

      // Calculate totals by type
      const maintenanceTotal = lotContributions
        .filter((c) => c.type === "maintenance")
        .reduce((sum, c) => sum + c.amount, 0);

      const worksTotal = lotContributions
        .filter((c) => c.type === "works")
        .reduce((sum, c) => sum + c.amount, 0);

      const othersTotal = lotContributions
        .filter((c) => c.type === "others")
        .reduce((sum, c) => sum + c.amount, 0);

      const totalContributions = maintenanceTotal + worksTotal + othersTotal;

      return {
        ...lot,
        contributions: lotContributions,
        balance,
        totals: {
          maintenance: maintenanceTotal,
          works: worksTotal,
          others: othersTotal,
          total: totalContributions,
        },
      };
    });
  }, [lots, contributions, lotBalances]);

  // Sort lots
  const sortedLots = useMemo(() => {
    return [...lotsWithSummary].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "lot":
          // Sort by lot number primarily, then by owner name
          const aLot = `${a.lotNumber} - ${a.owner}`;
          const bLot = `${b.lotNumber} - ${b.owner}`;
          aValue = aLot;
          bValue = bLot;
          break;
        case "total":
          aValue = a.totals.total;
          bValue = b.totals.total;
          break;
        case "balance":
          aValue = a.balance?.outstandingBalance || 0;
          bValue = b.balance?.outstandingBalance || 0;
          break;
        case "status":
          aValue = a.balance?.status || "current";
          bValue = b.balance?.status || "current";
          break;
        case "initialDebt":
          aValue = a.initialWorksDebt || 0;
          bValue = b.initialWorksDebt || 0;
          break;
        default:
          aValue = a.lotNumber;
          bValue = b.lotNumber;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, undefined, {
          numeric: true,
        });
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [lotsWithSummary, sortField, sortDirection]);

  const handleDeleteConfirm = () => {
    if (!deletingLot) return;

    startTransition(async () => {
      const result = await deleteLotAction(deletingLot.id);
      if (result.success) {
        router.refresh();
      }
      setDeletingLot(null);
    });
  };

  const handleLotSuccess = () => {
    setEditingLot(null);
    setIsCreating(false);
    router.refresh();
  };

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <CardTitle className="text-lg sm:text-xl">
              {translations.navigation.lots}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {translations.messages.clickLotForDetail}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="w-full">
              <span className="text-muted-foreground mb-2 block text-xs font-medium sm:text-sm">
                {translations.labels.sortBy}:
              </span>
              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as [
                    SortField,
                    SortDirection,
                  ];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger className="w-full text-xs sm:w-64 sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lot-asc">
                    {translations.labels.lot} A-Z
                  </SelectItem>
                  <SelectItem value="lot-desc">
                    {translations.labels.lot} Z-A
                  </SelectItem>
                  <SelectItem value="total-desc">
                    {translations.labels.contributions} ↓
                  </SelectItem>
                  <SelectItem value="total-asc">
                    {translations.labels.contributions} ↑
                  </SelectItem>
                  <SelectItem value="balance-desc">
                    {translations.labels.outstandingBalance} ↓
                  </SelectItem>
                  <SelectItem value="balance-asc">
                    {translations.labels.outstandingBalance} ↑
                  </SelectItem>
                  <SelectItem value="status-asc">
                    {translations.labels.status} A-Z
                  </SelectItem>
                  <SelectItem value="status-desc">
                    {translations.labels.status} Z-A
                  </SelectItem>
                  {isAdmin && (
                    <SelectItem value="initialDebt-desc">
                      {translations.labels.initialDebt} ↓
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <Button
                onClick={() => setIsCreating(true)}
                size="sm"
                className="w-full text-xs sm:w-auto sm:text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                {translations.actions.new} {translations.labels.lot}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sortedLots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
              <span className="text-muted-foreground text-2xl">🏠</span>
            </div>
            <p className="text-muted-foreground mt-4 font-medium">
              {translations.messages.noLots}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {sortedLots.map((lot) => (
                <Card
                  key={lot.id}
                  className="hover:bg-muted/30 relative w-full overflow-hidden border transition-all duration-200 hover:shadow-md"
                >
                  <CardContent className="w-full p-0">
                    {/* Unified Responsive Layout */}
                    <div className="relative w-full">
                      <div className="flex min-h-[60px] w-full sm:min-h-[70px]">
                        {/* Main Content Section */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden px-4 py-2 sm:px-6 sm:py-3">
                          <div className="mb-1 flex min-w-0 items-center gap-1 sm:gap-2">
                            <span className="text-primary flex-shrink-0 text-sm font-bold sm:text-base">
                              {lot.lotNumber}
                            </span>
                            {lot.isExempt && (
                              <div className="group relative">
                                <Info className="h-3 w-3 flex-shrink-0 text-amber-600 sm:h-3.5 sm:w-3.5" />
                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
                                  {lot.exemptionReason ||
                                    translations.labels.exempt}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            )}
                            {lot.balance ? (
                              <span
                                className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium sm:px-2 sm:font-semibold ${getStatusColor(lot.balance.status)}`}
                              >
                                {lot.balance.status === "current"
                                  ? translations.labels.current
                                  : translations.labels.overdue}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800 sm:px-2 sm:font-semibold">
                                {lot.isExempt
                                  ? translations.labels.notApplicable
                                  : translations.labels.noData}
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground truncate text-xs sm:text-sm">
                            {lot.owner}
                          </div>
                          {isAdmin && lot.ownerEmail && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{lot.ownerEmail}</span>
                            </div>
                          )}
                        </div>

                        {/* Values Section */}
                        <div className="min-w-[140px] flex-shrink-0 px-3 py-2 text-right sm:min-w-[180px] sm:px-5 sm:py-3">
                          {/* Breakdown by type */}
                          <div className="mb-1.5 space-y-0.5">
                            {/* Maintenance */}
                            {lot.totals.maintenance > 0 && (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                                  {translations.labels.maintenance}:
                                </span>
                                <span className="text-[11px] text-emerald-600 sm:text-sm">
                                  {formatCurrency(lot.totals.maintenance)}
                                </span>
                              </div>
                            )}

                            {/* Works */}
                            {lot.totals.works > 0 && (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                                  {translations.labels.works}:
                                </span>
                                <span className="text-[11px] text-emerald-600 sm:text-sm">
                                  {formatCurrency(lot.totals.works)}
                                </span>
                              </div>
                            )}

                            {/* Others (only show if > 0) */}
                            {lot.totals.others > 0 && (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                                  {translations.labels.others}:
                                </span>
                                <span className="text-[11px] text-emerald-600 sm:text-sm">
                                  {formatCurrency(lot.totals.others)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Total with divider */}
                          {lot.totals.total > 0 && (
                            <>
                              <div className="border-muted-foreground/20 my-1 border-t"></div>
                              <div className="mb-1 flex items-center justify-end gap-1">
                                <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                                  {translations.labels.totalContributions}:
                                </span>
                                <span className="text-xs font-bold text-emerald-600 sm:text-sm">
                                  {formatCurrency(lot.totals.total)}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Initial Debt (only if > 0) */}
                          {(lot.initialWorksDebt || 0) > 0 && (
                            <div className="mb-1 flex items-center justify-end gap-1">
                              <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                                {translations.labels.initialDebt}:
                              </span>
                              <span className="text-[11px] font-semibold text-amber-600 sm:text-sm">
                                {formatCurrency(lot.initialWorksDebt || 0)}
                              </span>
                            </div>
                          )}

                          {/* Outstanding balance */}
                          <div className="mt-1 flex items-center justify-end gap-1">
                            <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                              {translations.labels.totalOutstandingDebt}:
                            </span>
                            <span
                              className={`text-xs font-medium sm:text-sm sm:font-semibold ${
                                lot.isExempt
                                  ? "text-gray-500"
                                  : lot.balance?.outstandingBalance &&
                                      lot.balance.outstandingBalance > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                              }`}
                            >
                              {lot.isExempt
                                ? "-"
                                : lot.balance
                                  ? formatCurrency(
                                      lot.balance.outstandingBalance
                                    )
                                  : formatCurrency(0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/20 border-muted/30 flex items-center justify-between border-t px-2 py-1 sm:px-4 sm:py-1.5">
                        <Link href={`/income/${lot.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-muted h-7 gap-1 px-2 text-xs sm:h-8 sm:gap-1.5 sm:px-3 sm:text-sm"
                            title={translations.actions.viewDetail}
                          >
                            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>{translations.actions.viewDetail}</span>
                          </Button>
                        </Link>

                        {isAdmin && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingLot(lot);
                              }}
                              className="hover:bg-muted h-6 w-6 p-0 sm:h-7 sm:w-7"
                              title={`${translations.actions.edit} ${translations.labels.lot.toLowerCase()}`}
                            >
                              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingLot(lot);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0 sm:h-7 sm:w-7"
                              title={`${translations.actions.delete} ${translations.labels.lot.toLowerCase()}`}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {(isCreating || editingLot) && isAdmin && (
        <LotModal
          lot={editingLot}
          onClose={() => {
            setIsCreating(false);
            setEditingLot(null);
          }}
          onSuccess={handleLotSuccess}
        />
      )}

      {isAdmin && (
        <ConfirmationModal
          isOpen={!!deletingLot}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteLot}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingLot(null)}
          variant="danger"
        />
      )}
    </Card>
  );
}
