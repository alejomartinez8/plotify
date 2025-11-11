import prisma from "@/lib/prisma";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { formatDateForStorage } from "@/lib/utils";

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
    return contributions.map((contribution) => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    }));
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
    return {
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    };
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
    return {
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    };
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
    return {
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    };
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
    return contributions.map((contribution) => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    }));
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
    return contributions.map((contribution) => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date),
    }));
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
