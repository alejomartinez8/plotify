"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrUpdateQuota } from "@/lib/database/quotas";

const quotaSchema = z.object({
  year: z.number().min(2020).max(2050),
  monthlyAmount: z.number().positive(),
});

export type QuotaState = {
  errors: Record<string, string[]>;
  message: string;
  success?: boolean;
};

export async function createOrUpdateQuotaAction(
  prevState: QuotaState,
  formData: FormData
): Promise<QuotaState> {
  const data = {
    year: parseInt(formData.get("year") as string),
    monthlyAmount: parseInt(formData.get("monthlyAmount") as string),
  };

  const validated = quotaSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación",
      success: false,
    };
  }

  try {
    await createOrUpdateQuota(validated.data.year, validated.data.monthlyAmount);

    revalidatePath("/maintenance");
    revalidatePath("/");

    return {
      message: "Cuota mensual de mantenimiento actualizada exitosamente",
      errors: {},
      success: true,
    };
  } catch (error) {
    return {
      message: "Error en la base de datos",
      errors: {},
      success: false,
    };
  }
}