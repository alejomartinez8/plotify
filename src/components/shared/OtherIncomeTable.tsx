"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  RotateCcw,
  History,
} from "lucide-react";
import { OtherIncome } from "@/types/other-income.types";
import { ContributionType } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import TypeBadge from "@/components/shared/TypeBadge";
import ApprovalStatusBadge from "@/components/shared/ApprovalStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface OtherIncomeTableProps {
  otherIncomes: OtherIncome[];
  isAdmin?: boolean;
  isTreasurer?: boolean;
  onEdit?: (otherIncome: OtherIncome) => void;
  onDelete?: (otherIncome: OtherIncome) => void;
  onApprove?: (otherIncome: OtherIncome) => void;
  onUnapprove?: (otherIncome: OtherIncome) => void;
  onViewHistory?: (otherIncome: OtherIncome) => void;
}

type SortField = "date" | "description" | "amount" | "receiptNumber" | "type";
type SortDirection = "asc" | "desc";

export default function OtherIncomeTable({
  otherIncomes,
  isAdmin = false,
  isTreasurer = false,
  onEdit,
  onDelete,
  onApprove,
  onUnapprove,
  onViewHistory,
}: OtherIncomeTableProps) {
  const showActionsColumn = isAdmin || isTreasurer;
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedOtherIncomes = useMemo(() => {
    return [...otherIncomes].sort((a, b) => {
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
        case "type":
          aValue = a.type;
          bValue = b.type;
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
  }, [otherIncomes, sortField, sortDirection]);

  const tableTotal = useMemo(() => {
    return sortedOtherIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [sortedOtherIncomes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "date" ? "desc" : "asc");
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
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-1">
                      {translations.labels.type}
                      {getSortIcon("type")}
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
                        const withReceipts = sortedOtherIncomes.filter(
                          (e) => e.receiptFileUrl || e.receiptNumber
                        ).length;
                        const total = sortedOtherIncomes.length;
                        return total > 0 ? (
                          <span className="text-muted-foreground mt-1 text-xs">
                            {withReceipts}/{total}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </TableHead>
                  <TableHead className="border-border border-b-2 px-6 py-4 text-left font-semibold tracking-wide">
                    {translations.labels.reconciliation}
                  </TableHead>
                  {showActionsColumn && (
                    <TableHead className="border-border border-b-2 px-6 py-4 text-center font-semibold tracking-wide">
                      {translations.labels.actions}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOtherIncomes.map((otherIncome, index) => (
                  <TableRow
                    key={otherIncome.id}
                    className={`group border-border/50 hover:bg-muted/50 border-b transition-all duration-200 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">
                        {formatDateForDisplay(otherIncome.date)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <TypeBadge type={otherIncome.type as ContributionType} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">
                        {otherIncome.description}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="font-semibold text-emerald-600">
                        {formatCurrency(otherIncome.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-muted-foreground flex items-center gap-2">
                        {otherIncome.receiptFileUrl && (
                          <div
                            className="cursor-pointer rounded bg-green-100 p-1 transition-colors hover:bg-green-200"
                            onClick={() =>
                              window.open(otherIncome.receiptFileUrl!, "_blank")
                            }
                            title={translations.actions.viewReceipt}
                          >
                            <FileText className="h-3.5 w-3.5 text-green-600" />
                          </div>
                        )}
                        <span>{otherIncome.receiptNumber || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <ApprovalStatusBadge
                        status={otherIncome.approvalStatus}
                      />
                    </TableCell>
                    {showActionsColumn && (
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {(isAdmin || isTreasurer) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewHistory?.(otherIncome)}
                              className="hover:bg-muted h-8 w-8 p-0"
                              title={translations.actions.viewHistory}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          )}
                          {isTreasurer && (
                            <>
                              {otherIncome.approvalStatus !== "approved" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onApprove?.(otherIncome)}
                                  className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  title={translations.actions.approve}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {otherIncome.approvalStatus === "approved" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onUnapprove?.(otherIncome)}
                                  className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                  title={translations.actions.unapprove}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit?.(otherIncome)}
                                className="hover:bg-muted h-8 w-8 p-0"
                                title={`${translations.actions.edit} ${translations.navigation.otherIncome.toLowerCase()}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {otherIncome.approvalStatus !== "approved" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDelete?.(otherIncome)}
                                  className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                                  title={`${translations.actions.delete} ${translations.navigation.otherIncome.toLowerCase()}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {sortedOtherIncomes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={showActionsColumn ? 7 : 6}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
                          <span className="text-muted-foreground text-2xl">
                            💵
                          </span>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {translations.messages.noOtherIncome}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sortedOtherIncomes.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={showActionsColumn ? 7 : 6}
                        className="border-muted border-t-2 p-0"
                      />
                    </TableRow>
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell
                        className="px-6 py-4 font-semibold"
                        colSpan={3}
                      >
                        {translations.labels.total}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(tableTotal)}
                        </div>
                      </TableCell>
                      <TableCell colSpan={showActionsColumn ? 3 : 2} />
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
