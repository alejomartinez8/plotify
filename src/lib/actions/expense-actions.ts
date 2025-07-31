"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/database/expenses";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";

// Zod schema for validation
const ExpenseSchema = z.object({
  type: z.enum(["maintenance", "works", "others"], {
    message: translations.errors.typeRequired,
  }),
  amount: z.coerce.number().positive(translations.errors.amountPositive),
  date: z.string().min(1, translations.errors.dateRequired),
  description: z.string().optional(),
  category: z.string().min(1, translations.errors.categoryRequired),
  receiptNumber: z.string().optional(),
  receiptFileId: z.string().nullable().optional(),
  receiptFileUrl: z.string().nullable().optional(),
  receiptFileName: z.string().nullable().optional(),
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
  const actionTimer = logger.timer('Create Expense Action');
  
  // Extract and validate data
  const rawData = {
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    category: formData.get("category"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  };

  const validatedFields = CreateExpense.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Expense validation failed", new Error("Validation error"), {
      component: 'createExpenseAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create expense.`,
      success: false,
    };
  }

  const { type, amount, date, description, category, receiptNumber, receiptFileId, receiptFileUrl, receiptFileName } = validatedFields.data;

  try {
    const result = await createExpense({
      type,
      amount,
      date,
      description: description || "",
      category,
      receiptNumber: receiptNumber || null,
      receiptFileId: receiptFileId || null,
      receiptFileUrl: receiptFileUrl || null,
      receiptFileName: receiptFileName || null,
    });

    if (!result) {
      logger.error("Database operation failed", new Error("Create expense returned null"), {
        component: 'createExpenseAction'
      });
      actionTimer.end();
      return {
        message: "Database Error: Failed to create expense.",
        success: false,
      };
    }
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during expense creation", errorInstance, {
      component: 'createExpenseAction'
    });
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to create expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  actionTimer.end();
  
  return { message: `${translations.messages.created}.`, success: true };
}

export async function updateExpenseAction(
  prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const actionTimer = logger.timer('Update Expense Action');
  
  const rawData = {
    id: formData.get("id"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    category: formData.get("category"),
    receiptNumber: formData.get("receiptNumber"),
    receiptFileId: formData.get("receiptFileId"),
    receiptFileUrl: formData.get("receiptFileUrl"),
    receiptFileName: formData.get("receiptFileName"),
  };

  const validatedFields = UpdateExpense.safeParse(rawData);

  if (!validatedFields.success) {
    logger.error("Expense update validation failed", new Error("Validation error"), {
      component: 'updateExpenseAction',
      errors: validatedFields.error.flatten().fieldErrors
    });
    
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update expense.`,
      success: false,
    };
  }

  const { id, type, amount, date, description, category, receiptNumber, receiptFileId, receiptFileUrl, receiptFileName } =
    validatedFields.data;

  try {
    const result = await updateExpense(id, {
      type,
      amount,
      date,
      description: description || "",
      category,
      receiptNumber: receiptNumber || null,
      receiptFileId: receiptFileId || null,
      receiptFileUrl: receiptFileUrl || null,
      receiptFileName: receiptFileName || null,
    });

    if (!result) {
      logger.error("Database operation failed", new Error("Update expense returned null"), {
        component: 'updateExpenseAction',
        expenseId: id
      });
      actionTimer.end();
      return {
        message: "Database Error: Failed to update expense.",
        success: false,
      };
    }
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during expense update", errorInstance, {
      component: 'updateExpenseAction',
      expenseId: id
    });
    actionTimer.end();
    return {
      message: `${translations.errors.database}: Failed to update expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  actionTimer.end();
  
  return { message: `${translations.messages.updated}.`, success: true };
}

export async function deleteExpenseAction(id: number) {
  const actionTimer = logger.timer('Delete Expense Action');
  
  try {
    const result = await deleteExpense(id);

    if (!result) {
      logger.error("Database operation failed", new Error("Delete expense returned null"), {
        component: 'deleteExpenseAction',
        expenseId: id
      });
      actionTimer.end();
      return {
        message: `${translations.errors.database}: Failed to delete expense.`,
        success: false,
      };
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    actionTimer.end();
    
    return { message: `${translations.messages.deleted}.`, success: true };
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during expense deletion", errorInstance, {
      component: 'deleteExpenseAction',
      expenseId: id
    });
    actionTimer.end();
    
    return {
      message: `${translations.errors.database}: Failed to delete expense.`,
      success: false,
    };
  }
}
