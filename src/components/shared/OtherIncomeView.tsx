"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OtherIncome } from "@/types/other-income.types";
import { ContributionType } from "@/types/contributions.types";
import { translations } from "@/lib/translations";
import OtherIncomeModal from "../modals/OtherIncomeModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import ApprovalNoteModal, {
  ApprovalActionKind,
} from "../modals/ApprovalNoteModal";
import ApprovalHistoryModal from "../modals/ApprovalHistoryModal";
import FilterSection from "@/components/shared/FilterSection";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportOtherIncomeAction } from "@/lib/actions/export-actions";
import NewOtherIncomeButton from "@/components/shared/NewOtherIncomeButton";
import OtherIncomeTable from "@/components/shared/OtherIncomeTable";
import {
  approveOtherIncomeAction,
  unapproveOtherIncomeAction,
} from "@/lib/actions/approval-actions";

interface OtherIncomeViewProps {
  title: string;
  otherIncomes: OtherIncome[];
  isAdmin?: boolean;
  isTreasurer?: boolean;
}

type OtherIncomeFilter = "all" | ContributionType;

export default function OtherIncomeView({
  title,
  otherIncomes,
  isAdmin = false,
  isTreasurer = false,
}: OtherIncomeViewProps) {
  const [editingOtherIncome, setEditingOtherIncome] =
    useState<OtherIncome | null>(null);
  const [deletingOtherIncome, setDeletingOtherIncome] =
    useState<OtherIncome | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<{
    otherIncome: OtherIncome;
    action: ApprovalActionKind;
  } | null>(null);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<OtherIncome | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const typeFilter: OtherIncomeFilter =
    (searchParams.get("type") as OtherIncomeFilter | null) || "all";
  const yearFilter = searchParams.get("year") || "all";

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
    updateURL({ type });
  };

  const handleYearFilterChange = (year: string) => {
    updateURL({ year });
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    otherIncomes.forEach((otherIncome) => {
      const date = new Date(otherIncome.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [otherIncomes]);

  const typeFilterOptions = [
    { value: "all", label: translations.filters.allOtherIncome },
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

  const filteredOtherIncomes = useMemo(() => {
    let filtered = otherIncomes;

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.date);
        return (
          !isNaN(date.getTime()) && date.getFullYear().toString() === yearFilter
        );
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [otherIncomes, typeFilter, yearFilter]);

  const handleOtherIncomeSuccess = (
    _otherIncome: OtherIncome,
    _isUpdate: boolean
  ) => {
    setEditingOtherIncome(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOtherIncome) return;

    try {
      const { deleteOtherIncomeAction } =
        await import("@/lib/actions/other-income-actions");
      await deleteOtherIncomeAction(deletingOtherIncome.id);
    } catch (error) {
      console.error("Error deleting other income:", error);
    } finally {
      setDeletingOtherIncome(null);
    }
  };

  const handleApprovalConfirm = async (note: string) => {
    if (!approvalTarget) return;

    setIsApprovalLoading(true);
    try {
      const { otherIncome, action } = approvalTarget;
      if (action === "approve") {
        await approveOtherIncomeAction(otherIncome.id, note || undefined);
      } else {
        await unapproveOtherIncomeAction(otherIncome.id, note || undefined);
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
                onExport={exportOtherIncomeAction}
                variant="outline"
                size="default"
              >
                {translations.actions.export}{" "}
                {translations.navigation.otherIncome} CSV
              </ExportButton>
              <NewOtherIncomeButton isAdmin={isAdmin} />
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

      <OtherIncomeTable
        otherIncomes={filteredOtherIncomes}
        isAdmin={isAdmin}
        isTreasurer={isTreasurer}
        onEdit={setEditingOtherIncome}
        onDelete={setDeletingOtherIncome}
        onApprove={(otherIncome) =>
          setApprovalTarget({ otherIncome, action: "approve" })
        }
        onUnapprove={(otherIncome) =>
          setApprovalTarget({ otherIncome, action: "unapprove" })
        }
        onViewHistory={setHistoryTarget}
      />

      {editingOtherIncome && isAdmin && (
        <OtherIncomeModal
          otherIncome={editingOtherIncome}
          onClose={() => setEditingOtherIncome(null)}
          onSuccess={handleOtherIncomeSuccess}
        />
      )}

      {isAdmin && (
        <ConfirmationModal
          isOpen={!!deletingOtherIncome}
          title={translations.confirmations.deleteTitle}
          message={translations.confirmations.deleteOtherIncome}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingOtherIncome(null)}
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
          recordType="otherIncome"
          recordId={historyTarget.id}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
