"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay, getStatusColor } from "@/lib/utils";
import { LotDebtDetail } from "@/types/quotas.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import TypeBadge from "@/components/shared/TypeBadge";
import ContributionModal from "@/components/modals/ContributionModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { deleteContributionAction } from "@/lib/actions/contribution-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface LotDetailViewProps {
  lot: Lot & { contributions: Contribution[] };
  contributions: Contribution[];
  allLots: Lot[];
  isAuthenticated?: boolean;
  debtDetail?: LotDebtDetail | null;
}

type SortField = "date" | "description" | "type" | "amount" | "receiptNumber";
type SortDirection = "asc" | "desc";

export default function LotDetailView({
  lot,
  contributions,
  allLots,
  isAuthenticated = false,
  debtDetail,
}: LotDetailViewProps) {
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] =
    useState<Contribution | null>(null);
  const [showNewContributionModal, setShowNewContributionModal] =
    useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sort contributions
  const sortedContributions = useMemo(() => {
    return [...contributions].sort((a, b) => {
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
        case "type":
          aValue = a.type;
          bValue = b.type;
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
  }, [contributions, sortField, sortDirection]);

  // Calculate totals by fund type
  const fundTotals = useMemo(() => {
    const maintenanceTotal = contributions
      .filter((c) => c.type === "maintenance")
      .reduce((sum, c) => sum + c.amount, 0);
    const worksTotal = contributions
      .filter((c) => c.type === "works")
      .reduce((sum, c) => sum + c.amount, 0);
    const othersTotal = contributions
      .filter((c) => c.type === "others")
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      maintenance: maintenanceTotal,
      works: worksTotal,
      others: othersTotal,
      total: maintenanceTotal + worksTotal + othersTotal,
    };
  }, [contributions]);

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

  const handleDeleteConfirm = () => {
    if (!deletingContribution) return;

    startTransition(async () => {
      const result = await deleteContributionAction(deletingContribution.id);
      if (result.success) {
        router.refresh();
      }
      setDeletingContribution(null);
    });
  };

  const handleContributionSuccess = () => {
    setEditingContribution(null);
    router.refresh();
  };

  const handleNewContributionSuccess = () => {
    setShowNewContributionModal(false);
    router.refresh();
  };

  const handleLotChange = (selectedLotId: string) => {
    if (selectedLotId !== lot.id) {
      // Check if we're in income context
      if (window.location.pathname.startsWith("/income/")) {
        router.push(`/income/${selectedLotId}`);
      } else {
        router.push(`/income/${selectedLotId}`);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Filter Section with Back Button and Lot Selector */}
      <div className="mb-8">
        <div className="flex flex-col gap-6 sm:gap-4">
          {/* Back Button and Title Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-foreground text-2xl font-bold">
                {translations.labels.lot} {lot.lotNumber}
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">{lot.owner}</p>
            </div>
          </div>

          {/* Lot Selector Section - Only for admins */}
          {isAuthenticated && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {translations.labels.goToLot}
                </span>
                <Select value={lot.id} onValueChange={handleLotChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allLots.map((lotOption) => (
                      <SelectItem key={lotOption.id} value={lotOption.id}>
                        Lote {lotOption.lotNumber} - {lotOption.owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Financial Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Contributions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {translations.labels.totalPaid}
              </CardTitle>
              <div className="text-muted-foreground h-4 w-4">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(fundTotals.total)}
              </div>
              <p className="text-muted-foreground text-xs">
                {translations.labels.contributionsMade}
              </p>
            </CardContent>
          </Card>

          {/* Outstanding Balance */}
          {debtDetail && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {translations.labels.totalOwed}
                </CardTitle>
                <div className="text-muted-foreground h-4 w-4">⚖️</div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${debtDetail.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(debtDetail.outstandingBalance)}
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(debtDetail.status)}`}
                  >
                    {debtDetail.status === "current"
                      ? translations.labels.current
                      : translations.labels.overdue}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial Debt */}
          {debtDetail && debtDetail.initialWorksDebt > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {translations.labels.initialDebt}
                </CardTitle>
                <div className="text-muted-foreground h-4 w-4">📋</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {formatCurrency(debtDetail.initialWorksDebt)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {translations.labels.initialDebtBalance}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Breakdown by Type */}
        {debtDetail && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Maintenance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <TypeBadge type="maintenance" />
                  <CardTitle className="text-base">
                    {translations.labels.maintenance}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-emerald-600">
                      {formatCurrency(fundTotals.maintenance)}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {translations.labels.paid}
                    </p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(debtDetail.maintenanceDebt)}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {translations.labels.owes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Works Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <TypeBadge type="works" />
                  <CardTitle className="text-base">
                    {translations.labels.works}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-emerald-600">
                      {formatCurrency(fundTotals.works)}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {translations.labels.paid}
                    </p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(debtDetail.worksDebt)}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {translations.labels.owes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payments Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{translations.titles.paymentHistory}</CardTitle>
              {isAuthenticated && (
                <Button
                  onClick={() => setShowNewContributionModal(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {translations.titles.newContribution}
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
                          const withReceipts = sortedContributions.filter(
                            (c) => c.receiptFileUrl || c.receiptNumber
                          ).length;
                          const total = sortedContributions.length;
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
                  {sortedContributions.map((contribution, index) => (
                    <TableRow
                      key={contribution.id}
                      className={`group border-border/50 hover:bg-muted/50 border-b transition-all duration-200 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {formatDateForDisplay(contribution.date)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <TypeBadge type={contribution.type} />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium">
                          {contribution.description}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-semibold text-emerald-600">
                          {formatCurrency(contribution.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-muted-foreground flex items-center gap-2">
                          {contribution.receiptFileUrl && (
                            <div
                              className="cursor-pointer rounded bg-green-100 p-1 transition-colors hover:bg-green-200"
                              onClick={() =>
                                window.open(
                                  contribution.receiptFileUrl!,
                                  "_blank"
                                )
                              }
                              title={translations.actions.viewReceipt}
                            >
                              <FileText className="h-3.5 w-3.5 text-green-600" />
                            </div>
                          )}
                          <span>{contribution.receiptNumber || "—"}</span>
                        </div>
                      </TableCell>
                      {isAuthenticated && (
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setEditingContribution(contribution)
                              }
                              className="hover:bg-muted h-8 w-8 p-0"
                              title={`${translations.actions.edit} ${translations.labels.income.toLowerCase()}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeletingContribution(contribution)
                              }
                              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                              title={`${translations.actions.delete} ${translations.labels.income.toLowerCase()}`}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {sortedContributions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isAuthenticated ? 6 : 5}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
                            <span className="text-muted-foreground text-2xl">
                              💰
                            </span>
                          </div>
                          <p className="text-muted-foreground font-medium">
                            {translations.messages.noContributionsForLot}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedContributions.length > 0 && (
                    <>
                      <TableRow>
                        <TableCell
                          colSpan={isAuthenticated ? 6 : 5}
                          className="border-muted border-t-2 p-0"
                        />
                      </TableRow>
                      <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                        <TableCell
                          className="px-6 py-4 font-semibold"
                          colSpan={3}
                        >
                          {translations.labels.total || "TOTAL"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="font-bold text-emerald-600">
                            {formatCurrency(fundTotals.total)}
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

        {/* Edit Modal */}
        {editingContribution && isAuthenticated && (
          <ContributionModal
            contribution={editingContribution}
            onClose={() => setEditingContribution(null)}
            onSuccess={handleContributionSuccess}
            lots={[lot]}
            lotsLoading={false}
          />
        )}

        {/* New Contribution Modal */}
        {showNewContributionModal && isAuthenticated && (
          <ContributionModal
            onClose={() => setShowNewContributionModal(false)}
            onSuccess={handleNewContributionSuccess}
            lots={[lot]}
            lotsLoading={false}
            defaultLotId={lot.id}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isAuthenticated && (
          <ConfirmationModal
            isOpen={!!deletingContribution}
            title={translations.confirmations.deleteTitle}
            message={translations.confirmations.deleteContribution}
            onConfirm={handleDeleteConfirm}
            onClose={() => setDeletingContribution(null)}
            variant="danger"
          />
        )}
      </div>
    </div>
  );
}
