import { ContributionType } from "@/types/contributions.types";
import { getIncomeByType } from "./contributions";
import { getTotalExpenses } from "./expenses";

/**
 * Calculates the balance for a specific fund type.
 * Individual funds only track their income; expenses are tracked at the consolidated level.
 *
 * @param type - The contribution type (maintenance, works, or others)
 * @returns Object containing income, expenses (always 0), and balance (equal to income)
 * @example
 * const maintenanceBalance = await getFundBalance("maintenance");
 * // Returns: { income: 50000, expenses: 0, balance: 50000 }
 */
export async function getFundBalance(
  type: ContributionType
): Promise<{ income: number; expenses: number; balance: number }> {
  try {
    const income = await getIncomeByType(type);

    return {
      income,
      expenses: 0,
      balance: income,
    };
  } catch (error) {
    console.error(`Error calculating fund balance for type ${type}:`, error);
    return { income: 0, expenses: 0, balance: 0 };
  }
}

/**
 * Retrieves balances for all fund types and calculates consolidated totals.
 *
 * Architecture:
 * - Individual funds (maintenance/works/others): Track only income, expenses = 0
 * - Consolidated: Sums all income and all expenses (general type) from database
 *
 * This design reflects that expenses are general (not fund-specific) and should be
 * deducted from the total income rather than allocated per fund.
 *
 * @returns Object with balances for maintenance, works, others, and consolidated totals
 * @example
 * const balances = await getAllFundsBalances();
 * // Returns:
 * // {
 * //   maintenance: { income: 50000, expenses: 0, balance: 50000 },
 * //   works: { income: 30000, expenses: 0, balance: 30000 },
 * //   others: { income: 20000, expenses: 0, balance: 20000 },
 * //   consolidated: { income: 100000, expenses: 15000, balance: 85000 }
 * // }
 */
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

    const totalIncome =
      maintenance.income + works.income + others.income;

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
