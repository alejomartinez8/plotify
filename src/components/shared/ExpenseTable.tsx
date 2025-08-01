"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Edit, Trash2, Eye, FileText } from "lucide-react";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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

export type ExpenseType = "all" | "maintenance" | "works" | "others";

interface ExpenseTableProps {
  expenses: Expense[];
  expenseFilter: ExpenseType;
  isAuthenticated?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

type SortField = 'date' | 'description' | 'type' | 'amount' | 'receiptNumber';
type SortDirection = 'asc' | 'desc';

export default function ExpenseTable({
  expenses,
  expenseFilter,
  isAuthenticated = false,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filter expenses based on expense filter
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    if (expenseFilter !== "all") {
      filtered = filtered.filter((expense) => expense.type === expenseFilter);
    }
    
    return filtered;
  }, [expenses, expenseFilter]);

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
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
  }, [filteredExpenses, sortField, sortDirection]);

  // Calculate totals for the table footer
  const tableTotals = useMemo(() => {
    const maintenanceTotal = sortedExpenses
      .filter(expense => expense.type === 'maintenance')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const worksTotal = sortedExpenses
      .filter(expense => expense.type === 'works')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const othersTotal = sortedExpenses
      .filter(expense => expense.type === 'others')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      maintenanceTotal,
      worksTotal,
      othersTotal,
      total: maintenanceTotal + worksTotal + othersTotal,
    };
  }, [sortedExpenses]);

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
      {/* Expense Table */}
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
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.type}
                      {getSortIcon('type')}
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
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {translations.labels.receiptNumber}
                        {getSortIcon('receiptNumber')}
                      </div>
                      {(() => {
                        const withReceipts = sortedExpenses.filter(e => e.receiptFileUrl || e.receiptNumber).length;
                        const total = sortedExpenses.length;
                        return total > 0 ? (
                          <span className="text-xs text-muted-foreground mt-1">
                            {withReceipts}/{total}
                          </span>
                        ) : null;
                      })()}
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
                {sortedExpenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className={`group transition-all duration-200 border-b border-border/50 hover:bg-muted/50 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">
                        {formatDateForDisplay(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <TypeBadge type={expense.type} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-semibold text-destructive">
                        {formatCurrency(expense.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {expense.receiptFileUrl && (
                          <div 
                            className="p-1 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition-colors"
                            onClick={() => window.open(expense.receiptFileUrl!, '_blank')}
                            title={translations.actions.viewReceipt}
                          >
                            <FileText className="h-3.5 w-3.5 text-green-600" />
                          </div>
                        )}
                        <span>{expense.receiptNumber || '—'}</span>
                      </div>
                    </TableCell>
                    {isAuthenticated && (
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(expense)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title={`${translations.actions.edit} ${translations.labels.expenses.toLowerCase()}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete?.(expense)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title={`${translations.actions.delete} ${translations.labels.expenses.toLowerCase()}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {sortedExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAuthenticated ? 6 : 5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-muted-foreground">💳</span>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {translations.messages.noExpenses}
                        </p>
                        {expenseFilter !== "all" && (
                          <p className="text-muted-foreground text-sm">
                            Intenta cambiar el filtro de tipo de gasto
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sortedExpenses.length > 0 && (
                  <>
                    {/* Separator row */}
                    <TableRow>
                      <TableCell colSpan={isAuthenticated ? 6 : 5} className="border-t-2 border-muted p-0" />
                    </TableRow>
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell className="px-6 py-4 font-semibold" colSpan={3}>
                        {translations.labels.total || 'TOTAL GENERAL'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-bold text-destructive">
                          {formatCurrency(tableTotals.total)}
                        </div>
                      </TableCell>
                      <TableCell colSpan={isAuthenticated ? 2 : 1} />
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