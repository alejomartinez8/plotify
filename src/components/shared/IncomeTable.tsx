"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { IncomeType } from "@/components/shared/IncomeList";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface LotSummaryData {
  lot: Lot;
  maintenanceTotal: number;
  worksTotal: number;
  othersTotal: number;
  total: number;
}

interface IncomeTableProps {
  lots: Lot[];
  contributions: Contribution[];
  incomeFilter: IncomeType;
  onLotClick?: (lotId: string) => void;
}

type SortField = 'lotNumber' | 'owner' | 'maintenanceTotal' | 'worksTotal' | 'othersTotal' | 'total';
type SortDirection = 'asc' | 'desc';

export default function IncomeTable({
  lots,
  contributions,
  incomeFilter,
  onLotClick,
}: IncomeTableProps) {
  const [sortField, setSortField] = useState<SortField>('lotNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filter contributions based on income filter
  const filteredContributions = useMemo(() => {
    if (incomeFilter === "all") {
      return contributions;
    }
    return contributions.filter((c) => c.type === incomeFilter);
  }, [contributions, incomeFilter]);

  // Calculate lot summary data for the table
  const lotSummaryData = useMemo(() => {
    const data: LotSummaryData[] = lots.map((lot) => {
      const lotContributions = filteredContributions.filter((c) => c.lotId === lot.id);
      const maintenanceTotal = lotContributions
        .filter((c) => c.type === 'maintenance')
        .reduce((sum, c) => sum + c.amount, 0);
      const worksTotal = lotContributions
        .filter((c) => c.type === 'works')
        .reduce((sum, c) => sum + c.amount, 0);
      const othersTotal = lotContributions
        .filter((c) => c.type === 'others')
        .reduce((sum, c) => sum + c.amount, 0);

      return {
        lot,
        maintenanceTotal,
        worksTotal,
        othersTotal,
        total: maintenanceTotal + worksTotal + othersTotal,
      };
    });

    // Sort data
    return data.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'lotNumber':
          aValue = a.lot.lotNumber;
          bValue = b.lot.lotNumber;
          break;
        case 'owner':
          aValue = a.lot.owner;
          bValue = b.lot.owner;
          break;
        case 'maintenanceTotal':
          aValue = a.maintenanceTotal;
          bValue = b.maintenanceTotal;
          break;
        case 'worksTotal':
          aValue = a.worksTotal;
          bValue = b.worksTotal;
          break;
        case 'othersTotal':
          aValue = a.othersTotal;
          bValue = b.othersTotal;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        default:
          aValue = a.lot.lotNumber;
          bValue = b.lot.lotNumber;
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
  }, [lots, filteredContributions, sortField, sortDirection]);

  // Calculate totals for the table footer
  const tableTotals = useMemo(() => {
    const maintenanceTotal = lotSummaryData.reduce((sum, data) => sum + data.maintenanceTotal, 0);
    const worksTotal = lotSummaryData.reduce((sum, data) => sum + data.worksTotal, 0);
    const othersTotal = lotSummaryData.reduce((sum, data) => sum + data.othersTotal, 0);
    
    return {
      maintenanceTotal,
      worksTotal,
      othersTotal,
      total: maintenanceTotal + worksTotal + othersTotal,
    };
  }, [lotSummaryData]);

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

  const handleRowClick = (lotId: string) => {
    if (onLotClick) {
      onLotClick(lotId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lot Summary Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-md border-0">
            <Table className="border-separate border-spacing-0">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('lotNumber')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.lot} / {translations.labels.owner}
                      {getSortIcon('lotNumber')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('maintenanceTotal')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.maintenance}
                      {getSortIcon('maintenanceTotal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('worksTotal')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.works}
                      {getSortIcon('worksTotal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('othersTotal')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.others}
                      {getSortIcon('othersTotal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-right font-bold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.total}
                      {getSortIcon('total')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotSummaryData.map((data, index) => (
                  <TableRow
                    key={data.lot.id}
                    className={`group transition-all duration-200 border-b border-border/50 hover:bg-muted/50 ${
                      onLotClick ? 'cursor-pointer hover:shadow-sm' : ''
                    } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                    onClick={() => handleRowClick(data.lot.id)}
                  >
                    <TableCell className="px-6 py-4 max-w-xs">
                      <div className="font-medium truncate" title={`Lote ${data.lot.lotNumber} - ${data.lot.owner}`}>
                        Lote {data.lot.lotNumber} - {data.lot.owner}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className={`font-medium ${data.maintenanceTotal > 0 ? 'text-slate-700' : 'text-muted-foreground'}`}>
                        {data.maintenanceTotal > 0 ? formatCurrency(data.maintenanceTotal) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className={`font-medium ${data.worksTotal > 0 ? 'text-slate-600' : 'text-muted-foreground'}`}>
                        {data.worksTotal > 0 ? formatCurrency(data.worksTotal) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className={`font-medium ${data.othersTotal > 0 ? 'text-slate-600' : 'text-muted-foreground'}`}>
                        {data.othersTotal > 0 ? formatCurrency(data.othersTotal) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className={`font-semibold ${data.total > 0 ? 'text-slate-800' : 'text-muted-foreground'}`}>
                        {data.total > 0 ? formatCurrency(data.total) : '—'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {lotSummaryData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-muted-foreground">📋</span>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {translations.messages.noLots || 'No hay lotes disponibles'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {lotSummaryData.length > 0 && (
                  <>
                    {/* Separator row */}
                    <TableRow>
                      <TableCell colSpan={5} className="border-t-2 border-muted p-0" />
                    </TableRow>
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell className="px-6 py-4 font-semibold">
                        {translations.labels.total || 'TOTAL GENERAL'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className={`font-semibold ${tableTotals.maintenanceTotal > 0 ? 'text-slate-700' : 'text-muted-foreground'}`}>
                          {tableTotals.maintenanceTotal > 0 ? formatCurrency(tableTotals.maintenanceTotal) : '—'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className={`font-semibold ${tableTotals.worksTotal > 0 ? 'text-slate-600' : 'text-muted-foreground'}`}>
                          {tableTotals.worksTotal > 0 ? formatCurrency(tableTotals.worksTotal) : '—'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className={`font-semibold ${tableTotals.othersTotal > 0 ? 'text-slate-600' : 'text-muted-foreground'}`}>
                          {tableTotals.othersTotal > 0 ? formatCurrency(tableTotals.othersTotal) : '—'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className={`font-bold ${tableTotals.total > 0 ? 'text-slate-800' : 'text-muted-foreground'}`}>
                          {tableTotals.total > 0 ? formatCurrency(tableTotals.total) : '—'}
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}