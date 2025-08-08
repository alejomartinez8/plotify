/**
 * Represents a simplified lot balance calculation for quota tracking
 */
export interface SimpleLotBalance {
  /** Unique identifier of the lot */
  lotId: string;
  /** Display number of the lot */
  lotNumber: string;
  /** Name of the lot owner */
  owner: string;
  /** Total amount of contributions made by the lot */
  totalContributions: number;
  /** Total amount of quotas assigned to the lot */
  totalQuotas: number;
  /** Initial debt from works before quota system */
  initialWorksDebt: number;
  /** Outstanding balance owed (0 if paid in advance) */
  outstandingBalance: number;
  /** Payment status of the lot */
  status: "current" | "overdue";
}

/**
 * Detailed debt breakdown for a specific lot
 */
export interface LotDebtDetail {
  /** Unique identifier of the lot */
  lotId: string;
  /** Initial debt from works before quota system */
  initialWorksDebt: number;
  /** Outstanding debt for maintenance quotas */
  maintenanceDebt: number;
  /** Outstanding debt for works quotas */
  worksDebt: number;
  /** Total debt owed (maintenance + works) */
  totalDebt: number;
  /** Total contributions made by the lot */
  totalContributions: number;
  /** Total quotas assigned to the lot */
  totalQuotas: number;
  /** Outstanding balance owed (0 if paid in advance) */
  outstandingBalance: number;
  /** Payment status of the lot */
  status: "current" | "overdue";
}

/**
 * Payment status type for lots
 */
export type LotPaymentStatus = "current" | "overdue";