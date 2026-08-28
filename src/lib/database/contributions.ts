import type { Contribution as PrismaContribution } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { ApprovalStatus } from "@/types/approvals.types";
import { formatDateForStorage } from "@/lib/utils";

function toContribution(contribution: PrismaContribution): Contribution {
  return {
    ...contribution,
    type: contribution.type as ContributionType,
    date: formatDateForStorage(contribution.date),
    approvalStatus: contribution.approvalStatus as ApprovalStatus,
    approvedAt: contribution.approvedAt
      ? contribution.approvedAt.toISOString()
      : null,
  };
}

/**
 * Retrieves all contributions (income) from the database.
 *
 * @returns Array of all contributions ordered by ID (newest first)
 * @example
 * const contributions = await getContributions();
 */
export async function getContributions(): Promise<Contribution[]> {
  try {
    const contributions = await prisma.contribution.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return contributions.map(toContribution);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return [];
  }
}

/**
 * Retrieves a single contribution by its ID.
 *
 * @param id - The unique identifier of the contribution
 * @returns Contribution object or null if not found
 * @example
 * const contribution = await getContributionById(123);
 */
export async function getContributionById(
  id: number
): Promise<Contribution | null> {
  try {
    const contribution = await prisma.contribution.findUnique({
      where: { id },
    });
    if (!contribution) return null;
    return toContribution(contribution);
  } catch (error) {
    console.error("Error fetching contribution by id:", error);
    return null;
  }
}

/**
 * Creates a new contribution (income) record.
 * Handles date parsing to avoid timezone issues.
 *
 * @param data - Contribution data including lot, type, amount, date, and optional receipt info
 * @returns Created contribution or null on error
 * @example
 * const contribution = await createContribution({
 *   lotId: "LOT-001",
 *   type: "maintenance",
 *   amount: 5000,
 *   date: "2024-01-15",
 *   description: "Monthly maintenance fee",
 *   receiptNumber: "REC-001"
 * });
 */
export async function createContribution(data: {
  lotId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}): Promise<Contribution | null> {
  try {
    let date: Date;
    if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.date.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(data.date);
    }

    const contribution = await prisma.contribution.create({
      data: {
        ...data,
        date,
      },
    });
    return toContribution(contribution);
  } catch (error) {
    console.error("Error creating contribution:", error);
    return null;
  }
}

/**
 * Updates an existing contribution record.
 * Handles date parsing to avoid timezone issues.
 *
 * @param id - The unique identifier of the contribution to update
 * @param data - Updated contribution data (all fields optional)
 * @returns Updated contribution or null on error
 * @example
 * const updated = await updateContribution(123, {
 *   amount: 6000,
 *   description: "Updated maintenance fee"
 * });
 */
export async function updateContribution(
  id: number,
  data: {
    lotId?: string;
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
    receiptNumber?: string | null;
    receiptFileId?: string | null;
    receiptFileUrl?: string | null;
    receiptFileName?: string | null;
  }
): Promise<Contribution | null> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    if (data.date) {
      if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split("-").map(Number);
        updateData.date = new Date(year, month - 1, day);
      } else {
        updateData.date = new Date(data.date);
      }
    }
    const contribution = await prisma.contribution.update({
      where: { id },
      data: updateData,
    });
    return toContribution(contribution);
  } catch (error) {
    console.error("Error updating contribution:", error);
    return null;
  }
}

/**
 * Deletes a contribution record from the database.
 *
 * @param id - The unique identifier of the contribution to delete
 * @returns true if successful, false on error
 * @example
 * const success = await deleteContribution(123);
 */
export async function deleteContribution(id: number): Promise<boolean> {
  try {
    await prisma.contribution.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return false;
  }
}

/**
 * Marks a contribution as approved by the Treasurer.
 * Writes an ApprovalHistory row in the same transaction as the update.
 *
 * @param id - The contribution to approve
 * @param treasurerEmail - Email of the treasurer approving it
 * @param note - Optional note explaining the approval
 */
