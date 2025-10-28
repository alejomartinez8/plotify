import prisma from "@/lib/prisma";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { formatDateForStorage } from "@/lib/utils";

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
    // Parse date as local date to avoid timezone issues
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
      // Parse date as local date to avoid timezone issues
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

export async function getExpensesByType(
  type: ContributionType
): Promise<number> {
  try {
    const result = await prisma.expense.aggregate({
      where: { type },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error(`Error calculating expenses for type ${type}:`, error);
    return 0;
  }
}

export async function getFundBalance(
  type: ContributionType
): Promise<{ income: number; expenses: number; balance: number }> {
  try {
    const [income, expenses] = await Promise.all([
      getIncomeByType(type),
      getExpensesByType(type),
    ]);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  } catch (error) {
    console.error(`Error calculating fund balance for type ${type}:`, error);
    return { income: 0, expenses: 0, balance: 0 };
  }
}

export async function getAllFundsBalances(): Promise<{
  maintenance: { income: number; expenses: number; balance: number };
  works: { income: number; expenses: number; balance: number };
  others: { income: number; expenses: number; balance: number };
  consolidated: { income: number; expenses: number; balance: number };
}> {
  try {
    const [maintenance, works, others] = await Promise.all([
      getFundBalance("maintenance"),
      getFundBalance("works"),
      getFundBalance("others"),
    ]);

    const consolidated = {
      income: maintenance.income + works.income + others.income,
      expenses: maintenance.expenses + works.expenses + others.expenses,
      balance: maintenance.balance + works.balance + others.balance,
    };

    return {
      maintenance,
      works,
      others,
      consolidated,
    };
  } catch (error) {
    console.error("Error calculating all funds balances:", error);
    return {
      maintenance: { income: 0, expenses: 0, balance: 0 },
      works: { income: 0, expenses: 0, balance: 0 },
      others: { income: 0, expenses: 0, balance: 0 },
      consolidated: { income: 0, expenses: 0, balance: 0 },
    };
  }
}
