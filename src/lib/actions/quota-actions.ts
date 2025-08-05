"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createQuotaConfig, updateQuotaConfig, deleteQuotaConfig } from "@/lib/database/quotas";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";

const QuotaConfigSchema = z.object({
  quotaType: z.enum(["maintenance", "works"]),
  amount: z.number().min(0, translations.errors.amountPositive),
  description: z.string().optional().nullable(),
  dueDate: z.string().min(1, "La fecha de vencimiento es requerida"),
});

const CreateQuotaConfig = QuotaConfigSchema;
const UpdateQuotaConfig = QuotaConfigSchema.extend({
  id: z.string().min(1, translations.errors.required),
});

export type QuotaState = {
  errors?: {
    quotaType?: string[];
    amount?: string[];
    description?: string[];
    dueDate?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createQuotaConfigAction(
  prevState: QuotaState,
  formData: FormData
): Promise<QuotaState> {
  const actionTimer = logger.timer('Create Quota Config Action');
  
  const rawData = {
    quotaType: formData.get("quotaType") as string,
    amount: parseInt(formData.get("amount") as string) || 0,
    description: formData.get("description") as string || null,
    dueDate: formData.get("dueDate") as string,
  };

  const validatedFields = CreateQuotaConfig.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Quota config validation failed", new Error("Validation error"), {
      component: 'createQuotaConfigAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create quota configuration.`,
      success: false,
    };
  }

  const { quotaType, amount, description, dueDate } = validatedFields.data;

  try {
    await createQuotaConfig({
      quotaType,
      amount,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during quota config creation", errorInstance, {
      component: 'createQuotaConfigAction',
      quotaType,
      dueDate
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to create quota configuration.`,
      success: false,
    };
  }

  revalidatePath("/quotas");
  actionTimer.end();
  
  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateQuotaConfigAction(
  prevState: QuotaState,
  formData: FormData
): Promise<QuotaState> {
  const actionTimer = logger.timer('Update Quota Config Action');
  
  const rawData = {
    id: formData.get("id") as string,
    quotaType: formData.get("quotaType") as string,
    amount: parseInt(formData.get("amount") as string) || 0,
    description: formData.get("description") as string || null,
    dueDate: formData.get("dueDate") as string,
  };

  const validatedFields = UpdateQuotaConfig.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Quota config update validation failed", new Error("Validation error"), {
      component: 'updateQuotaConfigAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update quota configuration.`,
      success: false,
    };
  }

  const { id, quotaType, amount, description, dueDate } = validatedFields.data;

  try {
    await updateQuotaConfig(id, {
      quotaType,
      amount,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during quota config update", errorInstance, {
      component: 'updateQuotaConfigAction',
      quotaId: id,
      quotaType
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to update quota configuration.`,
      success: false,
    };
  }

  revalidatePath("/quotas");
  actionTimer.end();
  
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteQuotaConfigAction(id: string) {
  const actionTimer = logger.timer('Delete Quota Config Action');
  
  try {
    await deleteQuotaConfig(id);
    revalidatePath("/quotas");
    actionTimer.end();
    
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during quota config deletion", errorInstance, {
      component: 'deleteQuotaConfigAction',
      quotaId: id
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to delete quota configuration.`,
      success: false,
    };
  }
}