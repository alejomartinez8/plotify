"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { Expense } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface ExpenseTableProps {
  expenses: Expense[];
  isAuthenticated?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

type SortField = "date" | "description" | "amount" | "receiptNumber";
type SortDirection = "asc" | "desc";

export default function ExpenseTable({
  expenses,
  isAuthenticated = false,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Use all expenses (no filtering by type)
  const filteredExpenses = useMemo(() => {
    return expenses;
  }, [expenses]);

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "receiptNumber":
          aValue = a.receiptNumber || "";
          bValue = b.receiptNumber || "";
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
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
  }, [filteredExpenses, sortField, sortDirection]);

  // Calculate total for the table footer
  const tableTotal = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "date" ? "desc" : "asc"); // Default to desc for dates, asc for others
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
                    className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.date}
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.description}
                      {getSortIcon("description")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-right font-semibold tracking-wide transition-colors select-none"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {translations.labels.amount}
                      {getSortIcon("amount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                    onClick={() => handleSort("receiptNumber")}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {translations.labels.receiptNumber}
                        {getSortIcon("receiptNumber")}
                      </div>
                      {(() => {
                        const withReceipts = sortedExpenses.filter(
                          (e) => e.receiptFileUrl || e.receiptNumber
                        ).length;
                        const total = sortedExpenses.length;
                        return total > 0 ? (
                          <span className="text-muted-foreground mt-1 text-xs">
                            {withReceipts}/{total}
                          </span>
                        ) : null;
                      })()}
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
                {sortedExpenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className={`group border-border/50 hover:bg-muted/50 border-b transition-all duration-200 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">
                        {formatDateForDisplay(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">{expense.description}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="text-destructive font-semibold">
                        {formatCurrency(expense.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-muted-foreground flex items-center gap-2">
                        {expense.receiptFileUrl && (
                          <div
                            className="cursor-pointer rounded bg-green-100 p-1 transition-colors hover:bg-green-200"
                            onClick={() =>
                              window.open(expense.receiptFileUrl!, "_blank")
                            }
                            title={translations.actions.viewReceipt}
                          >
                            <FileText className="h-3.5 w-3.5 text-green-600" />
                          </div>
                        )}
                        <span>{expense.receiptNumber || "—"}</span>
                      </div>
                    </TableCell>
                    {isAuthenticated && (
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(expense)}
                            className="hover:bg-muted h-8 w-8 p-0"
                            title={`${translations.actions.edit} ${translations.labels.expenses.toLowerCase()}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete?.(expense)}
                            className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
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
                    <TableCell
                      colSpan={isAuthenticated ? 5 : 4}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
                          <span className="text-muted-foreground text-2xl">
                            💳
                          </span>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {translations.messages.noExpenses}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sortedExpenses.length > 0 && (
                  <>
                    {/* Separator row */}
                    <TableRow>
                      <TableCell
                        colSpan={isAuthenticated ? 5 : 4}
                        className="border-muted border-t-2 p-0"
                      />
                    </TableRow>
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell
                        className="px-6 py-4 font-semibold"
                        colSpan={2}
                      >
                        {translations.labels.total || "TOTAL GENERAL"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="text-destructive font-bold">
                          {formatCurrency(tableTotal)}
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
