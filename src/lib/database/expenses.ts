import prisma from "@/lib/prisma";
import { Expense } from "@/types/expenses.types";

export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return expenses as Expense[];
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
    return expense as Expense | null;
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
    return expense as Expense;
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
    return expense as Expense;
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
    return expenses as Expense[];
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
    return expenses as Expense[];
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}
