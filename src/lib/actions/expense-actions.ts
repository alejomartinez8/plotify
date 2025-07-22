"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { 
  createExpense, 
  updateExpense, 
  deleteExpense 
} from "@/lib/database/expenses";
import { translations } from "@/lib/translations";

// Zod schema for validation
const ExpenseSchema = z.object({
  type: z.enum(["maintenance", "works"], {
    message: translations.validation.typeRequired,
  }),
  amount: z.coerce.number().positive(translations.validation.amountPositive),
  date: z.string().min(1, translations.validation.dateRequired),
  description: z.string().optional(),
  category: z.string().min(1, translations.validation.categoryRequired),
});

const CreateExpense = ExpenseSchema;
const UpdateExpense = ExpenseSchema.extend({
  id: z.coerce.number().positive(translations.validation.expenseIdRequired),
});

export type ExpenseState = {
  errors?: {
    type?: string[];
    amount?: string[];
    date?: string[];
    description?: string[];
    category?: string[];
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.validation.missingFields}. Failed to create expense.`,
      success: false,
    };
  }

  const { type, amount, date, description, category } = validatedFields.data;

  try {
    const result = await createExpense({
      type,
      amount,
      date,
      description: description || "",
      category,
    });

    if (!result) {
      return {
        message: "Database Error: Failed to create expense.",
      success: false,
      };
    }
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to create expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return { message: `${translations.validation.createSuccess}.`, success: true };
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: `${translations.validation.missingFields}. Failed to update expense.`,
      success: false,
    };
  }

  const { id, type, amount, date, description, category } = validatedFields.data;

  try {
    const result = await updateExpense(id, {
      type,
      amount,
      date,
      description: description || "",
      category,
    });

    if (!result) {
      return {
        message: "Database Error: Failed to update expense.",
      success: false,
      };
    }
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to update expense.`,
      success: false,
    };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return { message: `${translations.validation.updateSuccess}.`, success: true };
}

export async function deleteExpenseAction(id: number) {
  try {
    const result = await deleteExpense(id);
    
    if (!result) {
      return {
        message: `${translations.validation.databaseError}: Failed to delete expense.`,
      success: false,
      };
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return { message: `${translations.validation.deleteSuccess}.`, success: true };
  } catch (error) {
    return {
      message: `${translations.validation.databaseError}: Failed to delete expense.`,
      success: false,
    };
  }
}