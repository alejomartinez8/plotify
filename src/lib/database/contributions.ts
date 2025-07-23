import prisma from "@/lib/prisma";
import { Contribution } from "@/types/contributions.types";

export async function getContributions(): Promise<Contribution[]> {
  try {
    const contributions = await prisma.contribution.findMany({
      orderBy: {
        date: "desc",
      },
    });
    return contributions as Contribution[];
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
    return contribution as Contribution | null;
  } catch (error) {
    console.error("Error fetching contribution by id:", error);
    return null;
  }
}

export async function createContribution(data: {
  lotId: string;
  type: string;
  amount: number;
  date: Date;
  description: string;
}): Promise<Contribution | null> {
  try {
    const contribution = await prisma.contribution.create({
      data,
    });
    return contribution as Contribution;
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
    date?: Date;
    description?: string;
  }
): Promise<Contribution | null> {
  try {
    const contribution = await prisma.contribution.update({
      where: { id },
      data,
    });
    return contribution as Contribution;
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
        date: "desc",
      },
    });
    return contributions as Contribution[];
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
        date: "desc",
      },
    });
    return contributions as Contribution[];
  } catch (error) {
    console.error("Error fetching contributions by type:", error);
    return [];
  }
}
