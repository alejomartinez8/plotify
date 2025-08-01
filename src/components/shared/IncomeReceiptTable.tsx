"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Edit, Trash2, FileText } from "lucide-react";
import { Contribution } from "@/types/contributions.types";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import TypeBadge from "@/components/shared/TypeBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export type IncomeType = "all" | "maintenance" | "works" | "others";

interface IncomeReceiptTableProps {
  contributions: Contribution[];
  lots: Lot[];
  incomeFilter: IncomeType;
  isAuthenticated?: boolean;
  onEdit?: (contribution: Contribution) => void;
  onDelete?: (contribution: Contribution) => void;
}

type SortField = 'date' | 'lotId' | 'description' | 'type' | 'amount' | 'receiptNumber';
type SortDirection = 'asc' | 'desc';

export default function IncomeReceiptTable({
  contributions,
  lots,
  incomeFilter,
  isAuthenticated = false,
  onEdit,
  onDelete,
}: IncomeReceiptTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Helper function to get lot info
  const getLotInfo = useMemo(() => {
    return (lotId: string | number): Lot | undefined => {
      return lots.find((lot) => lot.id === lotId.toString());
    };
  }, [lots]);

  // Filter contributions based on filters
  const filteredContributions = useMemo(() => {
    let filtered = contributions;
    
    // Filter by income type
    if (incomeFilter !== "all") {
      filtered = filtered.filter((contribution) => contribution.type === incomeFilter);
    }
    
    return filtered;
  }, [contributions, incomeFilter]);

  // Sort contributions
  const sortedContributions = useMemo(() => {
    return [...filteredContributions].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'lotId':
          const lotA = getLotInfo(a.lotId);
          const lotB = getLotInfo(b.lotId);
          aValue = lotA ? `${lotA.lotNumber} - ${lotA.owner}` : a.lotId.toString();
          bValue = lotB ? `${lotB.lotNumber} - ${lotB.owner}` : b.lotId.toString();
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'receiptNumber':
          aValue = a.receiptNumber || '';
          bValue = b.receiptNumber || '';
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
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
  }, [filteredContributions, sortField, sortDirection, getLotInfo]);

  // Calculate totals for the table footer
  const tableTotals = useMemo(() => {
    const maintenanceTotal = sortedContributions
      .filter(contribution => contribution.type === 'maintenance')
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    const worksTotal = sortedContributions
      .filter(contribution => contribution.type === 'works')
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    const othersTotal = sortedContributions
      .filter(contribution => contribution.type === 'others')
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    
    return {
      maintenanceTotal,
      worksTotal,
      othersTotal,
      total: maintenanceTotal + worksTotal + othersTotal,
    };
  }, [sortedContributions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc'); // Default to desc for dates, asc for others
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

  return (
    <div className="space-y-6">
      {/* Income Receipt Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-md border-0">
            <Table className="border-separate border-spacing-0">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.date}
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('lotId')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.lot}
                      {getSortIcon('lotId')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.description}
                      {getSortIcon('description')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.type}
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-right font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.amount}
                      {getSortIcon('amount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none px-6 py-4 text-left font-semibold tracking-wide transition-colors hover:bg-muted/70 border-b-2 border-border"
                    onClick={() => handleSort('receiptNumber')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.receiptNumber}
                      {getSortIcon('receiptNumber')}
                    </div>
                  </TableHead>
                  {(isAuthenticated || contributions.some(c => c.receiptFileUrl)) && (
                    <TableHead className="px-6 py-4 text-center font-semibold tracking-wide border-b-2 border-border">
                      {translations.labels.actions}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContributions.map((contribution, index) => {
                  const lotInfo = getLotInfo(contribution.lotId);
                  return (
                    <TableRow
                      key={contribution.id}
                      className={`group transition-all duration-200 border-b border-border/50 hover:bg-muted/50 ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {formatDateForDisplay(contribution.date)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {lotInfo ? (
                          <Link 
                            href={`/lots/${contribution.lotId}`}
                            className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                          >
                            {`${lotInfo.lotNumber} - ${lotInfo.owner}`}
                          </Link>
                        ) : (
                          <div className="font-medium">
                            {contribution.lotId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {contribution.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <TypeBadge type={contribution.type} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-semibold text-emerald-600">
                          {formatCurrency(contribution.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {contribution.receiptFileUrl && (
                            <div 
                              className="p-1 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition-colors"
                              onClick={() => window.open(contribution.receiptFileUrl!, '_blank')}
                              title={translations.actions.viewReceipt}
                            >
                              <FileText className="h-3.5 w-3.5 text-green-600" />
                            </div>
                          )}
                          <span>{contribution.receiptNumber || '—'}</span>
                        </div>
                      </TableCell>
                      {(isAuthenticated || contribution.receiptFileUrl) && (
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {isAuthenticated && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit?.(contribution)}
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  title={`${translations.actions.edit} ${translations.labels.income.toLowerCase()}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDelete?.(contribution)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  title={`${translations.actions.delete} ${translations.labels.income.toLowerCase()}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {sortedContributions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={(isAuthenticated || contributions.some(c => c.receiptFileUrl)) ? 7 : 6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-muted-foreground">💰</span>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          No hay ingresos para mostrar
                        </p>
                        {incomeFilter !== "all" && (
                          <p className="text-muted-foreground text-sm">
                            Intenta cambiar el filtro de tipo de ingreso
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sortedContributions.length > 0 && (
                  <>
                    {/* Separator row */}
                    <TableRow>
                      <TableCell colSpan={(isAuthenticated || contributions.some(c => c.receiptFileUrl)) ? 7 : 6} className="border-t-2 border-muted p-0" />
                    </TableRow>
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell className="px-6 py-4 font-semibold" colSpan={4}>
                        {translations.labels.total || 'TOTAL GENERAL'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(tableTotals.total)}
                        </div>
                      </TableCell>
                      <TableCell colSpan={(isAuthenticated || contributions.some(c => c.receiptFileUrl)) ? 2 : 1} />
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