export async function approveContribution(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<Contribution | null> {
  try {
    const [contribution] = await prisma.$transaction([
      prisma.contribution.update({
        where: { id },
        data: {
          approvalStatus: "approved",
          approvalNote: note || null,
          approvedBy: treasurerEmail,
          approvedAt: new Date(),
        },
      }),
      prisma.approvalHistory.create({
        data: {
          recordType: "contribution",
          recordId: id,
          action: "approved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toContribution(contribution);
  } catch (error) {
    console.error("Error approving contribution:", error);
    return null;
  }
}

/**
 * Marks a contribution as rejected by the Treasurer. A note explaining
 * what's wrong is required so Admin knows what to fix.
 *
 * @param id - The contribution to reject
 * @param treasurerEmail - Email of the treasurer rejecting it
 * @param note - Required note explaining the rejection
 */
export async function rejectContribution(
  id: number,
  treasurerEmail: string,
  note: string
): Promise<Contribution | null> {
  try {
    const [contribution] = await prisma.$transaction([
      prisma.contribution.update({
        where: { id },
        data: {
          approvalStatus: "rejected",
          approvalNote: note,
          approvedBy: treasurerEmail,
          approvedAt: new Date(),
        },
      }),
      prisma.approvalHistory.create({
        data: {
          recordType: "contribution",
          recordId: id,
          action: "rejected",
          treasurerEmail,
          note,
        },
      }),
    ]);
    return toContribution(contribution);
  } catch (error) {
    console.error("Error rejecting contribution:", error);
    return null;
  }
}

/**
 * Reverses a Treasurer's approval, sending the contribution back to
 * `pending`. Treasurer-exclusive: undoing a wrong approval is not the
 * same as Admin editing content (see docs/SPEC-TREASURER-ROLE.md, 7.2).
 *
 * @param id - The contribution to un-approve
 * @param treasurerEmail - Email of the treasurer un-approving it
 * @param note - Optional note explaining why
 */
export async function unapproveContribution(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<Contribution | null> {
  try {
    const [contribution] = await prisma.$transaction([
      prisma.contribution.update({
        where: { id },
        data: {
          approvalStatus: "pending",
          approvalNote: note || null,
          approvedBy: null,
          approvedAt: null,
        },
      }),
      prisma.approvalHistory.create({
        data: {
          recordType: "contribution",
          recordId: id,
          action: "unapproved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toContribution(contribution);
  } catch (error) {
    console.error("Error unapproving contribution:", error);
    return null;
  }
}

/**
 * Resets a `rejected` contribution back to `pending` after Admin edits it.
 * This automatic resubmit intentionally does not write an ApprovalHistory
 * row — see docs/SPEC-TREASURER-ROLE.md, section 12.
 */
export async function resetContributionToPending(
  id: number
): Promise<boolean> {
  try {
    await prisma.contribution.update({
      where: { id },
      data: {
        approvalStatus: "pending",
        approvalNote: null,
        approvedBy: null,
        approvedAt: null,
      },
    });
    return true;
  } catch (error) {
    console.error("Error resetting contribution to pending:", error);
    return false;
  }
}

/**
 * Retrieves all contributions for a specific lot.
 *
 * @param lotId - The unique identifier of the lot
 * @returns Array of contributions for the lot, ordered by ID (newest first)
 * @example
 * const lotContributions = await getContributionsByLot("LOT-001");
 */
export async function getContributionsByLot(
  lotId: string
): Promise<Contribution[]> {
  try {
    const contributions = await prisma.contribution.findMany({
      where: { lotId },
      orderBy: {
        id: "desc",
      },
    });
    return contributions.map(toContribution);
  } catch (error) {
    console.error("Error fetching contributions by lot:", error);
    return [];
  }
}

/**
 * Retrieves all contributions filtered by type.
 *
 * @param type - The contribution type (maintenance, works, or others)
 * @returns Array of contributions of the specified type, ordered by ID (newest first)
 * @example
 * const maintenanceContributions = await getContributionsByType("maintenance");
 */
export async function getContributionsByType(
  type: string
): Promise<Contribution[]> {
  try {
    const contributions = await prisma.contribution.findMany({
      where: { type },
      orderBy: {
        id: "desc",
      },
    });
    return contributions.map(toContribution);
  } catch (error) {
    console.error("Error fetching contributions by type:", error);
    return [];
  }
}

/**
 * Calculates the total income (sum of contributions) for a specific type.
 * Used by balance calculations to determine fund-specific income totals.
 *
 * @param type - The contribution type (maintenance, works, or others)
 * @returns Total amount of contributions for the specified type
 * @example
 * const maintenanceIncome = await getIncomeByType("maintenance");
 * // Returns: 50000
 */
export async function getIncomeByType(type: ContributionType): Promise<number> {
  try {
    const result = await prisma.contribution.aggregate({
      where: { type },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error(`Error calculating income for type ${type}:`, error);
    return 0;
  }
}
