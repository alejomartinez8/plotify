"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrUpdateQuota, getAllQuotas, getQuotaForYear, getCurrentYearQuota } from "@/lib/database/quotas";

const quotaSchema = z.object({
  year: z.number().min(2020).max(2050),
  monthlyAmount: z.number().positive(),
});

export type QuotaState = {
  errors: Record<string, string[]>;
  message: string;
};

export async function createOrUpdateQuotaAction(
  prevState: QuotaState,
  formData: FormData
): Promise<QuotaState> {
  const data = {
    year: parseInt(formData.get("year") as string),
    monthlyAmount: Math.round(parseFloat(formData.get("monthlyAmount") as string) * 100), // Convert to cents
  };

  const validated = quotaSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación",
    };
  }

  try {
    await createOrUpdateQuota(validated.data.year, validated.data.monthlyAmount);

    revalidatePath("/maintenance");
    revalidatePath("/");

    return {
      message: "Cuota mensual de mantenimiento actualizada exitosamente",
      errors: {},
    };
  } catch (error) {
    return {
      message: "Error en la base de datos",
      errors: {},
    };
  }
}

// These functions are now imported from @/lib/database/quotas
export { getAllQuotas, getQuotaForYear, getCurrentYearQuota };