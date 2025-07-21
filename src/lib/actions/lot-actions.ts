"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createLot, updateLot, deleteLot, getLots } from "@/lib/database/lots";
import { translations } from "@/lib/translations";

// Zod schema for validation
const LotSchema = z.object({
  lotNumber: z.string().min(1, translations.validation.lotNumberRequired),
  owner: z.string().min(1, translations.validation.ownerRequired),
});

const CreateLot = LotSchema;
const UpdateLot = LotSchema.extend({
  id: z.string().min(1, translations.validation.lotIdRequired),
});

export type State = {
  errors?: {
    lotNumber?: string[];
    owner?: string[];
  };
  message?: string | null;
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
      message: `${translations.validation.missingFields}. Failed to create lot.`,
    };
  }

  const { lotNumber, owner } = validatedFields.data;

  try {
    await createLot({ lotNumber, owner });
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to create lot.`,
    };
  }

  revalidatePath("/lots");
  return { message: `${translations.validation.createSuccess}.` };
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
      message: `${translations.validation.missingFields}. Failed to update lot.`,
    };
  }

  const { id, lotNumber, owner } = validatedFields.data;

  try {
    await updateLot(id, { lotNumber, owner });
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to update lot.`,
    };
  }

  revalidatePath("/lots");
  return { message: `${translations.validation.updateSuccess}.` };
}

export async function deleteLotAction(id: string) {
  try {
    await deleteLot(id);
    revalidatePath("/lots");
    return { message: `${translations.validation.deleteSuccess}.` };
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to delete lot.`,
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
