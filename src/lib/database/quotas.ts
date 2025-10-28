import prisma from "@/lib/prisma";

export interface QuotaConfig {
  id: string;
  quotaType: string;
  amount: number;
  description: string | null;
  dueDate: Date | null;
}

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
