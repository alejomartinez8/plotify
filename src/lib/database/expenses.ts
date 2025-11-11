import prisma from "@/lib/prisma";
import { Expense, ExpenseType } from "@/types/expenses.types";
import { formatDateForStorage } from "@/lib/utils";

/**
 * Retrieves all expenses from the database.
 *
 * @returns Array of all expenses ordered by ID (newest first)
 * @example
 * const expenses = await getExpenses();
 */
export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map((expense) => ({
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

/**
 * Retrieves a single expense by its ID.
 *
 * @param id - The unique identifier of the expense
 * @returns Expense object or null if not found
 * @example
 * const expense = await getExpenseById(123);
 */
export async function getExpenseById(id: number): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });
    if (!expense) return null;
    return {
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    };
  } catch (error) {
    console.error("Error fetching expense by id:", error);
    return null;
  }
}

/**
 * Creates a new expense record.
 * All expenses are created with type "general" as expenses are not categorized by fund type.
 *
 * @param data - Expense data including amount, date, category, and optional receipt info
 * @returns Created expense or null on error
 * @example
 * const expense = await createExpense({
 *   type: "general",
 *   amount: 3000,
 *   date: "2024-01-15",
 *   description: "Electrical repairs",
 *   category: "maintenance",
 *   receiptNumber: "EXP-001"
 * });
 */
export async function createExpense(data: {
  type: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  receiptNumber?: string | null;
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.create({
      data,
    });
    return {
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return null;
  }
}

/**
 * Updates an existing expense record.
 *
 * @param id - The unique identifier of the expense to update
 * @param data - Updated expense data (all fields optional)
 * @returns Updated expense or null on error
 * @example
 * const updated = await updateExpense(123, {
 *   amount: 3500,
 *   description: "Updated electrical repairs"
 * });
 */
export async function updateExpense(
  id: number,
  data: {
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
    category?: string;
    receiptNumber?: string | null;
    receiptFileId?: string | null;
    receiptFileUrl?: string | null;
    receiptFileName?: string | null;
  }
): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data,
    });
    return {
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return null;
  }
}

/**
 * Deletes an expense record from the database.
 *
 * @param id - The unique identifier of the expense to delete
 * @returns true if successful, false on error
 * @example
 * const success = await deleteExpense(123);
 */
export async function deleteExpense(id: number): Promise<boolean> {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting expense:", error);
    return false;
  }
}

/**
 * Retrieves all expenses filtered by type.
 * Note: Currently all expenses have type "general".
 *
 * @param type - The expense type (typically "general")
 * @returns Array of expenses of the specified type, ordered by ID (newest first)
 * @example
 * const generalExpenses = await getExpensesByType("general");
 */
export async function getExpensesByType(type: string): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { type },
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map((expense) => ({
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    }));
  } catch (error) {
    console.error("Error fetching expenses by type:", error);
    return [];
  }
}

/**
 * Retrieves all expenses filtered by category.
 *
 * @param category - The expense category
 * @returns Array of expenses in the specified category, ordered by ID (newest first)
 * @example
 * const maintenanceExpenses = await getExpensesByCategory("maintenance");
 */
export async function getExpensesByCategory(
  category: string
): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { category },
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map((expense) => ({
      ...expense,
      type: "general" as ExpenseType,
      date: formatDateForStorage(expense.date),
    }));
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}

/**
 * Calculates the total sum of all expenses.
 * This function is used by balance calculations to determine the consolidated expense amount.
 *
 * Architecture note: Expenses are not categorized by fund type (maintenance/works/others).
 * All expenses are general and deducted from the consolidated total income.
 *
 * @returns Total amount of all expenses
 * @example
 * const total = await getTotalExpenses();
 * // Returns: 15000
 */
export async function getTotalExpenses(): Promise<number> {
  try {
    const result = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error("Error calculating total expenses:", error);
    return 0;
  }
}
