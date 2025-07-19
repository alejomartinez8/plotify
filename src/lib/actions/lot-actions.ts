"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createLot, updateLot, deleteLot } from "@/lib/database/lots";

// Zod schema for validation
const LotSchema = z.object({
  id: z.string().min(1, "Lot ID is required"),
  owner: z.string().min(1, "Owner name is required"),
});

const CreateLot = LotSchema;

export type State = {
  errors?: {
    id?: string[];
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
    id: formData.get("id"),
    owner: formData.get("owner"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to create lot.",
    };
  }

  const { id, owner } = validatedFields.data;

  try {
    await createLot({ id, owner });
  } catch (error) {
    return {
      message: "Database Error: Failed to create lot.",
    };
  }

  revalidatePath("/lots");
  return { message: "Created lot successfully." };
}

export async function updateLotAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = LotSchema.safeParse({
    id: formData.get("id"),
    owner: formData.get("owner"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to update lot.",
    };
  }

  const { id, owner } = validatedFields.data;

  try {
    await updateLot(id, { owner });
  } catch (error) {
    return {
      message: "Database Error: Failed to update lot.",
    };
  }

  revalidatePath("/lots");
  return { message: "Updated lot successfully." };
}

export async function deleteLotAction(id: string) {
  try {
    await deleteLot(id);
    revalidatePath("/lots");
    return { message: "Deleted lot successfully." };
  } catch (error) {
    return {
      message: "Database Error: Failed to delete lot.",
    };
  }
}
