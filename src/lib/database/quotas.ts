import prisma from "@/lib/prisma";

export interface MonthlyMaintenanceQuota {
  id: number;
  year: number;
  monthlyAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllQuotas(): Promise<MonthlyMaintenanceQuota[]> {
  try {
    const quotas = await prisma.monthlyMaintenanceQuota.findMany({
      orderBy: {
        year: "desc",
      },
    });
    return quotas;
  } catch (error) {
    console.error("Error fetching quotas:", error);
    return [];
  }
}

export async function getQuotaForYear(
  year: number
): Promise<MonthlyMaintenanceQuota | null> {
  try {
    const quota = await prisma.monthlyMaintenanceQuota.findUnique({
      where: { year },
    });
    return quota;
  } catch (error) {
    console.error("Error fetching quota for year:", error);
    return null;
  }
}

export async function getCurrentYearQuota(): Promise<MonthlyMaintenanceQuota | null> {
  const currentYear = new Date().getFullYear();
  return await getQuotaForYear(currentYear);
}

export async function createOrUpdateQuota(
  year: number,
  monthlyAmount: number
): Promise<MonthlyMaintenanceQuota> {
  return await prisma.monthlyMaintenanceQuota.upsert({
    where: {
      year: year,
    },
    update: {
      monthlyAmount: monthlyAmount,
    },
    create: {
      year: year,
      monthlyAmount: monthlyAmount,
    },
  });
}
