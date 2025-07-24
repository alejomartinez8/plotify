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
    return contributions.map(contribution => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date)
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
      date: formatDateForStorage(contribution.date)
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
}): Promise<Contribution | null> {
  try {
    // Parse date as local date to avoid timezone issues
    let date: Date;
    if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.date.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(data.date);
    }
    
    const contribution = await prisma.contribution.create({
      data: {
        ...data,
        date
      },
    });
    return {
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date)
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
  }
): Promise<Contribution | null> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    if (data.date) {
      // Parse date as local date to avoid timezone issues
      if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = data.date.split('-').map(Number);
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
      date: formatDateForStorage(contribution.date)
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
    return contributions.map(contribution => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date)
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
    return contributions.map(contribution => ({
      ...contribution,
      type: contribution.type as ContributionType,
      date: formatDateForStorage(contribution.date)
    }));
  } catch (error) {
    console.error("Error fetching contributions by type:", error);
    return [];
  }
}
