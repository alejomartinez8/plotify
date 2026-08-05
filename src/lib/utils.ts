import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  SimpleLotBalance,
  LotDebtDetail,
  LotPaymentStatus,
} from "@/types/quotas.types";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param inputs - Array of class values to combine
 * @returns Combined and optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Colombian Peso currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$123,456")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    currencyDisplay: "symbol",
  })
    .format(amount)
    .replace("COP", "$");
}

/**
 * Converts a date to YYYY-MM-DD format for database storage
 * Handles timezone issues by parsing dates as local dates
 * @param dateInput - Date object or date string to convert
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForStorage(dateInput: string | Date): string {
  if (typeof dateInput === "string") {
    // If already a string in YYYY-MM-DD format, return as is
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateInput;
    }
  }

  // Parse date string as local date to avoid timezone issues (same logic as formatDateForDisplay)
  let date: Date;

  if (typeof dateInput === "string") {
    // If it's a YYYY-MM-DD string, parse it as local date
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateInput.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  // Use local methods for consistency with formatDateForDisplay
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a date to DD/MM/YYYY format for user display
 * Handles timezone issues by parsing dates as local dates
 * @param dateInput - Date object or date string to convert
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateForDisplay(dateInput: string | Date): string {
  // Parse date string as local date to avoid timezone issues
  let date: Date;

  if (typeof dateInput === "string") {
    // If it's a YYYY-MM-DD string, parse it as local date
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateInput.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  // Return DD/MM/YYYY format for display
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates simplified balance information for all lots
 * Excludes exempt lots from debt calculations and sorts by outstanding balance
 * @param lots - Array of all lots in the system
 * @param contributions - Array of all contributions made
 * @param quotaConfigs - Array of quota configurations
 * @returns Array of SimpleLotBalance sorted by outstanding balance (highest first)
 */
export function calculateSimpleLotBalances(
  lots: any[],
  contributions: any[],
  quotaConfigs: any[]
): SimpleLotBalance[] {
  const currentDate = new Date();

  // Filter quotas that should be applied by now based on dueDate
  const applicableQuotas = quotaConfigs.filter((quota) => {
    if (quota.dueDate) {
      return new Date(quota.dueDate) <= currentDate;
    }
    return false;
  });

  const lotBalances: SimpleLotBalance[] = lots
    .filter((lot) => !lot.isExempt || lot.exemptionEndDate) // Exclude fully exempt lots (no end date)
    .map((lot) => {
      // activeFrom limits which quotas apply, but all contributions count regardless of date
      const activeFrom = lot.exemptionEndDate ? new Date(lot.exemptionEndDate) : null;

      const lotContributions = contributions.filter(
        (contribution) => contribution.lotId === lot.id
      );
      const totalContributions = lotContributions.reduce(
        (total, contribution) => total + contribution.amount,
        0
      );

      const lotQuotas = activeFrom
        ? applicableQuotas.filter(
            (quota) => quota.dueDate && new Date(quota.dueDate) >= activeFrom
          )
        : applicableQuotas;

      // Calculate per-type quotas and contributions
      const maintenanceQuotas = lotQuotas
        .filter((quota) => quota.quotaType === "maintenance")
        .reduce((total, quota) => total + quota.amount, 0);
      const worksQuotas = lotQuotas
        .filter((quota) => quota.quotaType === "works")
        .reduce((total, quota) => total + quota.amount, 0);

      const maintenanceContributions = lotContributions
        .filter((c) => c.type === "maintenance")
        .reduce((total, c) => total + c.amount, 0);
      const worksContributions = lotContributions
        .filter((c) => c.type === "works")
        .reduce((total, c) => total + c.amount, 0);

      // Calculate total quotas applicable to this lot
      const totalQuotas = maintenanceQuotas + worksQuotas + lot.initialWorksDebt;

      // Each type is a separate obligation: overpayment in one type does not offset debt in another
      const maintenanceDebt = Math.max(0, maintenanceQuotas - maintenanceContributions);
      const worksDebt = Math.max(0, worksQuotas + lot.initialWorksDebt - worksContributions);
      const outstandingBalance = maintenanceDebt + worksDebt;

      // Determine status: only "current" (paid up) or "overdue" (owes money)
      const status: "current" | "overdue" =
        outstandingBalance <= 0 ? "current" : "overdue";

      return {
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        owner: lot.owner,
        totalContributions,
        totalQuotas: totalQuotas + lot.initialWorksDebt,
        initialWorksDebt: lot.initialWorksDebt,
        outstandingBalance,
        status,
      };
    });

  return lotBalances.sort(
    (first, second) => second.outstandingBalance - first.outstandingBalance
  );
}

