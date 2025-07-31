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
});

const CreateLot = LotSchema;
const UpdateLot = LotSchema.extend({
  id: z.string().min(1, translations.errors.required),
});

export type State = {
  errors?: {
    lotNumber?: string[];
    owner?: string[];
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

  const { lotNumber, owner } = validatedFields.data;

  try {
    await createLot({ lotNumber, owner });
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

  const { id, lotNumber, owner } = validatedFields.data;

  try {
    await updateLot(id, { lotNumber, owner });
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
