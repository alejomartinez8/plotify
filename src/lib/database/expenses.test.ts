import { describe, it, expect, afterEach, vi } from "vitest";
import type { Expense as PrismaExpense } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    expense: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
    approvalHistory: { create: vi.fn() },
  },
}));

import prisma from "@/lib/prisma";
import {
  createExpense,
  deleteExpense,
  approveExpense,
  unapproveExpense,
  getTotalExpenses,
  getTotalExpensesByType,
} from "./expenses";

function makePrismaExpense(
  overrides: Partial<PrismaExpense> = {}
): PrismaExpense {
  return {
    id: 1,
    type: "maintenance",
    amount: 5000,
    date: "2026-01-15",
    description: "",
    category: "",
    receiptNumber: null,
    receiptFileId: null,
    receiptFileUrl: null,
    receiptFileName: null,
    approvalStatus: "pending",
    approvalNote: null,
    approvedBy: null,
    approvedAt: null,
    ...overrides,
  } as PrismaExpense;
}

const mockedCreate = vi.mocked(prisma.expense.create);
const mockedDelete = vi.mocked(prisma.expense.delete);
const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedAggregate = vi.mocked(prisma.expense.aggregate);

describe("createExpense", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the created expense on success", async () => {
    mockedCreate.mockResolvedValue(makePrismaExpense());

    const result = await createExpense({
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
      category: "",
    });

    expect(result?.amount).toBe(5000);
  });

  it("returns null instead of throwing when the database call fails", async () => {
    mockedCreate.mockRejectedValue(new Error("db down"));

    const result = await createExpense({
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
      category: "",
    });

    expect(result).toBeNull();
  });
});

describe("deleteExpense", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success", async () => {
    mockedDelete.mockResolvedValue(makePrismaExpense());

    expect(await deleteExpense(1)).toBe(true);
  });

  it("returns false instead of throwing when the database call fails", async () => {
    mockedDelete.mockRejectedValue(new Error("db down"));

    expect(await deleteExpense(1)).toBe(false);
  });
});

describe("approveExpense / unapproveExpense", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("approves and writes an ApprovalHistory row in the same transaction", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaExpense({
        approvalStatus: "approved",
        approvedBy: "t@example.com",
      }),
      {},
    ]);

    const result = await approveExpense(1, "t@example.com", "ok");

    expect(result?.approvalStatus).toBe("approved");
    expect(mockedTransaction).toHaveBeenCalledTimes(1);
  });

  it("un-approves, resetting the approval fields back to pending", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaExpense({ approvalStatus: "pending" }),
      {},
    ]);

    const result = await unapproveExpense(1, "t@example.com");

    expect(result?.approvalStatus).toBe("pending");
  });

  it("returns null instead of throwing when the transaction fails", async () => {
    mockedTransaction.mockRejectedValue(new Error("db down"));

    expect(await approveExpense(1, "t@example.com")).toBeNull();
  });
});

describe("getTotalExpenses / getTotalExpensesByType", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 instead of null when there are no matching expenses", async () => {
    mockedAggregate.mockResolvedValue({ _sum: { amount: null } } as never);

    expect(await getTotalExpenses()).toBe(0);
    expect(await getTotalExpensesByType("maintenance")).toBe(0);
  });

  it("returns 0 instead of throwing when the aggregate query fails", async () => {
    mockedAggregate.mockRejectedValue(new Error("db down"));

    expect(await getTotalExpenses()).toBe(0);
  });
});
