import prisma from "@/lib/prisma";
import { Expense } from "@/types/expenses.types";
import { ContributionType } from "@/types/contributions.types";
import { formatDateToYYYYMMDD } from "@/lib/utils";

export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map(expense => ({
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });
    if (!expense) return null;
    return {
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    };
  } catch (error) {
    console.error("Error fetching expense by id:", error);
    return null;
  }
}

export async function createExpense(data: {
  type: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  receiptNumber?: string | null;
}): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.create({
      data,
    });
    return {
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return null;
  }
}

export async function updateExpense(
  id: number,
  data: {
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
    category?: string;
    receiptNumber?: string | null;
  }
): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data,
    });
    return {
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return null;
  }
}

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

export async function getExpensesByType(type: string): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { type },
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map(expense => ({
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    }));
  } catch (error) {
    console.error("Error fetching expenses by type:", error);
    return [];
  }
}

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
    return expenses.map(expense => ({
      ...expense,
      type: expense.type as ContributionType,
      date: formatDateToYYYYMMDD(expense.date)
    }));
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}
