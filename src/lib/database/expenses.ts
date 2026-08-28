import type { Expense as PrismaExpense } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Expense, ExpenseType } from "@/types/expenses.types";
import { ApprovalStatus } from "@/types/approvals.types";
import { formatDateForStorage } from "@/lib/utils";

function toExpense(expense: PrismaExpense): Expense {
  return {
    ...expense,
    type: expense.type as ExpenseType,
    date: formatDateForStorage(expense.date),
    approvalStatus: expense.approvalStatus as ApprovalStatus,
    approvedAt: expense.approvedAt ? expense.approvedAt.toISOString() : null,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return expenses.map(toExpense);
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
    return toExpense(expense);
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
  receiptFileId?: string | null;
  receiptFileUrl?: string | null;
  receiptFileName?: string | null;
}): Promise<Expense | null> {
  try {
    const expense = await prisma.expense.create({
      data,
    });
    return toExpense(expense);
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
    return toExpense(expense);
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

/**
 * Marks an expense as approved by the Treasurer.
 * Writes an ApprovalHistory row in the same transaction as the update.
 */
export async function approveExpense(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<Expense | null> {
  try {
    const [expense] = await prisma.$transaction([
      prisma.expense.update({
        where: { id },
        data: {
          approvalStatus: "approved",
          approvalNote: note || null,
          approvedBy: treasurerEmail,
          approvedAt: new Date(),
        },
      }),
      prisma.approvalHistory.create({
        data: {
          recordType: "expense",
          recordId: id,
          action: "approved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toExpense(expense);
  } catch (error) {
    console.error("Error approving expense:", error);
    return null;
  }
}

/**
 * Reverses a Treasurer's approval, sending the expense back to `pending`.
 * Treasurer-exclusive (see docs/SPEC-TREASURER-ROLE.md, 7.2).
 */
export async function unapproveExpense(
  id: number,
  treasurerEmail: string,
  note?: string | null
): Promise<Expense | null> {
  try {
    const [expense] = await prisma.$transaction([
      prisma.expense.update({
        where: { id },
        data: {
          approvalStatus: "pending",
          approvalNote: note || null,
          approvedBy: null,
          approvedAt: null,
        },
      }),
      prisma.approvalHistory.create({
        data: {
          recordType: "expense",
          recordId: id,
          action: "unapproved",
          treasurerEmail,
          note: note || null,
        },
      }),
    ]);
    return toExpense(expense);
  } catch (error) {
    console.error("Error unapproving expense:", error);
    return null;
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
    return expenses.map(toExpense);
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
    return expenses.map(toExpense);
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}

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

export async function getTotalExpensesByType(type: ExpenseType): Promise<number> {
  try {
    const result = await prisma.expense.aggregate({
      where: { type },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  } catch (error) {
    console.error(`Error calculating total expenses for type ${type}:`, error);
    return 0;
  }
}
