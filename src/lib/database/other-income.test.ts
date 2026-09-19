import { describe, it, expect, afterEach, vi } from "vitest";
import type { OtherIncome as PrismaOtherIncome } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    otherIncome: {
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
  createOtherIncome,
  deleteOtherIncome,
  approveOtherIncome,
  unapproveOtherIncome,
  getTotalOtherIncome,
  getTotalOtherIncomeByType,
} from "./other-income";

function makePrismaOtherIncome(
  overrides: Partial<PrismaOtherIncome> = {}
): PrismaOtherIncome {
  return {
    id: 1,
    type: "maintenance",
    amount: 5000,
    date: new Date("2026-01-15"),
    description: "",
    receiptNumber: null,
    receiptFileId: null,
    receiptFileUrl: null,
    receiptFileName: null,
    approvalStatus: "pending",
    approvalNote: null,
    approvedBy: null,
    approvedAt: null,
    ...overrides,
  } as PrismaOtherIncome;
}

const mockedCreate = vi.mocked(prisma.otherIncome.create);
const mockedDelete = vi.mocked(prisma.otherIncome.delete);
const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedAggregate = vi.mocked(prisma.otherIncome.aggregate);

describe("createOtherIncome", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the created other income on success", async () => {
    mockedCreate.mockResolvedValue(makePrismaOtherIncome());

    const result = await createOtherIncome({
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
    });

    expect(result?.amount).toBe(5000);
  });

  it("returns null instead of throwing when the database call fails", async () => {
    mockedCreate.mockRejectedValue(new Error("db down"));

    const result = await createOtherIncome({
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
    });

    expect(result).toBeNull();
  });
});

describe("deleteOtherIncome", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success", async () => {
    mockedDelete.mockResolvedValue(makePrismaOtherIncome());

    expect(await deleteOtherIncome(1)).toBe(true);
  });

  it("returns false instead of throwing when the database call fails", async () => {
    mockedDelete.mockRejectedValue(new Error("db down"));

    expect(await deleteOtherIncome(1)).toBe(false);
  });
});

describe("approveOtherIncome / unapproveOtherIncome", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("approves and writes an ApprovalHistory row in the same transaction", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaOtherIncome({
        approvalStatus: "approved",
        approvedBy: "t@example.com",
      }),
      {},
    ]);

    const result = await approveOtherIncome(1, "t@example.com", "ok");

    expect(result?.approvalStatus).toBe("approved");
    expect(mockedTransaction).toHaveBeenCalledTimes(1);
  });

  it("un-approves, resetting the approval fields back to pending", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaOtherIncome({ approvalStatus: "pending" }),
      {},
    ]);

    const result = await unapproveOtherIncome(1, "t@example.com");

    expect(result?.approvalStatus).toBe("pending");
  });

  it("returns null instead of throwing when the transaction fails", async () => {
    mockedTransaction.mockRejectedValue(new Error("db down"));

    expect(await approveOtherIncome(1, "t@example.com")).toBeNull();
  });
});

describe("getTotalOtherIncome / getTotalOtherIncomeByType", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 instead of null when there are no matching rows", async () => {
    mockedAggregate.mockResolvedValue({ _sum: { amount: null } } as never);

    expect(await getTotalOtherIncome()).toBe(0);
    expect(await getTotalOtherIncomeByType("maintenance")).toBe(0);
  });

  it("returns 0 instead of throwing when the aggregate query fails", async () => {
    mockedAggregate.mockRejectedValue(new Error("db down"));

    expect(await getTotalOtherIncome()).toBe(0);
  });
});