/**
 * Calculates detailed debt breakdown for a specific lot
 * Provides separate calculations for maintenance and works debt types
 * @param lotWithContributions - Lot object including its contributions array
 * @param quotaConfigs - Array of quota configurations
 * @returns Detailed debt information or null if lot is exempt/not found
 */
export function calculateLotDebtDetail(
  lotWithContributions: any,
  quotaConfigs: any[]
): LotDebtDetail | null {
  if (!lotWithContributions) return null;

  // Return null for fully exempt lots (no exemptionEndDate means completely excluded)
  if (lotWithContributions.isExempt && !lotWithContributions.exemptionEndDate) return null;

  const currentDate = new Date();

  // Filter quotas that should be applied by now based on dueDate
  const applicableQuotas = quotaConfigs.filter((quota) => {
    if (quota.dueDate) {
      return new Date(quota.dueDate) <= currentDate;
    }
    return false;
  });

  // activeFrom limits which quotas apply, but all contributions count regardless of date
  const activeFrom = lotWithContributions.exemptionEndDate
    ? new Date(lotWithContributions.exemptionEndDate)
    : null;

  const lotQuotas = activeFrom
    ? applicableQuotas.filter(
        (quota) => quota.dueDate && new Date(quota.dueDate) >= activeFrom
      )
    : applicableQuotas;

  const lotContributions = lotWithContributions.contributions || [];

  // Calculate contributions by type
  const maintenanceContributions = lotContributions
    .filter((contribution: any) => contribution.type === "maintenance")
    .reduce((total: number, contribution: any) => total + contribution.amount, 0);

  const worksContributions = lotContributions
    .filter((contribution: any) => contribution.type === "works")
    .reduce((total: number, contribution: any) => total + contribution.amount, 0);

  const totalContributions = maintenanceContributions + worksContributions;

  // Calculate quotas by type
  const maintenanceQuotas = lotQuotas
    .filter((quota) => quota.quotaType === "maintenance")
    .reduce((total, quota) => total + quota.amount, 0);

  const worksQuotas = lotQuotas
    .filter((quota) => quota.quotaType === "works")
    .reduce((total, quota) => total + quota.amount, 0);

  // Calculate debt by type
  const maintenanceDebt = Math.max(
    0,
    maintenanceQuotas - maintenanceContributions
  );
  const worksDebt = Math.max(
    0,
    worksQuotas + lotWithContributions.initialWorksDebt - worksContributions
  );

  const totalQuotas =
    maintenanceQuotas + worksQuotas + lotWithContributions.initialWorksDebt;
  const totalDebt = maintenanceDebt + worksDebt;
  const outstandingBalance = totalDebt;

  const status: "current" | "overdue" =
    outstandingBalance <= 0 ? "current" : "overdue";

  return {
    lotId: lotWithContributions.id,
    initialWorksDebt: lotWithContributions.initialWorksDebt,
    maintenanceDebt,
    worksDebt,
    totalDebt,
    maintenanceContributions,
    worksContributions,
    totalContributions,
    totalQuotas,
    outstandingBalance,
    status,
  };
}

/**
 * Returns Tailwind CSS classes for styling payment status badges
 * @param status - The payment status of the lot
 * @returns CSS classes for background and text color
 */
