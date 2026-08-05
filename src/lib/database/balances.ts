import { ContributionType } from "@/types/contributions.types";
import { getIncomeByType } from "./contributions";
import { getTotalExpenses, getTotalExpensesByType } from "./expenses";
import prisma from "@/lib/prisma";
import { parseLocalDate } from "@/lib/utils";

export interface MonthlyDataPoint {
  month: string; // "YYYY-MM"
  income: number;
  expenses: number;
}

export async function getMonthlyTotals(): Promise<MonthlyDataPoint[]> {
  try {
    const [contributions, expenses] = await Promise.all([
      prisma.contribution.findMany({ select: { date: true, amount: true } }),
      prisma.expense.findMany({ select: { date: true, amount: true } }),
    ]);

    const map = new Map<string, MonthlyDataPoint>();

    const getOrCreate = (key: string) => {
      if (!map.has(key)) map.set(key, { month: key, income: 0, expenses: 0 });
      return map.get(key)!;
    };

    for (const c of contributions) {
      const d = parseLocalDate(c.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      getOrCreate(key).income += c.amount;
    }

    for (const e of expenses) {
      const key = e.date.slice(0, 7);
      getOrCreate(key).expenses += e.amount;
    }

    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  } catch (error) {
    console.error("Error fetching monthly totals:", error);
    return [];
  }
}

export async function getFundBalance(
  type: ContributionType
): Promise<{ income: number; expenses: number; balance: number }> {
  try {
    const [income, expenses] = await Promise.all([
      getIncomeByType(type),
      getTotalExpensesByType(type),
    ]);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  } catch (error) {
    console.error(`Error calculating fund balance for type ${type}:`, error);
    return { income: 0, expenses: 0, balance: 0 };
  }
}

export async function getAllFundsBalances(): Promise<{
  maintenance: { income: number; expenses: number; balance: number };
  works: { income: number; expenses: number; balance: number };
  others: { income: number; expenses: number; balance: number };
  consolidated: { income: number; expenses: number; balance: number };
}> {
  try {
    const [maintenance, works, others, totalExpenses] = await Promise.all([
      getFundBalance("maintenance"),
      getFundBalance("works"),
      getFundBalance("others"),
      getTotalExpenses(),
    ]);

    const totalIncome = maintenance.income + works.income + others.income;

    const consolidated = {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    };

    return {
      maintenance,
      works,
      others,
      consolidated,
    };
  } catch (error) {
    console.error("Error calculating all funds balances:", error);
    return {
      maintenance: { income: 0, expenses: 0, balance: 0 },
      works: { income: 0, expenses: 0, balance: 0 },
      others: { income: 0, expenses: 0, balance: 0 },
      consolidated: { income: 0, expenses: 0, balance: 0 },
    };
  }
}
