import prisma from "@/lib/prisma";
import { Lot } from "@/types/lots.types";

export async function getLots(): Promise<Lot[]> {
  try {
    const lots = await prisma.lot.findMany({
      orderBy: {
        lotNumber: "asc",
      },
    });
    return lots;
  } catch (error) {
    console.error("Error fetching lots:", error);
    return [];
  }
}

export async function getLotById(id: string): Promise<Lot | null> {
  try {
    const lot = await prisma.lot.findUnique({
      where: { id },
    });
    return lot;
  } catch (error) {
    console.error("Error fetching lot by id:", error);
    return null;
  }
}

export async function createLot(data: {
  lotNumber: string;
  owner: string;
}): Promise<Lot | null> {
  try {
    const lot = await prisma.lot.create({
      data: {
        lotNumber: data.lotNumber,
        owner: data.owner,
      },
    });
    return lot;
  } catch (error) {
    console.error("Error creating lot:", error);
    return null;
  }
}

export async function updateLot(
  id: string,
  data: { lotNumber?: string; owner?: string }
): Promise<Lot | null> {
  try {
    const lot = await prisma.lot.update({
      where: { id },
      data: {
        ...(data.lotNumber && { lotNumber: data.lotNumber }),
        ...(data.owner && { owner: data.owner }),
      },
    });
    return lot;
  } catch (error) {
    console.error("Error updating lot:", error);
    return null;
  }
}

export async function deleteLot(id: string): Promise<boolean> {
  try {
    await prisma.lot.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting lot:", error);
    return false;
  }
}

export async function getLotWithContributions(id: string) {
  try {
    const lot = await prisma.lot.findUnique({
      where: { id },
      include: {
        contributions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });
    return lot;
  } catch (error) {
    console.error("Error fetching lot with contributions:", error);
    return null;
  }
}

export async function getLotWithContributionsByNumber(lotNumber: string) {
  try {
    const lot = await prisma.lot.findUnique({
      where: { lotNumber },
      include: {
        contributions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });
    return lot;
  } catch (error) {
    console.error("Error fetching lot with contributions by number:", error);
    return null;
  }
}
