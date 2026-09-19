"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createOtherIncome,
  updateOtherIncome,
  deleteOtherIncome,
  getOtherIncomeById,
} from "@/lib/database/other-income";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";
import { checkAdminAccess } from "./helpers";

const OtherIncomeSchema = z.object({
  type: z.enum(["maintenance", "works", "others"], {
    message: translations.errors.typeRequired,
  }),
  amount: z.coerce.number().positive(translations.errors.amountPositive),
  date: z.string().min(1, translations.errors.dateRequired),
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptFileId: z.string().nullable().optional(),
  receiptFileUrl: z.string().nullable().optional(),
  receiptFileName: z.string().nullable().optional(),
});

const CreateOtherIncome = OtherIncomeSchema;
const UpdateOtherIncome = OtherIncomeSchema.extend({
  id: z.coerce.number().positive(translations.errors.required),
});

export type OtherIncomeState = {
  errors?: {
    type?: string[];
    amount?: string[];
    date?: string[];
    description?: string[];
    receiptNumber?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createOtherIncomeAction(
  prevState: OtherIncomeState,
  formData: FormData
): Promise<OtherIncomeState> {
  const actionTimer = logger.timer("Create Other Income Action");

  const adminError = await checkAdminAccess<OtherIncomeState>(
    actionTimer,
    "Admin access required to create other income"
  );
  if (adminError) return adminError;

  const rawData = {
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  };

  const validatedFields = CreateOtherIncome.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error(
      "Other income validation failed",
      new Error("Validation error"),
      {
        component: "createOtherIncomeAction",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    );

    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create other income.`,
      success: false,
    };
  }

  const {
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
    const result = await createOtherIncome({
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
        new Error("Create other income returned null"),
        {
          component: "createOtherIncomeAction",
        }
      );
      actionTimer.end();
      return {
        message: "Database Error: Failed to create other income.",
        success: false,
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during other income creation", errorInstance, {
      component: "createOtherIncomeAction",
    });
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to create other income.`,
      success: false,
    };
  }

  revalidatePath("/other-income");
  revalidatePath("/");
  actionTimer.end();

  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateOtherIncomeAction(
  prevState: OtherIncomeState,
  formData: FormData
): Promise<OtherIncomeState> {
  const actionTimer = logger.timer("Update Other Income Action");

  const adminError = await checkAdminAccess<OtherIncomeState>(
    actionTimer,
    "Admin access required to update other income"
  );
  if (adminError) return adminError;

  const rawData = {
    id: formData.get("id"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  };

  const validatedFields = UpdateOtherIncome.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error(
      "Other income update validation failed",
      new Error("Validation error"),
      {
        component: "updateOtherIncomeAction",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    );

    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update other income.`,
      success: false,
    };
  }

  const {
    id,
    type,
    amount,
    date,
    description,
    receiptNumber,
    receiptFileId,
    receiptFileUrl,
    receiptFileName,
  } = validatedFields.data;

  const existing = await getOtherIncomeById(id);
  if (!existing) {
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to update other income.`,
      success: false,
    };
  }

  // Once approved, only description may change — amount/type/date are
  // certified by the Treasurer and locked for everyone, including Admin.
  // See docs/SPEC-TREASURER-ROLE.md, 7 and 8.
  if (
    existing.approvalStatus === "approved" &&
    (amount !== existing.amount ||
      type !== existing.type ||
      date !== existing.date)
  ) {
    actionTimer.end();
    return {
      message: translations.errors.cannotEditApprovedField,
      success: false,
    };
  }

  try {
    const result = await updateOtherIncome(id, {
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
        new Error("Update other income returned null"),
        {
          component: "updateOtherIncomeAction",
          otherIncomeId: id,
        }
      );
      actionTimer.end();
      return {
        message: "Database Error: Failed to update other income.",
        success: false,
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during other income update", errorInstance, {
      component: "updateOtherIncomeAction",
      otherIncomeId: id,
    });
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to update other income.`,
      success: false,
    };
  }

  revalidatePath("/other-income");
  revalidatePath("/");
  actionTimer.end();

  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteOtherIncomeAction(id: number) {
  const actionTimer = logger.timer("Delete Other Income Action");

  const adminError = await checkAdminAccess<OtherIncomeState>(
    actionTimer,
    "Admin access required to delete other income"
  );
  if (adminError) return adminError;

  const existing = await getOtherIncomeById(id);
  if (existing?.approvalStatus === "approved") {
    actionTimer.end();
    return {
      message: translations.errors.cannotDeleteApproved,
      success: false,
    };
  }

  try {
    const result = await deleteOtherIncome(id);

    if (!result) {
      logger.error(
        "Database operation failed",
        new Error("Delete other income returned null"),
        {
          component: "deleteOtherIncomeAction",
          otherIncomeId: id,
        }
      );
      actionTimer.end();
      return {
        message: `${translations.errors.database}: Failed to delete other income.`,
        success: false,
      };
    }

    revalidatePath("/other-income");
    revalidatePath("/");
    actionTimer.end();

    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during other income deletion", errorInstance, {
      component: "deleteOtherIncomeAction",
      otherIncomeId: id,
    });
    actionTimer.end();

    return {
      message: `${translations.errors.database}: Failed to delete other income.`,
      success: false,
    };
  }
}