export function getStatusColor(status: LotPaymentStatus): string {
  switch (status) {
    case "current":
      return "bg-green-100 text-green-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export interface QuotaLineStatus {
  id: string;
  label: string;
  quotaType: "maintenance" | "works" | "initial";
  amount: number;
  paidAmount: number;
  status: "paid" | "partial" | "owed";
  year?: number;
}

/**
 * Builds a per-quota paid/owed breakdown for a lot.
 * Uses oldest-debt-first allocation: contributions are applied to the earliest
 * quotas first. Works quotas include an optional initial-debt entry at the top.
 */
export function buildQuotaBreakdown(
  quotaConfigs: { id: string; quotaType: string; amount: number; description: string | null; dueDate: Date | null }[],
  contributions: { type: string; amount: number }[],
  lot: { initialWorksDebt: number; exemptionEndDate?: Date | string | null }
): QuotaLineStatus[] {
  const today = new Date();
  const activeFrom = lot.exemptionEndDate ? new Date(lot.exemptionEndDate) : null;

  // Include all quotas (past and future) so advance payments are allocated correctly.
  // Future unpaid quotas are filtered out at the end.
  const applicable = quotaConfigs.filter((q) => {
    if (!q.dueDate) return false;
    const due = new Date(q.dueDate);
    if (activeFrom && due < activeFrom) return false;
    return true;
  });

  const maintenanceQuotas = applicable
    .filter((q) => q.quotaType === "maintenance")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const worksQuotas = applicable
    .filter((q) => q.quotaType === "works")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const maintenancePaid = contributions
    .filter((c) => c.type === "maintenance")
    .reduce((s, c) => s + c.amount, 0);

  const worksPaid = contributions
    .filter((c) => c.type === "works")
    .reduce((s, c) => s + c.amount, 0);

  const result: QuotaLineStatus[] = [];

  // --- Maintenance ---
  let remaining = maintenancePaid;
  for (const q of maintenanceQuotas) {
    const label = q.description || formatQuotaDateLabel(q.dueDate!);
    const year = new Date(q.dueDate!).getFullYear();
    if (remaining >= q.amount) {
      result.push({ id: q.id, label, quotaType: "maintenance", amount: q.amount, paidAmount: q.amount, status: "paid", year });
      remaining -= q.amount;
    } else if (remaining > 0) {
      result.push({ id: q.id, label, quotaType: "maintenance", amount: q.amount, paidAmount: remaining, status: "partial", year });
      remaining = 0;
    } else {
      result.push({ id: q.id, label, quotaType: "maintenance", amount: q.amount, paidAmount: 0, status: "owed", year });
    }
  }

  // --- Works (initial debt first, then quotas) ---
  let remainingWorks = worksPaid;
  if (lot.initialWorksDebt > 0) {
    const debt = lot.initialWorksDebt;
    if (remainingWorks >= debt) {
      result.push({ id: "initial", label: "Saldo inicial", quotaType: "initial", amount: debt, paidAmount: debt, status: "paid" });
      remainingWorks -= debt;
    } else if (remainingWorks > 0) {
      result.push({ id: "initial", label: "Saldo inicial", quotaType: "initial", amount: debt, paidAmount: remainingWorks, status: "partial" });
      remainingWorks = 0;
    } else {
      result.push({ id: "initial", label: "Saldo inicial", quotaType: "initial", amount: debt, paidAmount: 0, status: "owed" });
    }
  }
  for (const q of worksQuotas) {
    const label = q.description || formatQuotaDateLabel(q.dueDate!);
    const year = new Date(q.dueDate!).getFullYear();
    if (remainingWorks >= q.amount) {
      result.push({ id: q.id, label, quotaType: "works", amount: q.amount, paidAmount: q.amount, status: "paid", year });
      remainingWorks -= q.amount;
    } else if (remainingWorks > 0) {
      result.push({ id: q.id, label, quotaType: "works", amount: q.amount, paidAmount: remainingWorks, status: "partial", year });
      remainingWorks = 0;
    } else {
      result.push({ id: q.id, label, quotaType: "works", amount: q.amount, paidAmount: 0, status: "owed", year });
    }
  }

  // Show all past/current-due quotas. For future quotas, only show if paid or
  // partially paid (i.e. the owner pre-paid in advance).
  const quotaMap = new Map(quotaConfigs.map((q) => [q.id, q]));
  return result.filter((item) => {
    if (item.id === "initial") return true;
    const quota = quotaMap.get(item.id);
    if (!quota?.dueDate) return true;
    const due = new Date(quota.dueDate);
    if (due <= today) return true;
    return item.status === "paid" || item.status === "partial";
  });
}

function formatQuotaDateLabel(dueDate: Date | string): string {
  const d = new Date(dueDate);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

