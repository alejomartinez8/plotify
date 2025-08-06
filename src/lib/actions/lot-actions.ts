"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createLot, updateLot, deleteLot, getLots } from "@/lib/database/lots";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";

// Zod schema for validation
const LotSchema = z.object({
  lotNumber: z.string().min(1, translations.errors.required),
  owner: z.string().min(1, translations.errors.ownerRequired),
  initialWorksDebt: z.number().min(0, translations.errors.amountPositive).optional(),
  isExempt: z.boolean().optional(),
  exemptionReason: z.string().nullable().optional(),
});

const CreateLot = LotSchema;
const UpdateLot = LotSchema.extend({
  id: z.string().min(1, translations.errors.required),
});

const UpdateInitialDebt = z.object({
  lotId: z.string().min(1, translations.errors.required),
  initialWorksDebt: z.number().min(0, translations.errors.amountPositive),
});


export type State = {
  errors?: {
    lotNumber?: string[];
    owner?: string[];
    lotId?: string[];
    initialWorksDebt?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createLotAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const actionTimer = logger.timer('Create Lot Action');
  
  // Extract and validate data
  const rawData = {
    lotNumber: formData.get("lotNumber"),
    owner: formData.get("owner"),
    initialWorksDebt: parseInt(formData.get("initialWorksDebt") as string) || 0,
    isExempt: formData.get("isExempt") === "on",
    exemptionReason: (formData.get("exemptionReason") as string)?.trim() || null,
  };

  const validatedFields = CreateLot.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Lot validation failed", new Error("Validation error"), {
      component: 'createLotAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create lot.`,
      success: false,
    };
  }

  const { lotNumber, owner, initialWorksDebt, isExempt, exemptionReason } = validatedFields.data;

  try {
    await createLot({ lotNumber, owner, initialWorksDebt, isExempt, exemptionReason });
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during lot creation", errorInstance, {
      component: 'createLotAction',
      lotNumber
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to create lot.`,
      success: false,
    };
  }

  revalidatePath("/lots");
  actionTimer.end();
  
  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateLotAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const actionTimer = logger.timer('Update Lot Action');
  
  const rawData = {
    id: formData.get("id"),
    lotNumber: formData.get("lotNumber"),
    owner: formData.get("owner"),
    initialWorksDebt: parseInt(formData.get("initialWorksDebt") as string) || 0,
    isExempt: formData.get("isExempt") === "on",
    exemptionReason: (formData.get("exemptionReason") as string)?.trim() || null,
  };

  const validatedFields = UpdateLot.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Lot update validation failed", new Error("Validation error"), {
      component: 'updateLotAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update lot.`,
      success: false,
    };
  }

  const { id, lotNumber, owner, initialWorksDebt, isExempt, exemptionReason } = validatedFields.data;

  try {
    await updateLot(id, { lotNumber, owner, initialWorksDebt, isExempt, exemptionReason });
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during lot update", errorInstance, {
      component: 'updateLotAction',
      lotId: id,
      lotNumber
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to update lot.`,
      success: false,
    };
  }

  revalidatePath("/lots");
  actionTimer.end();
  
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteLotAction(id: string) {
  const actionTimer = logger.timer('Delete Lot Action');
  
  try {
    await deleteLot(id);
    revalidatePath("/lots");
    actionTimer.end();
    
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during lot deletion", errorInstance, {
      component: 'deleteLotAction',
      lotId: id
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to delete lot.`,
      success: false,
    };
  }
}

export async function updateInitialDebtAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const actionTimer = logger.timer('Update Initial Debt Action');
  
  const rawData = {
    lotId: formData.get("lotId"),
    initialWorksDebt: parseInt(formData.get("initialWorksDebt") as string) || 0,
  };

  const validatedFields = UpdateInitialDebt.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Initial debt update validation failed", new Error("Validation error"), {
      component: 'updateInitialDebtAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update initial debt.`,
      success: false,
    };
  }

  const { lotId, initialWorksDebt } = validatedFields.data;

  try {
    await updateLot(lotId, { initialWorksDebt });
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during initial debt update", errorInstance, {
      component: 'updateInitialDebtAction',
      lotId,
      initialWorksDebt
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to update initial debt.`,
      success: false,
    };
  }

  revalidatePath("/admin/initial-debt");
  revalidatePath("/");
  actionTimer.end();
  
  return { message: `${translations.messages.updated}.`, success: true };
}


export async function getLotsAction() {
  const actionTimer = logger.timer('Get Lots Action');
  
  try {
    const lots = await getLots();
    actionTimer.end();
    return lots;
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error fetching lots", errorInstance, {
      component: 'getLotsAction'
    });
    actionTimer.end();
    
    return [];
  }
}
