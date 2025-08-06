"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Info,
  User,
} from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import {
  SimpleLotBalance,
  getStatusColor,
  getStatusText,
} from "@/lib/services/simple-quota-service";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import LotModal from "@/components/modals/LotModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { deleteLotAction } from "@/lib/actions/lot-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface LotWithSummary extends Lot {
  contributions: Contribution[];
  balance: SimpleLotBalance | null;
  totals: {
    total: number;
  };
}

interface LotsTableProps {
  lots: Lot[];
  contributions: Contribution[];
  lotBalances: SimpleLotBalance[];
  isAuthenticated?: boolean;
}

type SortField = "lot" | "total" | "balance" | "status" | "initialDebt";
type SortDirection = "asc" | "desc";

export default function LotsTable({
  lots,
  contributions,
  lotBalances,
  isAuthenticated = false,
}: LotsTableProps) {
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

      const totalContributions = lotContributions.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      return {
        ...lot,
        contributions: lotContributions,
        balance,
        totals: {
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

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    return lotsWithSummary.reduce(
      (acc, lot) => ({
        total: acc.total + lot.totals.total,
      }),
      { total: 0 }
    );
  }, [lotsWithSummary]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

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
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{translations.navigation.lots}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {translations.messages.clickLotForDetail}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 min-w-[180px]">
              <span className="text-sm font-medium whitespace-nowrap">
                {translations.labels.sortBy}:
              </span>
              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [SortField, SortDirection];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lot-asc">{translations.labels.lot} A-Z</SelectItem>
                  <SelectItem value="lot-desc">{translations.labels.lot} Z-A</SelectItem>
                  <SelectItem value="total-desc">{translations.labels.contributions} ↓</SelectItem>
                  <SelectItem value="total-asc">{translations.labels.contributions} ↑</SelectItem>
                  <SelectItem value="balance-desc">{translations.labels.outstandingBalance} ↓</SelectItem>
                  <SelectItem value="balance-asc">{translations.labels.outstandingBalance} ↑</SelectItem>
                  <SelectItem value="status-asc">{translations.labels.status} A-Z</SelectItem>
                  <SelectItem value="status-desc">{translations.labels.status} Z-A</SelectItem>
                  {isAuthenticated && (
                    <SelectItem value="initialDebt-desc">{translations.labels.initialDebt} ↓</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {isAuthenticated && (
              <Button onClick={() => setIsCreating(true)} size="sm" className="whitespace-nowrap">
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
            <p className="text-muted-foreground font-medium mt-4">
              {translations.messages.noLots}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {sortedLots.map((lot) => (
                <Card 
                  key={lot.id}
                  className="border hover:bg-muted/30 cursor-pointer transition-all duration-200 hover:shadow-md relative"
                  onClick={() => router.push(`/income/${lot.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="md:hidden flex flex-col">
                      <div className="flex h-16">
                        <div className="bg-white flex items-center justify-center px-2">
                          <div className="border border-border/50 flex h-8 w-8 items-center justify-center rounded-full">
                            <User className="text-primary h-4 w-4" />
                          </div>
                        </div>

                        <div className="flex-1 px-3 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-primary">{lot.lotNumber}</span>
                            {lot.isExempt && (
                              <div className="relative group">
                                <Info className="h-3.5 w-3.5 text-amber-600" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
                                  {lot.exemptionReason || translations.labels.exempt}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            )}
                            {lot.balance ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(lot.balance.status)}`}
                              >
                                {getStatusText(lot.balance.status)}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                                {lot.isExempt ? translations.labels.notApplicable : translations.labels.noData}
                              </span>
                            )}
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                          </div>
                          <div className="text-muted-foreground text-sm truncate">
                            {lot.owner}
                          </div>
                          {isAuthenticated && (lot.initialWorksDebt || 0) > 0 && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {translations.labels.initialDebt}: {formatCurrency(lot.initialWorksDebt || 0)}
                            </div>
                          )}
                        </div>

                        <div className="bg-white px-3 min-w-[110px] flex flex-col justify-center">
                          <div className="text-right">
                            <div className="font-bold text-emerald-600">
                              {formatCurrency(lot.totals.total)}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {translations.labels.contributions}
                            </div>
                          </div>
                          <div className="text-right mt-1">
                            <div className={`font-semibold text-sm ${
                              lot.isExempt
                                ? "text-gray-500"
                                : lot.balance?.outstandingBalance && lot.balance.outstandingBalance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}>
                              {lot.isExempt
                                ? "-"
                                : lot.balance
                                ? formatCurrency(lot.balance.outstandingBalance)
                                : formatCurrency(0)}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {translations.labels.outstandingBalance}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isAuthenticated && (
                        <div className="flex items-center justify-end px-3 py-1.5 bg-muted/20 border-t border-muted/30">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingLot(lot);
                              }}
                              className="hover:bg-muted h-7 w-7 p-0"
                              title={`${translations.actions.edit} ${translations.labels.lot.toLowerCase()}`}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingLot(lot);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive h-7 w-7 p-0"
                              title={`${translations.actions.delete} ${translations.labels.lot.toLowerCase()}`}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden md:block relative">
                      <div className="flex h-12">
                        <div className="bg-white flex items-center justify-center px-2">
                          <div className="border border-border/50 flex h-7 w-7 items-center justify-center rounded-full">
                            <User className="text-primary h-3.5 w-3.5" />
                          </div>
                        </div>

                        <div className="flex-1 px-3 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-primary">{lot.lotNumber}</span>
                            {lot.isExempt && (
                              <div className="relative group">
                                <Info className="h-3.5 w-3.5 text-amber-600" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
                                  {lot.exemptionReason || translations.labels.exempt}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            )}
                            {lot.balance ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(lot.balance.status)}`}
                              >
                                {getStatusText(lot.balance.status)}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                                {lot.isExempt ? translations.labels.notApplicable : translations.labels.noData}
                              </span>
                            )}
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                          </div>
                          <div className="text-muted-foreground text-sm truncate">
                            {lot.owner}
                            {isAuthenticated && (lot.initialWorksDebt || 0) > 0 && (
                              <span className="ml-2 text-xs">
                                ({translations.labels.initialDebt}: {formatCurrency(lot.initialWorksDebt || 0)})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-white px-3 min-w-[130px] flex flex-col justify-center">
                          <div className="text-right">
                            <div className="font-bold text-emerald-600">
                              {formatCurrency(lot.totals.total)}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {translations.labels.contributions}
                            </div>
                          </div>
                          <div className="text-right mt-0.5">
                            <div className={`font-semibold text-sm ${
                              lot.isExempt
                                ? "text-gray-500"
                                : lot.balance?.outstandingBalance && lot.balance.outstandingBalance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}>
                              {lot.isExempt
                                ? "-"
                                : lot.balance
                                ? formatCurrency(lot.balance.outstandingBalance)
                                : formatCurrency(0)}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {translations.labels.outstandingBalance}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute right-1 top-1 flex items-center gap-1">
                        {isAuthenticated && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingLot(lot);
                              }}
                              className="hover:bg-muted h-6 w-6 p-0 bg-white/80"
                              title={`${translations.actions.edit} ${translations.labels.lot.toLowerCase()}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingLot(lot);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0 bg-white/80"
                              title={`${translations.actions.delete} ${translations.labels.lot.toLowerCase()}`}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
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

      {(isCreating || editingLot) && isAuthenticated && (
        <LotModal
          lot={editingLot}
          onClose={() => {
            setIsCreating(false);
            setEditingLot(null);
          }}
          onSuccess={handleLotSuccess}
        />
      )}

      {isAuthenticated && (
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
