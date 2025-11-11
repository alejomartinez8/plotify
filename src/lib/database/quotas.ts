import prisma from "@/lib/prisma";

export interface QuotaConfig {
  id: string;
  quotaType: string;
  amount: number;
  description: string | null;
  dueDate: Date | null;
}

/**
 * Retrieves all quota configurations from the database.
 * Quotas define the expected payment amounts for different contribution types.
 *
 * @returns Array of quota configurations ordered by due date and type
 * @example
 * const quotas = await getQuotaConfigs();
 */
export async function getQuotaConfigs(): Promise<QuotaConfig[]> {
  try {
    const quotas = await prisma.quotaConfig.findMany({
      orderBy: [{ dueDate: "asc" }, { quotaType: "asc" }],
    });
    return quotas;
  } catch (error) {
    console.error("Error fetching quota configs:", error);
    return [];
  }
}

/**
 * Creates a new quota configuration.
 * Automatically sets the year to the current year.
 *
 * @param data - Quota configuration data including type, amount, optional description and due date
 * @returns Created quota configuration or null on error
 * @example
 * const quota = await createQuotaConfig({
 *   quotaType: "maintenance",
 *   amount: 5000,
 *   description: "Monthly maintenance fee",
 *   dueDate: new Date("2024-01-15")
 * });
 */
export async function createQuotaConfig(data: {
  quotaType: string;
  amount: number;
  description?: string | null;
  dueDate?: Date | null;
}): Promise<QuotaConfig | null> {
  try {
    const quota = await prisma.quotaConfig.create({
      data: {
        quotaType: data.quotaType,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
        year: new Date().getFullYear(),
      },
    });
    return quota;
  } catch (error) {
    console.error("Error creating quota config:", error);
    return null;
  }
}

/**
 * Updates an existing quota configuration.
 *
 * @param id - The unique identifier of the quota configuration to update
 * @param data - Updated quota data (all fields optional)
 * @returns Updated quota configuration or null on error
 * @example
 * const updated = await updateQuotaConfig("abc123", {
 *   amount: 6000,
 *   description: "Updated maintenance fee"
 * });
 */
export async function updateQuotaConfig(
  id: string,
  data: {
    quotaType?: string;
    amount?: number;
    description?: string | null;
    dueDate?: Date | null;
  }
): Promise<QuotaConfig | null> {
  try {
    const quota = await prisma.quotaConfig.update({
      where: { id },
      data: {
        ...(data.quotaType && { quotaType: data.quotaType }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      },
    });
    return quota;
  } catch (error) {
    console.error("Error updating quota config:", error);
    return null;
  }
}

/**
 * Deletes a quota configuration from the database.
 *
 * @param id - The unique identifier of the quota configuration to delete
 * @returns true if successful, false on error
 * @example
 * const success = await deleteQuotaConfig("abc123");
 */
export async function deleteQuotaConfig(id: string): Promise<boolean> {
  try {
    await prisma.quotaConfig.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting quota config:", error);
    return false;
  }
}

/**
 * Retrieves quota configurations filtered by year and type.
 * Filters quotas whose due date falls within the specified year.
 *
 * @param year - The year to filter quotas by (e.g., 2024)
 * @param quotaType - The quota type (maintenance, works, or others)
 * @returns Array of quota configurations matching the criteria, ordered by due date
 * @example
 * const quotas2024 = await getQuotasByYearAndType(2024, "maintenance");
 */
export async function getQuotasByYearAndType(
  year: number,
  quotaType: string
): Promise<QuotaConfig[]> {
  try {
    const quotas = await prisma.quotaConfig.findMany({
      where: {
        quotaType,
        dueDate: {
          gte: new Date(year, 0, 1), // January 1st of the year
          lt: new Date(year + 1, 0, 1), // January 1st of next year
        },
      },
      orderBy: { dueDate: "asc" },
    });
    return quotas;
  } catch (error) {
    console.error("Error fetching quotas by year and type:", error);
    return [];
  }
}
