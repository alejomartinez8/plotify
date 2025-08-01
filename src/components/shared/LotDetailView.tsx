"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Edit, Trash2, FileText, ArrowLeft } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { Contribution } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
}

type SortField = 'date' | 'description' | 'type' | 'amount' | 'receiptNumber';
type SortDirection = 'asc' | 'desc';

export default function LotDetailView({
  lot,
  contributions,
  allLots,
  isAuthenticated = false,
}: LotDetailViewProps) {
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [deletingContribution, setDeletingContribution] = useState<Contribution | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sort contributions
  const sortedContributions = useMemo(() => {
    return [...contributions].sort((a, b) => {
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
  }, [contributions, sortField, sortDirection]);

  // Calculate totals by fund type
  const fundTotals = useMemo(() => {
    const maintenanceTotal = contributions
      .filter(c => c.type === 'maintenance')
      .reduce((sum, c) => sum + c.amount, 0);
    const worksTotal = contributions
      .filter(c => c.type === 'works')
      .reduce((sum, c) => sum + c.amount, 0);
    const othersTotal = contributions
      .filter(c => c.type === 'others')
      .reduce((sum, c) => sum + c.amount, 0);
    
    return {
      maintenance: maintenanceTotal,
      works: worksTotal,
      others: othersTotal,
      total: maintenanceTotal + worksTotal + othersTotal,
    };
  }, [contributions]);

  // Payment statistics
  const paymentStats = useMemo(() => {
    const totalPayments = contributions.length;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const paymentsThisYear = contributions.filter(c => 
      new Date(c.date).getFullYear() === currentYear
    ).length;
    
    const paymentsThisMonth = contributions.filter(c => {
      const date = new Date(c.date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }).length;

    return {
      total: totalPayments,
      thisYear: paymentsThisYear,
      thisMonth: paymentsThisMonth,
    };
  }, [contributions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
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

  const handleLotChange = (selectedLotId: string) => {
    if (selectedLotId !== lot.id) {
      router.push(`/lots/${selectedLotId}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button and Lot Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translations.labels.back}
        </Button>
        
        {/* Lot Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {translations.labels.changeTo}
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

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Contributions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.labels.total} {translations.labels.income}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(fundTotals.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.total} {translations.labels.payments}
            </p>
          </CardContent>
        </Card>

        {/* Maintenance Fund */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.labels.maintenance}
            </CardTitle>
            <TypeBadge type="maintenance" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fundTotals.maintenance)}
            </div>
          </CardContent>
        </Card>

        {/* Works Fund */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.labels.works}
            </CardTitle>
            <TypeBadge type="works" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fundTotals.works)}
            </div>
          </CardContent>
        </Card>

        {/* Others Fund */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.labels.others}
            </CardTitle>
            <TypeBadge type="others" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fundTotals.others)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{translations.titles.paymentSummary}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{paymentStats.total}</div>
              <p className="text-sm text-muted-foreground">{translations.titles.totalPayments}</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{paymentStats.thisYear}</div>
              <p className="text-sm text-muted-foreground">{translations.titles.thisYear}</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{paymentStats.thisMonth}</div>
              <p className="text-sm text-muted-foreground">{translations.titles.thisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{translations.titles.paymentHistory}</CardTitle>
        </CardHeader>
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
                {sortedContributions.map((contribution, index) => (
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
                                onClick={() => setEditingContribution(contribution)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                                title={`${translations.actions.edit} ${translations.labels.income.toLowerCase()}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingContribution(contribution)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title={`${translations.actions.delete} ${translations.labels.income.toLowerCase()}`}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {sortedContributions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={(isAuthenticated || contributions.some(c => c.receiptFileUrl)) ? 6 : 5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-muted-foreground">💰</span>
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
                    {/* Separator row */}
                    <TableRow>
                      <TableCell colSpan={(isAuthenticated || contributions.some(c => c.receiptFileUrl)) ? 6 : 5} className="border-t-2 border-muted p-0" />
                    </TableRow>
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 hover:bg-muted/50 transition-colors">
                      <TableCell className="px-6 py-4 font-semibold" colSpan={3}>
                        {translations.labels.total || 'TOTAL'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(fundTotals.total)}
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
  );
}