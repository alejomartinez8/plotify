import { FundBalance } from "@/types/common.types";
import { Contribution, ContributionType } from "@/types/contributions.types";
import { Expense } from "@/types/expenses.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getCurrentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "short" }).toUpperCase();
}

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`http://localhost:3000/api/${endpoint}`);
  if (!response.ok) throw new Error("Failed to fetch data");
  return response.json();
}

export const calculateBalance = (
  type: ContributionType,
  contributions: Contribution[],
  expenses: Expense[]
): FundBalance => {
  const income = contributions
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + c.amount, 0);

  const expenseTotal = expenses
    .filter((e) => e.type === type)
    .reduce((sum, e) => sum + e.amount, 0);

  return { income, expenses: expenseTotal, balance: income - expenseTotal };
};
