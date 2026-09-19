import { describe, it, expect, afterEach, vi } from "vitest";
import type { Contribution as PrismaContribution } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    contribution: {
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
  createContribution,
  updateContribution,
  deleteContribution,
  approveContribution,
  unapproveContribution,
  getIncomeByType,
} from "./contributions";

function makePrismaContribution(
  overrides: Partial<PrismaContribution> = {}
): PrismaContribution {
  return {
    id: 1,
    lotId: "lot-1",
    type: "maintenance",
    amount: 5000,
    date: new Date(2026, 0, 15),
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
  } as PrismaContribution;
}

const mockedCreate = vi.mocked(prisma.contribution.create);
const mockedUpdate = vi.mocked(prisma.contribution.update);
const mockedDelete = vi.mocked(prisma.contribution.delete);
const mockedTransaction = vi.mocked(prisma.$transaction);

describe("createContribution", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("parses a YYYY-MM-DD date as a local date, not UTC midnight", async () => {
    mockedCreate.mockResolvedValue(makePrismaContribution());

    await createContribution({
      lotId: "lot-1",
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
    });

    const passedDate = mockedCreate.mock.calls[0][0].data.date as Date;
    expect(passedDate.getFullYear()).toBe(2026);
    expect(passedDate.getMonth()).toBe(0);
    expect(passedDate.getDate()).toBe(15);
  });

  it("returns null instead of throwing when the database call fails", async () => {
    mockedCreate.mockRejectedValue(new Error("db down"));

    const result = await createContribution({
      lotId: "lot-1",
      type: "maintenance",
      amount: 5000,
      date: "2026-01-15",
      description: "",
    });

    expect(result).toBeNull();
  });
});

describe("updateContribution", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("parses a YYYY-MM-DD date as a local date when updating", async () => {
    mockedUpdate.mockResolvedValue(makePrismaContribution());

    await updateContribution(1, { date: "2026-03-01" });

    const passedDate = mockedUpdate.mock.calls[0][0].data.date as Date;
    expect(passedDate.getFullYear()).toBe(2026);
    expect(passedDate.getMonth()).toBe(2);
    expect(passedDate.getDate()).toBe(1);
  });

  it("leaves the date untouched when none is provided", async () => {
    mockedUpdate.mockResolvedValue(makePrismaContribution());

    await updateContribution(1, { amount: 6000 });

    expect(mockedUpdate.mock.calls[0][0].data).not.toHaveProperty("date");
  });
});

describe("deleteContribution", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success", async () => {
    mockedDelete.mockResolvedValue(makePrismaContribution());

    expect(await deleteContribution(1)).toBe(true);
  });

  it("returns false instead of throwing when the database call fails", async () => {
    mockedDelete.mockRejectedValue(new Error("db down"));

    expect(await deleteContribution(1)).toBe(false);
  });
});

describe("approveContribution / unapproveContribution", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("approves and writes an ApprovalHistory row in the same transaction", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaContribution({
        approvalStatus: "approved",
        approvedBy: "t@example.com",
      }),
      {},
    ]);

    const result = await approveContribution(1, "t@example.com", "ok");

    expect(result?.approvalStatus).toBe("approved");
    expect(mockedTransaction).toHaveBeenCalledTimes(1);
  });

  it("un-approves, resetting the approval fields back to pending", async () => {
    mockedTransaction.mockResolvedValue([
      makePrismaContribution({ approvalStatus: "pending" }),
      {},
    ]);

    const result = await unapproveContribution(1, "t@example.com");

    expect(result?.approvalStatus).toBe("pending");
  });

  it("returns null instead of throwing when the transaction fails", async () => {
    mockedTransaction.mockRejectedValue(new Error("db down"));

    expect(await approveContribution(1, "t@example.com")).toBeNull();
  });
});

describe("getIncomeByType", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 instead of null when there are no matching contributions", async () => {
    vi.mocked(prisma.contribution.aggregate).mockResolvedValue({
      _sum: { amount: null },
    } as never);

    expect(await getIncomeByType("maintenance")).toBe(0);
  });
});
