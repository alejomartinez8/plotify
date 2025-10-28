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
    .filter((lot) => !lot.isExempt) // Exclude exempt lots from debt calculations
    .map((lot) => {
      const lotContributions = contributions.filter((c) => c.lotId === lot.id);
      const totalContributions = lotContributions.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      // Calculate total quotas applicable to this lot
      const totalQuotas = applicableQuotas.reduce(
        (sum, quota) => sum + quota.amount,
        0
      );

      // Calculate balance: quotas + initial debt - contributions
      const balance = totalQuotas + lot.initialWorksDebt - totalContributions;

      // Outstanding balance: only show debt owed (0 if paid in advance)
      const outstandingBalance = Math.max(0, balance);

      // Determine status: only "current" (paid up) or "overdue" (owes money)
      const status: "current" | "overdue" =
        balance <= 0 ? "current" : "overdue";

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
    (a, b) => b.outstandingBalance - a.outstandingBalance
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

  // Return null for exempt lots (they don't have debt calculations)
  if (lotWithContributions.isExempt) return null;

  const currentDate = new Date();

  // Filter quotas that should be applied by now based on dueDate
  const applicableQuotas = quotaConfigs.filter((quota) => {
    if (quota.dueDate) {
      return new Date(quota.dueDate) <= currentDate;
    }
    return false;
  });

  const lotContributions = lotWithContributions.contributions || [];

  // Calculate contributions by type
  const maintenanceContributions = lotContributions
    .filter((c: any) => c.type === "maintenance")
    .reduce((sum: number, c: any) => sum + c.amount, 0);

  const worksContributions = lotContributions
    .filter((c: any) => c.type === "works")
    .reduce((sum: number, c: any) => sum + c.amount, 0);

  const totalContributions = maintenanceContributions + worksContributions;

  // Calculate quotas by type
  const maintenanceQuotas = applicableQuotas
    .filter((q) => q.quotaType === "maintenance")
    .reduce((sum, q) => sum + q.amount, 0);

  const worksQuotas = applicableQuotas
    .filter((q) => q.quotaType === "works")
    .reduce((sum, q) => sum + q.amount, 0);

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
  const outstandingBalance = Math.max(0, totalQuotas - totalContributions);

  const status: "current" | "overdue" =
    outstandingBalance <= 0 ? "current" : "overdue";

  return {
    lotId: lotWithContributions.id,
    initialWorksDebt: lotWithContributions.initialWorksDebt,
    maintenanceDebt,
    worksDebt,
    totalDebt,
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

