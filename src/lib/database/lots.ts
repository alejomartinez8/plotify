import prisma from "@/lib/prisma";
import { Lot } from "@/types/lots.types";

/**
 * Retrieves all lots from the database.
 *
 * @returns Array of all lots ordered by lot number
 * @example
 * const lots = await getLots();
 */
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

/**
 * Retrieves a single lot by its ID.
 *
 * @param id - The unique identifier of the lot
 * @returns Lot object or null if not found
 * @example
 * const lot = await getLotById("abc123");
 */
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

/**
 * Creates a new lot record.
 *
 * @param data - Lot data including lot number, owner, optional email, initial debt, and exemption info
 * @returns Created lot or null on error
 * @example
 * const lot = await createLot({
 *   lotNumber: "LOT-001",
 *   owner: "John Doe",
 *   ownerEmail: "john@example.com",
 *   initialWorksDebt: 5000,
 *   isExempt: false
 * });
 */
export async function createLot(data: {
  lotNumber: string;
  owner: string;
  ownerEmail?: string | null;
  initialWorksDebt?: number;
  isExempt?: boolean;
  exemptionReason?: string | null;
}): Promise<Lot | null> {
  try {
    const lot = await prisma.lot.create({
      data: {
        lotNumber: data.lotNumber,
        owner: data.owner,
        ownerEmail: data.ownerEmail || null,
        initialWorksDebt: data.initialWorksDebt || 0,
        isExempt: data.isExempt || false,
        exemptionReason: data.exemptionReason || null,
      },
    });
    return lot;
  } catch (error) {
    console.error("Error creating lot:", error);
    return null;
  }
}

/**
 * Updates an existing lot record.
 *
 * @param id - The unique identifier of the lot to update
 * @param data - Updated lot data (all fields optional)
 * @returns Updated lot or null on error
 * @example
 * const updated = await updateLot("abc123", {
 *   owner: "Jane Doe",
 *   initialWorksDebt: 6000
 * });
 */
export async function updateLot(
  id: string,
  data: {
    lotNumber?: string;
    owner?: string;
    ownerEmail?: string | null;
    initialWorksDebt?: number;
    isExempt?: boolean;
    exemptionReason?: string | null;
  }
): Promise<Lot | null> {
  try {
    const lot = await prisma.lot.update({
      where: { id },
      data: {
        ...(data.lotNumber && { lotNumber: data.lotNumber }),
        ...(data.owner && { owner: data.owner }),
        ...(data.ownerEmail !== undefined && { ownerEmail: data.ownerEmail }),
        ...(data.initialWorksDebt !== undefined && {
          initialWorksDebt: data.initialWorksDebt,
        }),
        ...(data.isExempt !== undefined && { isExempt: data.isExempt }),
        ...(data.exemptionReason !== undefined && {
          exemptionReason: data.exemptionReason,
        }),
      },
    });
    return lot;
  } catch (error) {
    console.error("Error updating lot:", error);
    return null;
  }
}

/**
 * Deletes a lot record from the database.
 *
 * @param id - The unique identifier of the lot to delete
 * @returns true if successful, false on error
 * @example
 * const success = await deleteLot("abc123");
 */
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

/**
 * Retrieves a lot with all its associated contributions.
 *
 * @param id - The unique identifier of the lot
 * @returns Lot object with contributions array or null if not found
 * @example
 * const lotWithData = await getLotWithContributions("abc123");
 * // Returns: { id: "abc123", lotNumber: "001", ..., contributions: [...] }
 */
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

/**
 * Retrieves a lot with all its associated contributions by lot number.
 *
 * @param lotNumber - The lot number (e.g., "LOT-001")
 * @returns Lot object with contributions array or null if not found
 * @example
 * const lotWithData = await getLotWithContributionsByNumber("LOT-001");
 */
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
