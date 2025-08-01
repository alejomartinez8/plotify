"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import TypeBadge from "@/components/shared/TypeBadge";
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
  totals: {
    maintenance: number;
    works: number;
    others: number;
    total: number;
  };
}

interface LotsTableProps {
  lots: Lot[];
  contributions: Contribution[];
  isAuthenticated?: boolean;
}

type SortField = 'lot' | 'maintenance' | 'works' | 'others' | 'total';
type SortDirection = 'asc' | 'desc';

export default function LotsTable({
  lots,
  contributions,
  isAuthenticated = false,
}: LotsTableProps) {
  const [sortField, setSortField] = useState<SortField>('lot');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [deletingLot, setDeletingLot] = useState<Lot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Calculate lot summaries
  const lotsWithSummary = useMemo((): LotWithSummary[] => {
    return lots.map(lot => {
      const lotContributions = contributions.filter(contrib => contrib.lotId === lot.id);
      
      const maintenanceTotal = lotContributions
        .filter(c => c.type === 'maintenance')
        .reduce((sum, c) => sum + c.amount, 0);
      
      const worksTotal = lotContributions
        .filter(c => c.type === 'works')
        .reduce((sum, c) => sum + c.amount, 0);
      
      const othersTotal = lotContributions
        .filter(c => c.type === 'others')
        .reduce((sum, c) => sum + c.amount, 0);

      return {
        ...lot,
        contributions: lotContributions,
        totals: {
          maintenance: maintenanceTotal,
          works: worksTotal,
          others: othersTotal,
          total: maintenanceTotal + worksTotal + othersTotal,
        },
      };
    });
  }, [lots, contributions]);

  // Sort lots
  const sortedLots = useMemo(() => {
    return [...lotsWithSummary].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'lot':
          // Sort by lot number primarily, then by owner name
          const aLot = `${a.lotNumber} - ${a.owner}`;
          const bLot = `${b.lotNumber} - ${b.owner}`;
          aValue = aLot;
          bValue = bLot;
          break;
        case 'maintenance':
          aValue = a.totals.maintenance;
          bValue = b.totals.maintenance;
          break;
        case 'works':
          aValue = a.totals.works;
          bValue = b.totals.works;
          break;
        case 'others':
          aValue = a.totals.others;
          bValue = b.totals.others;
          break;
        case 'total':
          aValue = a.totals.total;
          bValue = b.totals.total;
          break;
        default:
          aValue = a.lotNumber;
          bValue = b.lotNumber;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [lotsWithSummary, sortField, sortDirection]);

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    return lotsWithSummary.reduce(
      (acc, lot) => ({
        maintenance: acc.maintenance + lot.totals.maintenance,
        works: acc.works + lot.totals.works,
        others: acc.others + lot.totals.others,
        total: acc.total + lot.totals.total,
      }),
      { maintenance: 0, works: 0, others: 0, total: 0 }
    );
  }, [lotsWithSummary]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
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
            <p className="text-sm text-muted-foreground mt-1">
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
                  className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                  onClick={() => handleSort('lot')}
                >
                  <div className="flex items-center gap-1">
                    {translations.labels.lot} / {translations.labels.owner}
                    {getSortIcon('lot')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                  onClick={() => handleSort('maintenance')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <TypeBadge type="maintenance" />
                    {getSortIcon('maintenance')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                  onClick={() => handleSort('works')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <TypeBadge type="works" />
                    {getSortIcon('works')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                  onClick={() => handleSort('others')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <TypeBadge type="others" />
                    {getSortIcon('others')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end gap-1">
                    {translations.labels.total}
                    {getSortIcon('total')}
                  </div>
                </TableHead>
                {isAuthenticated && (
                  <TableHead className="px-6 py-4 text-center font-semibold tracking-wide border-b-2 border-border">
                    {translations.labels.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLots.map((lot, index) => (
                <TableRow
                  key={lot.id}
                  className={`group transition-all duration-200 border-b border-border/50 hover:bg-muted/50 cursor-pointer ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <TableCell className="px-6 py-4">
                    <Link 
                      href={`/lots/${lot.id}`}
                      className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors group flex items-center gap-2"
                    >
                      <div>
                        <div className="font-semibold">{lot.lotNumber}</div>
                        <div className="text-sm text-muted-foreground">{lot.owner}</div>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link 
                      href={`/lots/${lot.id}`}
                      className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      {formatCurrency(lot.totals.maintenance)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link 
                      href={`/lots/${lot.id}`}
                      className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      {formatCurrency(lot.totals.works)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link 
                      href={`/lots/${lot.id}`}
                      className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      {formatCurrency(lot.totals.others)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link 
                      href={`/lots/${lot.id}`}
                      className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      {formatCurrency(lot.totals.total)}
                    </Link>
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingLot(lot);
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          title={`${translations.actions.edit} ${translations.labels.lot.toLowerCase()}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setDeletingLot(lot);
                          }}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                  <TableCell colSpan={isAuthenticated ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-muted-foreground">🏠</span>
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
                    <TableCell colSpan={isAuthenticated ? 6 : 5} className="border-t-2 border-muted p-0" />
                  </TableRow>
                  {/* Totals row */}
                  <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4 font-semibold">
                      {translations.labels.total || 'TOTAL'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(overallTotals.maintenance)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(overallTotals.works)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(overallTotals.others)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency(overallTotals.total)}
                      </div>
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