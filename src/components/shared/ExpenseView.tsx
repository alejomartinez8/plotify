"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Expense, ExpenseType } from "@/types/expenses.types";
import { translations } from "@/lib/translations";
import ExpenseModal from "../modals/ExpenseModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import ApprovalNoteModal, {
  ApprovalActionKind,
} from "../modals/ApprovalNoteModal";
import ApprovalHistoryModal from "../modals/ApprovalHistoryModal";
import FilterSection from "@/components/shared/FilterSection";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportExpensesAction } from "@/lib/actions/export-actions";
import NewExpenseButton from "@/components/shared/NewExpenseButton";
import ExpenseTable from "@/components/shared/ExpenseTable";
import {
  approveExpenseAction,
  unapproveExpenseAction,
} from "@/lib/actions/approval-actions";

interface ExpenseViewProps {
  title: string;
  expenses: Expense[];
  isAdmin?: boolean;
  isTreasurer?: boolean;
}

type ExpenseFilter = "all" | ExpenseType;

export default function ExpenseView({
  title,
  expenses,
  isAdmin = false,
  isTreasurer = false,
}: ExpenseViewProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<{
    expense: Expense;
    action: ApprovalActionKind;
  } | null>(null);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Expense | null>(null);
  const [typeFilter, setTypeFilter] = useState<ExpenseFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const yearParam = searchParams.get("year");
    const typeParam = searchParams.get("type") as ExpenseFilter | null;

    setYearFilter(yearParam || "all");
    setTypeFilter(typeParam || "all");
  }, [searchParams]);

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type as ExpenseFilter);
    updateURL({ type });
  };

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);
    updateURL({ year });
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [expenses]);

  const typeFilterOptions = [
    { value: "all", label: translations.filters.allExpenses },
    { value: "maintenance", label: translations.labels.maintenance },
    { value: "works", label: translations.labels.works },
    { value: "others", label: translations.labels.others },
  ];

  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: translations.filters.allYears },
      ...availableYears.map((year) => ({ value: year, label: year })),
    ],
    [availableYears]
  );

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (typeFilter !== "all") {
      filtered = filtered.filter((expense) => expense.type === typeFilter);
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((expense) => {
        const date = new Date(expense.date);
        return (
          !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter
        );
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, typeFilter, yearFilter]);

  const handleExpenseSuccess = (_expense: Expense, _isUpdate: boolean) => {
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    try {
      const { deleteExpenseAction } = await import(
        "@/lib/actions/expense-actions"
      );
      await deleteExpenseAction(deletingExpense.id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeletingExpense(null);
    }
  };

  const handleApprovalConfirm = async (note: string) => {
    if (!approvalTarget) return;

    setIsApprovalLoading(true);
    try {
      const { expense, action } = approvalTarget;
      if (action === "approve") {
        await approveExpenseAction(expense.id, note || undefined);
      } else {
        await unapproveExpenseAction(expense.id, note || undefined);
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
    } finally {
      setIsApprovalLoading(false);
      setApprovalTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FilterSection
        title={title}
        actionButton={
          isAdmin ? (
            <div className="flex items-center gap-2">
              <ExportButton
                onExport={exportExpensesAction}
                variant="outline"
                size="default"
              >
                {translations.actions.export} {translations.labels.expenses} CSV
              </ExportButton>
              <NewExpenseButton isAdmin={isAdmin} />
            </div>
          ) : null
        }
        typeFilter={{
          value: typeFilter,
          onChange: handleTypeFilterChange,
          options: typeFilterOptions,
        }}
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: yearFilterOptions,
        }}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        isAdmin={isAdmin}
        isTreasurer={isTreasurer}
        onEdit={setEditingExpense}
        onDelete={setDeletingExpense}
        onApprove={(expense) =>
          setApprovalTarget({ expense, action: "approve" })
        }
        onUnapprove={(expense) =>
          setApprovalTarget({ expense, action: "unapprove" })
        }
        onViewHistory={setHistoryTarget}
      />

      {editingExpense && isAdmin && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleExpenseSuccess}
        />
      )}

      {isAdmin && (
        <ConfirmationModal
          isOpen={!!deletingExpense}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteExpense}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingExpense(null)}
          variant="danger"
        />
      )}

      {/* Approve / Unapprove Modal */}
      {approvalTarget && (
        <ApprovalNoteModal
          isOpen={!!approvalTarget}
          action={approvalTarget.action}
          onClose={() => setApprovalTarget(null)}
          onConfirm={handleApprovalConfirm}
          isLoading={isApprovalLoading}
        />
      )}

      {/* Approval History Modal */}
      {historyTarget && (
        <ApprovalHistoryModal
          recordType="expense"
          recordId={historyTarget.id}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
