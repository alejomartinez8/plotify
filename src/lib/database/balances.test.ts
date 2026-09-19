import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    contribution: { findMany: vi.fn() },
    otherIncome: { findMany: vi.fn() },
    expense: { findMany: vi.fn() },
  },
}));

const mockGetIncomeByType = vi.fn();
vi.mock("./contributions", () => ({
  getIncomeByType: (...args: unknown[]) => mockGetIncomeByType(...args),
}));

const mockGetTotalExpenses = vi.fn();
const mockGetTotalExpensesByType = vi.fn();
vi.mock("./expenses", () => ({
  getTotalExpenses: (...args: unknown[]) => mockGetTotalExpenses(...args),
  getTotalExpensesByType: (...args: unknown[]) =>
    mockGetTotalExpensesByType(...args),
}));

const mockGetTotalOtherIncomeByType = vi.fn();
vi.mock("./other-income", () => ({
  getTotalOtherIncomeByType: (...args: unknown[]) =>
    mockGetTotalOtherIncomeByType(...args),
}));

import prisma from "@/lib/prisma";
import {
  getMonthlyTotals,
  getFundBalance,
  getAllFundsBalances,
} from "./balances";

const mockedContributionFindMany = vi.mocked(prisma.contribution.findMany);
const mockedOtherIncomeFindMany = vi.mocked(prisma.otherIncome.findMany);
const mockedExpenseFindMany = vi.mocked(prisma.expense.findMany);

describe("getMonthlyTotals", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("groups income and expenses by month and sorts chronologically", async () => {
    mockedContributionFindMany.mockResolvedValue([
      { date: "2026-02-10", amount: 1000 },
      { date: "2026-01-05", amount: 500 },
    ] as never);
    mockedOtherIncomeFindMany.mockResolvedValue([
      { date: "2026-01-08", amount: 300 },
    ] as never);
    mockedExpenseFindMany.mockResolvedValue([
      { date: "2026-01-20", amount: 200 },
    ] as never);

    const result = await getMonthlyTotals();

    expect(result).toEqual([
      { month: "2026-01", income: 800, expenses: 200 },
      { month: "2026-02", income: 1000, expenses: 0 },
    ]);
  });

  it("returns an empty array when the query fails", async () => {
    mockedContributionFindMany.mockRejectedValue(new Error("db down"));

    const result = await getMonthlyTotals();

    expect(result).toEqual([]);
  });
});

describe("getFundBalance", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("computes balance as income (contributions + other income) minus expenses for the given type", async () => {
    mockGetIncomeByType.mockResolvedValue(1000);
    mockGetTotalOtherIncomeByType.mockResolvedValue(250);
    mockGetTotalExpensesByType.mockResolvedValue(400);

    const result = await getFundBalance("maintenance");

    expect(result).toEqual({ income: 1250, expenses: 400, balance: 850 });
  });

  it("falls back to zeroed totals when a query fails", async () => {
    mockGetIncomeByType.mockRejectedValue(new Error("db down"));

    const result = await getFundBalance("maintenance");

    expect(result).toEqual({ income: 0, expenses: 0, balance: 0 });
  });
});

describe("getAllFundsBalances", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("consolidates income across all fund types against total expenses", async () => {
    mockGetIncomeByType.mockImplementation(
      async (type: string) =>
        ({ maintenance: 1000, works: 500, others: 200 })[type] ?? 0
    );
    mockGetTotalOtherIncomeByType.mockResolvedValue(0);
    mockGetTotalExpensesByType.mockResolvedValue(0);
    mockGetTotalExpenses.mockResolvedValue(300);

    const result = await getAllFundsBalances();

    expect(result.maintenance).toEqual({
      income: 1000,
      expenses: 0,
      balance: 1000,
    });
    expect(result.works).toEqual({ income: 500, expenses: 0, balance: 500 });
    expect(result.others).toEqual({ income: 200, expenses: 0, balance: 200 });
    expect(result.consolidated).toEqual({
      income: 1700,
      expenses: 300,
      balance: 1400,
    });
  });
});
