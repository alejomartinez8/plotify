import prisma from "@/lib/prisma";
import { Treasurer } from "@/types/treasurers.types";

/**
 * Retrieves all registered treasurers (email whitelist), newest first.
 */
export async function getTreasurers(): Promise<Treasurer[]> {
  try {
    const treasurers = await prisma.treasurer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return treasurers.map((treasurer) => ({
      ...treasurer,
      createdAt: treasurer.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching treasurers:", error);
    return [];
  }
}

/**
 * Registers a new treasurer email.
 */
export async function createTreasurer(data: {
  email: string;
  name?: string | null;
}): Promise<Treasurer | null> {
  try {
    const treasurer = await prisma.treasurer.create({
      data: {
        email: data.email,
        name: data.name || null,
      },
    });
    return {
      ...treasurer,
      createdAt: treasurer.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Error creating treasurer:", error);
    return null;
  }
}

/**
 * Removes a treasurer from the whitelist.
 */
export async function deleteTreasurer(id: string): Promise<boolean> {
  try {
    await prisma.treasurer.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting treasurer:", error);
    return false;
  }
}
