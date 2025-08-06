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
import LotModal from "@/components/modals/LotModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { deleteLotAction } from "@/lib/actions/lot-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{translations.navigation.lots}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {translations.messages.clickLotForDetail}
            </p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {translations.actions.new} {translations.labels.lot}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-md border-0">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("lot")}
                >
                  <div className="flex items-center gap-1">
                    {translations.labels.lot} / {translations.labels.owner}
                    {getSortIcon("lot")}
                  </div>
                </TableHead>
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-right font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Aportes
                    {getSortIcon("total")}
                  </div>
                </TableHead>
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-right font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("balance")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Saldo Adeudado
                    {getSortIcon("balance")}
                  </div>
                </TableHead>
                {isAuthenticated && (
                  <TableHead
                    className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-right font-semibold tracking-wide transition-colors select-none"
                    onClick={() => handleSort("initialDebt")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.initialDebt}
                      {getSortIcon("initialDebt")}
                    </div>
                  </TableHead>
                )}
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-center font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Estado
                    {getSortIcon("status")}
                  </div>
                </TableHead>
                {isAuthenticated && (
                  <TableHead className="border-border border-b-2 px-6 py-4 text-center font-semibold tracking-wide">
                    {translations.labels.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLots.map((lot, index) => (
                <TableRow
                  key={lot.id}
                  className={`group border-border/50 hover:bg-muted/50 cursor-pointer border-b transition-all duration-200 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                  onClick={() => router.push(`/income/${lot.id}`)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-semibold text-primary flex items-center gap-2">
                          {lot.lotNumber}
                          {lot.isExempt && (
                            <div 
                              className="group relative"
                              title={lot.exemptionReason || translations.labels.exempt}
                            >
                              <Info className="h-4 w-4 text-amber-600" />
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                {lot.exemptionReason || translations.labels.exempt}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {lot.owner}
                        </div>
                      </div>
                      <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="font-bold text-emerald-600">
                      {formatCurrency(lot.totals.total)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span
                      className={`font-bold ${
                        lot.isExempt
                          ? "text-gray-500"
                          : lot.balance?.outstandingBalance && lot.balance.outstandingBalance > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {lot.isExempt
                        ? "-"
                        : lot.balance
                        ? formatCurrency(lot.balance.outstandingBalance)
                        : formatCurrency(0)}
                    </span>
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-700">
                        {formatCurrency(lot.initialWorksDebt || 0)}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-4 text-center">
                    {lot.balance ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(lot.balance.status)}`}
                      >
                        {getStatusText(lot.balance.status)}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                        {lot.isExempt ? translations.labels.notApplicable : translations.labels.noData}
                      </span>
                    )}
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingLot(lot);
                          }}
                          className="hover:bg-muted h-8 w-8 p-0"
                          title={`${translations.actions.edit} ${translations.labels.lot.toLowerCase()}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingLot(lot);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                          title={`${translations.actions.delete} ${translations.labels.lot.toLowerCase()}`}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedLots.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAuthenticated ? 6 : 4}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
                        <span className="text-muted-foreground text-2xl">
                          🏠
                        </span>
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {translations.messages.noLots}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {sortedLots.length > 0 && (
                <>
                  {/* Separator row */}
                  <TableRow>
                    <TableCell
                      colSpan={isAuthenticated ? 6 : 4}
                      className="border-muted border-t-2 p-0"
                    />
                  </TableRow>
                  {/* Totals row */}
                  <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4 font-semibold">
                      {translations.labels.total || "TOTAL"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(overallTotals.total)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-gray-600">
                        {formatCurrency(
                          lotBalances.reduce(
                            (sum, balance) => sum + balance.outstandingBalance,
                            0
                          )
                        )}
                      </div>
                    </TableCell>
                    {isAuthenticated && (
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-bold text-gray-600">
                          {formatCurrency(
                            lotsWithSummary.reduce(
                              (sum, lot) => sum + (lot.initialWorksDebt || 0),
                              0
                            )
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {
                          lotBalances.filter((b) => b.status === "overdue")
                            .length
                        }{" "}
{translations.labels.overdueLots}
                      </span>
                    </TableCell>
                    {isAuthenticated && <TableCell />}
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create/Edit Modal */}
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

      {/* Delete Confirmation Modal */}
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
