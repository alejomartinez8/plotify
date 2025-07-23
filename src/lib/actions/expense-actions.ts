"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/database/expenses";
import { translations } from "@/lib/translations";

// Zod schema for validation
const ExpenseSchema = z.object({
  type: z.enum(["maintenance", "works"], {
    message: translations.errors.typeRequired,
  }),
  amount: z.coerce.number().positive(translations.errors.amountPositive),
  date: z.string().min(1, translations.errors.dateRequired),
  description: z.string().optional(),
  category: z.string().min(1, translations.errors.categoryRequired),
  receiptNumber: z.string().optional(),
});

const CreateExpense = ExpenseSchema;
const UpdateExpense = ExpenseSchema.extend({
  id: z.coerce.number().positive(translations.errors.required),
});

export type ExpenseState = {
  errors?: {
    type?: string[];
    amount?: string[];
    date?: string[];
    description?: string[];
    category?: string[];
    receiptNumber?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createExpenseAction(
  prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  // Extract and validate data
  const validatedFields = CreateExpense.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    category: formData.get("category"),
    receiptNumber: formData.get("receiptNumber"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create expense.`,
      success: false,
    };
  }

  const { type, amount, date, description, category, receiptNumber } = validatedFields.data;

  try {
    const result = await createExpense({
      type,
      amount,
      date,
      description: description || "",
      category,
      receiptNumber: receiptNumber || null,
    });

    if (!result) {
      return {
        message: "Database Error: Failed to create expense.",
        success: false,
      };
    }
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to create expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateExpenseAction(
  prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const validatedFields = UpdateExpense.safeParse({
    id: formData.get("id"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    category: formData.get("category"),
    receiptNumber: formData.get("receiptNumber"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update expense.`,
      success: false,
    };
  }

  const { id, type, amount, date, description, category, receiptNumber } =
    validatedFields.data;

  try {
    const result = await updateExpense(id, {
      type,
      amount,
      date,
      description: description || "",
      category,
      receiptNumber: receiptNumber || null,
    });

    if (!result) {
      return {
        message: "Database Error: Failed to update expense.",
        success: false,
      };
    }
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to update expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteExpenseAction(id: number) {
  try {
    const result = await deleteExpense(id);

    if (!result) {
      return {
        message: `${translations.errors.database}: Failed to delete expense.`,
        success: false,
      };
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    return {
      message: `${translations.errors.database}: Failed to delete expense.`,
      success: false,
    };
  }
}
