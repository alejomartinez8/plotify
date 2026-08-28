"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createTreasurer, deleteTreasurer } from "@/lib/database/treasurers";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";
import { checkAdminAccess } from "./helpers";

const TreasurerSchema = z.object({
  email: z.string().email(translations.errors.treasurerEmailInvalid),
  name: z.string().optional(),
});

export type TreasurerState = {
  errors?: {
    email?: string[];
    name?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createTreasurerAction(
  prevState: TreasurerState,
  formData: FormData
): Promise<TreasurerState> {
  const actionTimer = logger.timer("Create Treasurer Action");

  const adminError = await checkAdminAccess<TreasurerState>(
    actionTimer,
    "Admin access required to manage treasurers"
  );
  if (adminError) return adminError;

  const validatedFields = TreasurerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: translations.errors.missingFields,
      success: false,
    };
  }

  const { email, name } = validatedFields.data;

  try {
    const result = await createTreasurer({ email, name: name || null });

    if (!result) {
      actionTimer.end();
      return {
        success: false,
        message: translations.errors.treasurerAlreadyExists,
      };
    }
  } catch (error) {
    logger.error(
      "Database error during treasurer creation",
      error instanceof Error ? error : new Error(String(error)),
      { component: "createTreasurerAction" }
    );
    actionTimer.end();
    return {
      success: false,
      message: translations.errors.treasurerAlreadyExists,
    };
  }

  revalidatePath("/admin");
  actionTimer.end();
  return { success: true, message: `${translations.messages.created}.` };
}

export async function deleteTreasurerAction(
  id: string
): Promise<TreasurerState> {
  const actionTimer = logger.timer("Delete Treasurer Action");

  const adminError = await checkAdminAccess<TreasurerState>(
    actionTimer,
    "Admin access required to manage treasurers"
  );
  if (adminError) return adminError;

  try {
    const result = await deleteTreasurer(id);

    if (!result) {
      actionTimer.end();
      return {
        success: false,
        message: `${translations.errors.database}: Failed to delete treasurer.`,
      };
    }

    revalidatePath("/admin");
    actionTimer.end();
    return { success: true, message: `${translations.messages.deleted}.` };
  } catch (error) {
    logger.error(
      "Database error during treasurer deletion",
      error instanceof Error ? error : new Error(String(error)),
      { component: "deleteTreasurerAction" }
    );
    actionTimer.end();
    return {
      success: false,
      message: `${translations.errors.database}: Failed to delete treasurer.`,
    };
  }
}
