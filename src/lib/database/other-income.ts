import type { OtherIncome as PrismaOtherIncome } from "@prisma/client";
import prisma from "@/lib/prisma";
import { OtherIncome } from "@/types/other-income.types";
import { ContributionType } from "@/types/contributions.types";
import { ApprovalStatus } from "@/types/approvals.types";
import { formatDateForStorage } from "@/lib/utils";

function toOtherIncome(otherIncome: PrismaOtherIncome): OtherIncome {
  return {
    ...otherIncome,
    type: otherIncome.type as ContributionType,
    date: formatDateForStorage(otherIncome.date),
    approvalStatus: otherIncome.approvalStatus as ApprovalStatus,
    approvedAt: otherIncome.approvedAt
      ? otherIncome.approvedAt.toISOString()
      : null,
  };
}

export async function getOtherIncomes(): Promise<OtherIncome[]> {
  try {
    const otherIncomes = await prisma.otherIncome.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return otherIncomes.map(toOtherIncome);
  } catch (error) {
    console.error("Error fetching other incomes:", error);
    return [];
  }
}

export async function getOtherIncomeById(
  id: number
): Promise<OtherIncome | null> {
  try {
    const otherIncome = await prisma.otherIncome.findUnique({
      where: { id },
    });
    if (!otherIncome) return null;
    return toOtherIncome(otherIncome);
  } catch (error) {
    console.error("Error fetching other income by id:", error);
    return null;
  }
}

export async function createOtherIncome(data: {
  type: string;
  amount: number;
  date: string;
  description: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}): Promise<OtherIncome | null> {
  try {
    const otherIncome = await prisma.otherIncome.create({
      data,
    });
    return toOtherIncome(otherIncome);
  } catch (error) {
    console.error("Error creating other income:", error);
    return null;
  }
}

export async function updateOtherIncome(
  id: number,
  data: {
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
    receiptNumber?: string | null;
    receiptFileId?: string | null;
    receiptFileUrl?: string | null;
    receiptFileName?: string | null;
  }
): Promise<OtherIncome | null> {
  try {
    const otherIncome = await prisma.otherIncome.update({
      where: { id },
      data,
    });
    return toOtherIncome(otherIncome);
  } catch (error) {
    console.error("Error updating other income:", error);
    return null;
  }
}

export async function deleteOtherIncome(id: number): Promise<boolean> {
  try {
    await prisma.otherIncome.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting other income:", error);
    return false;
  }
}

/**
 * Marks an other income record as approved by the Treasurer.
 * Writes an ApprovalHistory row in the same transaction as the update.
 */
export async function approveOtherIncome(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<OtherIncome | null> {
  try {
    const [otherIncome] = await prisma.$transaction([
      prisma.otherIncome.update({
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
          recordType: "otherIncome",
          recordId: id,
          action: "approved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toOtherIncome(otherIncome);
  } catch (error) {
    console.error("Error approving other income:", error);
    return null;
  }
}

/**
 * Reverses a Treasurer's approval, sending the other income record back to
 * `pending`.
 */
export async function unapproveOtherIncome(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<OtherIncome | null> {
  try {
    const [otherIncome] = await prisma.$transaction([
      prisma.otherIncome.update({
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
          recordType: "otherIncome",
          recordId: id,
          action: "unapproved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toOtherIncome(otherIncome);
  } catch (error) {
    console.error("Error unapproving other income:", error);
    return null;
  }
}

export async function getTotalOtherIncome(): Promise<number> {
  try {
    const result = await prisma.otherIncome.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error("Error calculating total other income:", error);
    return 0;
  }
}

export async function getTotalOtherIncomeByType(
  type: ContributionType
): Promise<number> {
  try {
    const result = await prisma.otherIncome.aggregate({
      where: { type },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error(
      `Error calculating total other income for type ${type}:`,
      error
    );
    return 0;
  }
}
