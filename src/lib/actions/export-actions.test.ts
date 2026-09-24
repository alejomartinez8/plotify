import { describe, it, expect, afterEach, vi } from "vitest";

const mockRequireAdmin = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    contribution: { findMany: vi.fn() },
    lot: { findMany: vi.fn() },
  },
}));

const mockGetExpenses = vi.fn();
vi.mock("@/lib/database/expenses", () => ({
  getExpenses: (...args: unknown[]) => mockGetExpenses(...args),
}));

import prisma from "@/lib/prisma";
import {
  exportIncomesAction,
  exportExpensesAction,
  exportLotsAction,
} from "./export-actions";

const mockedContributionFindMany = vi.mocked(prisma.contribution.findMany);
const mockedLotFindMany = vi.mocked(prisma.lot.findMany);

describe("exportIncomesAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("builds a CSV with a UTF-8 BOM and translated type labels", async () => {
    mockedContributionFindMany.mockResolvedValue([
      {
        id: 1,
        date: "2026-01-15",
        type: "maintenance",
        description: "fee",
        receiptNumber: "REC-1",
        amount: 5000,
        lot: { lotNumber: "001", owner: "Jane Doe" },
      },
    ] as never);

    const result = await exportIncomesAction();

    expect(result.success).toBe(true);
    expect(result.data?.startsWith("﻿")).toBe(true);
    expect(result.data).toContain('"Mantenimiento"');
    expect(result.data).toContain('"001"');
    expect(result.filename).toMatch(/^ingresos_.*\.csv$/);
  });

  it("returns an error result instead of throwing when the query fails", async () => {
    mockedContributionFindMany.mockRejectedValue(new Error("db down"));

    const result = await exportIncomesAction();

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
  });
});

describe("exportExpensesAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("maps each expense type to its Spanish label", async () => {
    mockGetExpenses.mockResolvedValue([
      {
        id: 1,
        date: "2026-01-15",
        type: "works",
        category: "Cat",
        description: "desc",
        receiptNumber: null,
        amount: 1000,
      },
    ]);

    const result = await exportExpensesAction();

    expect(result.success).toBe(true);
    expect(result.data).toContain('"Obras"');
    expect(result.filename).toMatch(/^gastos_.*\.csv$/);
  });

  it("returns an error result instead of throwing when the query fails", async () => {
    mockGetExpenses.mockRejectedValue(new Error("db down"));

    const result = await exportExpensesAction();

    expect(result.success).toBe(false);
  });
});

describe("export actions authorization", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not export incomes for a non-admin", async () => {
    mockRequireAdmin.mockRejectedValueOnce(new Error("Admin access required"));

    const result = await exportIncomesAction();

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(mockedContributionFindMany).not.toHaveBeenCalled();
  });

  it("does not export expenses for a non-admin", async () => {
    mockRequireAdmin.mockRejectedValueOnce(new Error("Admin access required"));

    const result = await exportExpensesAction();

    expect(result.success).toBe(false);
    expect(mockGetExpenses).not.toHaveBeenCalled();
  });
});

describe("exportLotsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("builds a CSV of lots ordered by lot number", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindMany.mockResolvedValue([
      { id: "lot-1", lotNumber: "001", owner: "Jane Doe" },
    ] as never);

    const result = await exportLotsAction();

    expect(result.success).toBe(true);
    expect(result.data).toContain('"001"');
    expect(result.filename).toMatch(/^lotes_.*\.csv$/);
  });

  it("reports failure when the user is not an admin", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Admin access required"));

    const result = await exportLotsAction();

    expect(result.success).toBe(false);
    expect(mockedLotFindMany).not.toHaveBeenCalled();
  });
});
