"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QuotaConfig } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import QuotaModal from "../modals/QuotaModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import FilterSection from "@/components/shared/FilterSection";
import NewQuotaButton from "@/components/shared/NewQuotaButton";
import QuotaTable from "@/components/shared/QuotaTable";
import { deleteQuotaConfigAction } from "@/lib/actions/quota-actions";
import { useTransition } from "react";

interface QuotaViewProps {
  quotaConfigs: QuotaConfig[];
  isAuthenticated?: boolean;
}

type QuotaType = "all" | "maintenance" | "works";

export default function QuotaView({
  quotaConfigs,
  isAuthenticated = false,
}: QuotaViewProps) {
  const [editingQuota, setEditingQuota] = useState<QuotaConfig | null>(null);
  const [deletingQuota, setDeletingQuota] = useState<QuotaConfig | null>(null);
  const [quotaFilter, setQuotaFilter] = useState<QuotaType>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get("type") as QuotaType;
    const yearParam = searchParams.get("year");

    if (typeParam && (typeParam === "maintenance" || typeParam === "works")) {
      setQuotaFilter(typeParam);
    } else {
      setQuotaFilter("all");
    }

    if (yearParam) {
      setYearFilter(yearParam);
    } else {
      setYearFilter("all");
    }
  }, [searchParams]);

  const handleQuotaFilterChange = (quotaType: QuotaType) => {
    setQuotaFilter(quotaType);

    const url = new URL(window.location.href);
    if (quotaType === "all") {
      url.searchParams.delete("type");
    } else {
      url.searchParams.set("type", quotaType);
    }
    router.push(url.pathname + url.search);
  };

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);

    const url = new URL(window.location.href);
    if (year === "all") {
      url.searchParams.delete("year");
    } else {
      url.searchParams.set("year", year);
    }
    router.push(url.pathname + url.search);
  };

  // Filter quotas based on current filters
  const filteredQuotas = useMemo(() => {
    let filtered = quotaConfigs;

    // Filter by type
    if (quotaFilter !== "all") {
      filtered = filtered.filter((quota) => quota.quotaType === quotaFilter);
    }

    // Filter by year based on dueDate
    if (yearFilter !== "all") {
      filtered = filtered.filter((quota) => {
        if (!quota.dueDate) return false;
        const dueYear = new Date(quota.dueDate).getFullYear().toString();
        return dueYear === yearFilter;
      });
    }

    return filtered;
  }, [quotaConfigs, quotaFilter, yearFilter]);

  // Get available years from deadlines for filter
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        quotaConfigs
          .filter((quota) => quota.dueDate)
          .map((quota) => new Date(quota.dueDate!).getFullYear().toString())
      )
    );
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [quotaConfigs]);

  const handleDeleteConfirm = () => {
    if (!deletingQuota) return;

    startTransition(async () => {
      const result = await deleteQuotaConfigAction(deletingQuota.id);
      if (result.success) {
        router.refresh();
      }
      setDeletingQuota(null);
    });
  };

  const handleQuotaSuccess = () => {
    setEditingQuota(null);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with unified filters and actions */}
      <FilterSection
        title={translations.navigation.quotas}
        actionButton={
          isAuthenticated ? (
            <NewQuotaButton onSuccess={handleQuotaSuccess} />
          ) : null
        }
        typeFilter={{
          value: quotaFilter,
          onChange: (value) => handleQuotaFilterChange(value as QuotaType),
          options: [
            { value: "all", label: translations.filters.all },
            {
              value: "maintenance",
              label: translations.titles.quotaTypesMaintenance,
            },
            { value: "works", label: translations.titles.quotaTypesWorks },
          ],
        }}
        yearFilter={{
          value: yearFilter,
          onChange: handleYearFilterChange,
          options: [
            { value: "all", label: translations.filters.allYears },
            ...availableYears.map((year) => ({ value: year, label: year })),
          ],
        }}
      />

      <div className="mt-6">
        <QuotaTable
          quotaConfigs={filteredQuotas}
          onEdit={setEditingQuota}
          onDelete={setDeletingQuota}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Edit Modal */}
      {editingQuota && isAuthenticated && (
        <QuotaModal
          quota={editingQuota}
          onClose={() => setEditingQuota(null)}
          onSuccess={handleQuotaSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAuthenticated && (
        <ConfirmationModal
          isOpen={!!deletingQuota}
          title={translations.confirmations.deleteTitle}
          message={translations.titles.quotaDeleteConfirmation}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingQuota(null)}
          variant="danger"
        />
      )}
    </div>
  );
}
