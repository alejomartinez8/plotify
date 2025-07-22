"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createLot, updateLot, deleteLot, getLots } from "@/lib/database/lots";
import { translations } from "@/lib/translations";

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
  // Extract and validate data
  const validatedFields = CreateLot.safeParse({
    lotNumber: formData.get("lotNumber"),
    owner: formData.get("owner"),
  });

  if (!validatedFields.success) {
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
    return {
      message: `${translations.errors.database}: Failed to create lot.`,
      success: false,
    };
  }

  revalidatePath("/lots");
  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateLotAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = UpdateLot.safeParse({
    id: formData.get("id"),
    lotNumber: formData.get("lotNumber"),
    owner: formData.get("owner"),
  });

  if (!validatedFields.success) {
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
    return {
      message: `${translations.errors.database}: Failed to update lot.`,
      success: false,
    };
  }

  revalidatePath("/lots");
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteLotAction(id: string) {
  try {
    await deleteLot(id);
    revalidatePath("/lots");
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to delete lot.`,
      success: false,
    };
  }
}

export async function getLotsAction() {
  try {
    const lots = await getLots();
    return lots;
  } catch (error) {
    console.error("Error fetching lots:", error);
    return [];
  }
}
