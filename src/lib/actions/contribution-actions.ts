"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createContribution,
  updateContribution,
  deleteContribution,
} from "@/lib/database/contributions";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";

const ContributionSchema = z.object({
  lotId: z.string().min(1, translations.errors.lotRequired),
  type: z.enum(["maintenance", "works", "others"], {
    message: translations.errors.typeRequired,
  }),
  amount: z.coerce.number().min(0, translations.errors.amountPositive),
  date: z.string().min(1, translations.errors.dateValid),
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptFileId: z.string().nullable().optional(),
  receiptFileUrl: z.string().nullable().optional(),
  receiptFileName: z.string().nullable().optional(),
});

const CreateContribution = ContributionSchema;
const UpdateContribution = ContributionSchema.extend({
  id: z.coerce.number().positive(translations.errors.required),
});

export type ContributionState = {
  errors?: {
    lotId?: string[];
    type?: string[];
    amount?: string[];
    date?: string[];
    description?: string[];
    receiptNumber?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createContributionAction(
  prevState: ContributionState,
  formData: FormData
): Promise<ContributionState> {
  const actionTimer = logger.timer("Create Contribution Action");

  const rawData = {
    lotId: formData.get("lotId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  };

  const validatedFields = CreateContribution.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error(
      "Contribution validation failed",
      new Error("Validation error"),
      {
        component: "createContributionAction",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    );

    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create contribution.`,
      success: false,
    };
  }

  const {
    lotId,
    type,
    amount,
    date,
    description,
    receiptNumber,
    receiptFileId,
    receiptFileUrl,
    receiptFileName,
  } = validatedFields.data;

  try {
    const result = await createContribution({
      lotId,
      type,
      amount,
      date,
      description: description || "",
      receiptNumber: receiptNumber || null,
      receiptFileId: receiptFileId || null,
      receiptFileUrl: receiptFileUrl || null,
      receiptFileName: receiptFileName || null,
    });

    if (!result) {
      logger.error(
        "Database operation failed",
        new Error("Create contribution returned null"),
        {
          component: "createContributionAction",
        }
      );
      actionTimer.end();
      return {
        message: "Database Error: Failed to create contribution.",
        success: false,
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during contribution creation", errorInstance, {
      component: "createContributionAction",
    });
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to create contribution.`,
      success: false,
    };
  }

  revalidatePath("/income");
  revalidatePath("/");
  actionTimer.end();

  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateContributionAction(
  prevState: ContributionState,
  formData: FormData
): Promise<ContributionState> {
  const validatedFields = UpdateContribution.safeParse({
    id: formData.get("id"),
    lotId: formData.get("lotId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update contribution.`,
      success: false,
    };
  }

  const {
    id,
    lotId,
    type,
    amount,
    date,
    description,
    receiptNumber,
    receiptFileId,
    receiptFileUrl,
    receiptFileName,
  } = validatedFields.data;

  try {
    const result = await updateContribution(id, {
      lotId,
      type,
      amount,
      date,
      description: description || "",
      receiptNumber: receiptNumber || null,
      receiptFileId: receiptFileId || null,
      receiptFileUrl: receiptFileUrl || null,
      receiptFileName: receiptFileName || null,
    });

    if (!result) {
      return {
        message: "Database Error: Failed to update contribution.",
        success: false,
      };
    }
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to update contribution.`,
      success: false,
    };
  }

  revalidatePath("/income");
  revalidatePath("/");
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteContributionAction(id: number) {
  try {
    const result = await deleteContribution(id);

    if (!result) {
      return {
        message: `${translations.errors.database}: Failed to delete contribution.`,
        success: false,
      };
    }

    revalidatePath("/income");
    revalidatePath("/");
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to delete contribution.`,
      success: false,
    };
  }
}
