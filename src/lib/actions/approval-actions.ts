"use server";

import { revalidatePath } from "next/cache";
import {
  approveContribution,
  unapproveContribution,
} from "@/lib/database/contributions";
import { approveExpense, unapproveExpense } from "@/lib/database/expenses";
import { getApprovalHistory } from "@/lib/database/approval-history";
import { ApprovalHistoryEntry, ApprovalRecordType } from "@/types/approvals.types";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";
import { getUserEmail, isAdmin, isTreasurer } from "@/lib/auth";
import { checkTreasurerAccess } from "./helpers";

export type ApprovalActionState = {
  message?: string | null;
  success?: boolean;
};

/**
 * Shared plumbing for approve/unapprove: checks treasurer access,
 * resolves the acting treasurer's email, runs the DB call, and
 * revalidates. `perform` receives the treasurer's email and does the
 * actual approve/unapprove DB call.
 */
async function runApprovalAction(
  actionName: string,
  revalidatePaths: string[],
  successMessage: string,
  errorMessage: string,
  perform: (treasurerEmail: string) => Promise<unknown>
): Promise<ApprovalActionState> {
  const actionTimer = logger.timer(actionName);

  const treasurerError = await checkTreasurerAccess<ApprovalActionState>(
    actionTimer,
    translations.errors.treasurerAccessRequired
  );
  if (treasurerError) return treasurerError;

  try {
    const treasurerEmail = await getUserEmail();
    if (!treasurerEmail) {
      throw new Error("Treasurer email not found in session");
    }

    const result = await perform(treasurerEmail);
    if (!result) {
      actionTimer.end();
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    logger.error(
      actionName,
      error instanceof Error ? error : new Error(String(error)),
      { component: actionName }
    );
    actionTimer.end();
    return { success: false, message: errorMessage };
  }

  revalidatePaths.forEach((path) => revalidatePath(path));
  actionTimer.end();
  return { success: true, message: successMessage };
}

export async function approveContributionAction(
  id: number,
  note?: string
): Promise<ApprovalActionState> {
  return runApprovalAction(
    "Approve Contribution Action",
    ["/income", "/"],
    translations.messages.approvedSuccess,
    `${translations.errors.database}: Failed to approve contribution.`,
    (treasurerEmail) => approveContribution(id, treasurerEmail, note || null)
  );
}

export async function unapproveContributionAction(
  id: number,
  note?: string
): Promise<ApprovalActionState> {
  return runApprovalAction(
    "Unapprove Contribution Action",
    ["/income", "/"],
    translations.messages.unapprovedSuccess,
    `${translations.errors.database}: Failed to unapprove contribution.`,
    (treasurerEmail) => unapproveContribution(id, treasurerEmail, note || null)
  );
}

export async function approveExpenseAction(
  id: number,
  note?: string
): Promise<ApprovalActionState> {
  return runApprovalAction(
    "Approve Expense Action",
    ["/expenses", "/"],
    translations.messages.approvedSuccess,
    `${translations.errors.database}: Failed to approve expense.`,
    (treasurerEmail) => approveExpense(id, treasurerEmail, note || null)
  );
}

export async function unapproveExpenseAction(
  id: number,
  note?: string
): Promise<ApprovalActionState> {
  return runApprovalAction(
    "Unapprove Expense Action",
    ["/expenses", "/"],
    translations.messages.unapprovedSuccess,
    `${translations.errors.database}: Failed to unapprove expense.`,
    (treasurerEmail) => unapproveExpense(id, treasurerEmail, note || null)
  );
}

/**
 * Read-only: fetches the audit trail for a single record. Visible to
 * Admin and Treasurer only (docs/SPEC-TREASURER-ROLE.md, 9.1).
 */
export async function getApprovalHistoryAction(
  recordType: ApprovalRecordType,
  recordId: number
): Promise<ApprovalHistoryEntry[]> {
  const [admin, treasurer] = await Promise.all([isAdmin(), isTreasurer()]);
  if (!admin && !treasurer) {
    return [];
  }

  return getApprovalHistory(recordType, recordId);
}
