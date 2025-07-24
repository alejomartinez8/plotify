"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LotSummaryData {
  lot: Lot;
  maintenanceTotal: number;
  worksTotal: number;
  total: number;
}

interface IncomeTableProps {
  lots: Lot[];
  contributions: Contribution[];
  incomeFilter: "all" | "maintenance" | "works";
  onLotClick?: (lotId: string) => void;
}

type SortField = 'lotNumber' | 'owner' | 'maintenanceTotal' | 'worksTotal' | 'total';
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

      return {
        lot,
        maintenanceTotal,
        worksTotal,
        total: maintenanceTotal + worksTotal,
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
    
    return {
      maintenanceTotal,
      worksTotal,
      total: maintenanceTotal + worksTotal,
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            📋 {translations.labels.lotDetail}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('lotNumber')}
                  >
                    <div className="flex items-center">
                      {translations.labels.lot}
                      {getSortIcon('lotNumber')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('owner')}
                  >
                    <div className="flex items-center">
                      {translations.labels.owner}
                      {getSortIcon('owner')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50 text-right"
                    onClick={() => handleSort('maintenanceTotal')}
                  >
                    <div className="flex items-center justify-end">
                      {translations.labels.maintenance}
                      {getSortIcon('maintenanceTotal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50 text-right"
                    onClick={() => handleSort('worksTotal')}
                  >
                    <div className="flex items-center justify-end">
                      {translations.labels.works}
                      {getSortIcon('worksTotal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50 text-right"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end font-semibold">
                      {translations.labels.total}
                      {getSortIcon('total')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotSummaryData.map((data) => (
                  <TableRow
                    key={data.lot.id}
                    className={`${
                      onLotClick ? 'cursor-pointer hover:bg-muted/30' : ''
                    } transition-colors`}
                    onClick={() => handleRowClick(data.lot.id)}
                  >
                    <TableCell className="font-medium">
                      {data.lot.lotNumber}
                    </TableCell>
                    <TableCell className="max-w-0 truncate">
                      {data.lot.owner}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {data.maintenanceTotal > 0 ? formatCurrency(data.maintenanceTotal) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-amber-600">
                      {data.worksTotal > 0 ? formatCurrency(data.worksTotal) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {data.total > 0 ? formatCurrency(data.total) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {lotSummaryData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {translations.messages.noLots || 'No hay lotes disponibles'}
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
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell className="font-bold">
                        {translations.labels.total || 'TOTAL GENERAL'}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold text-blue-700">
                        {tableTotals.maintenanceTotal > 0 ? formatCurrency(tableTotals.maintenanceTotal) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-amber-700">
                        {tableTotals.worksTotal > 0 ? formatCurrency(tableTotals.worksTotal) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-700 text-lg">
                        {tableTotals.total > 0 ? formatCurrency(tableTotals.total) : '-'}
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