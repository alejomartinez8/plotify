"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { QuotaConfig } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface QuotaTableProps {
  quotaConfigs: QuotaConfig[];
  onEdit: (quota: QuotaConfig) => void;
  onDelete: (quota: QuotaConfig) => void;
  isAdmin: boolean;
}

type SortField = "quotaType" | "amount" | "description" | "dueDate";
type SortDirection = "asc" | "desc";

export default function QuotaTable({
  quotaConfigs,
  onEdit,
  onDelete,
  isAdmin,
}: QuotaTableProps) {
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const getQuotaTypeText = (type: string) => {
    switch (type) {
      case "maintenance":
        return translations.titles.quotaTypesMaintenance;
      case "works":
        return translations.titles.quotaTypesWorks;
      default:
        return type;
    }
  };

  const getQuotaTypeColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      case "works":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sort quotas
  const sortedQuotas = useMemo(() => {
    return [...quotaConfigs].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "quotaType":
          aValue = a.quotaType;
          bValue = b.quotaType;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "description":
          aValue = a.description || "";
          bValue = b.description || "";
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        default:
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
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
  }, [quotaConfigs, sortField, sortDirection]);

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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{translations.titles.quotaConfiguration}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-md border-0">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="flex items-center gap-1">
                    {translations.labels.dueDate}
                    {getSortIcon("dueDate")}
                  </div>
                </TableHead>
                <TableHead
                  className="hover:bg-muted/70 border-border cursor-pointer border-b-2 px-6 py-4 text-left font-semibold tracking-wide transition-colors select-none"
                  onClick={() => handleSort("quotaType")}
                >
                  <div className="flex items-center gap-1">
                    {translations.labels.type}
                    {getSortIcon("quotaType")}
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
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center gap-1">
                    {translations.labels.description}
                    {getSortIcon("description")}
                  </div>
                </TableHead>
                {isAdmin && (
                  <TableHead className="border-border border-b-2 px-6 py-4 text-center font-semibold tracking-wide">
                    {translations.labels.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuotas.map((quota, index) => (
                <TableRow
                  key={quota.id}
                  className={`group border-border/50 hover:bg-muted/50 border-b transition-all duration-200 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <TableCell className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {quota.dueDate
                        ? formatDateForDisplay(quota.dueDate)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getQuotaTypeColor(quota.quotaType)}`}
                    >
                      {getQuotaTypeText(quota.quotaType)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="font-bold text-emerald-600">
                      {formatCurrency(quota.amount)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div
                      className="max-w-xs truncate text-gray-600"
                      title={quota.description || ""}
                    >
                      {quota.description || "-"}
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(quota)}
                          className="hover:bg-muted h-8 w-8 p-0"
                          title={`${translations.actions.edit} cuota`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(quota)}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                          title={`${translations.actions.delete} cuota`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedQuotas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 5 : 4}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
                        <span className="text-muted-foreground text-2xl">
                          ⚙️
                        </span>
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {translations.titles.noQuotasConfigured}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
