import { describe, it, expect, afterEach, vi } from "vitest";

const mockRequireAdmin = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    lot: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    contribution: { create: vi.fn() },
    expense: { create: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/lib/prisma";
import {
  importLotsAction,
  importIncomesAction,
  importExpensesAction,
} from "./import-actions";

const mockedLotFindFirst = vi.mocked(prisma.lot.findFirst);
const mockedLotCreate = vi.mocked(prisma.lot.create);
const mockedLotUpdate = vi.mocked(prisma.lot.update);
const mockedContributionCreate = vi.mocked(prisma.contribution.create);
const mockedExpenseCreate = vi.mocked(prisma.expense.create);

describe("importLotsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a CSV with only a header row", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);

    const result = await importLotsAction("ID,Número de Lote,Propietario");

    expect(result.success).toBe(false);
  });

  it("rejects a CSV whose headers don't match what's expected", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);

    const result = await importLotsAction("ID,Lote,Owner\n1,001,Jane Doe");

    expect(result.success).toBe(false);
  });

  it("creates a new lot when the lot number does not already exist", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue(null);
    mockedLotCreate.mockResolvedValue({ id: "lot-1" } as never);

    const result = await importLotsAction(
      'ID,Número de Lote,Propietario\n1,"001","Jane Doe"'
    );

    expect(result.success).toBe(true);
    expect(result.imported).toBe(1);
    expect(mockedLotCreate).toHaveBeenCalledWith({
      data: { lotNumber: "001", owner: "Jane Doe" },
    });
  });

  it("updates the existing lot when the lot number is already present", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue({ id: "lot-1" } as never);
    mockedLotUpdate.mockResolvedValue({ id: "lot-1" } as never);

    const result = await importLotsAction(
      'ID,Número de Lote,Propietario\n1,"001","Jane Doe"'
    );

    expect(result.success).toBe(true);
    expect(mockedLotUpdate).toHaveBeenCalledWith({
      where: { id: "lot-1" },
      data: { owner: "Jane Doe" },
    });
    expect(mockedLotCreate).not.toHaveBeenCalled();
  });

  it("records a per-row error and keeps processing the rest", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue(null);
    mockedLotCreate.mockResolvedValue({ id: "lot-2" } as never);

    const result = await importLotsAction(
      'ID,Número de Lote,Propietario\n1,"","Missing lot number"\n2,"002","Jane Doe"'
    );

    expect(result.imported).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]).toContain("Fila 2");
  });

  it("reports failure when the user is not an admin", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Admin access required"));

    const result = await importLotsAction(
      "ID,Número de Lote,Propietario\n1,001,Jane Doe"
    );

    expect(result.success).toBe(false);
    expect(mockedLotFindFirst).not.toHaveBeenCalled();
  });
});

describe("importIncomesAction", () => {
  const headers =
    "ID,Fecha,Número de Lote,Propietario,Tipo,Descripción,Número de Recibo,Monto";

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("parses a DD/MM/YYYY date and maps 'Mantenimiento' to maintenance", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue({ id: "lot-1" } as never);
    mockedContributionCreate.mockResolvedValue({ id: 1 } as never);

    const result = await importIncomesAction(
      `${headers}\n1,"15/01/2026","001","Jane Doe","Mantenimiento","fee","REC-1","5000"`
    );

    expect(result.success).toBe(true);
    expect(result.imported).toBe(1);
    const createCall = mockedContributionCreate.mock.calls[0][0].data as {
      type: string;
      date: string;
      amount: number;
    };
    expect(createCall.type).toBe("maintenance");
    expect(createCall.amount).toBe(5000);
    expect(new Date(createCall.date).getUTCMonth()).toBe(0);
  });

  it("maps any non-Mantenimiento label to works", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue({ id: "lot-1" } as never);
    mockedContributionCreate.mockResolvedValue({ id: 1 } as never);

    await importIncomesAction(
      `${headers}\n1,"2026-01-15","001","Jane Doe","Obras","works fee","REC-1","5000"`
    );

    const createCall = mockedContributionCreate.mock.calls[0][0].data as {
      type: string;
    };
    expect(createCall.type).toBe("works");
  });

  it("creates the lot first when the lot number isn't found", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedLotFindFirst.mockResolvedValue(null);
    mockedLotCreate.mockResolvedValue({ id: "new-lot" } as never);
    mockedContributionCreate.mockResolvedValue({ id: 1 } as never);

    await importIncomesAction(
      `${headers}\n1,"2026-01-15","999","New Owner","Mantenimiento","fee","","5000"`
    );

    expect(mockedLotCreate).toHaveBeenCalledWith({
      data: { lotNumber: "999", owner: "New Owner" },
    });
    expect(mockedContributionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lotId: "new-lot" }),
      })
    );
  });

  it("skips a row with a missing or non-numeric amount", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);

    const result = await importIncomesAction(
      `${headers}\n1,"2026-01-15","001","Jane Doe","Mantenimiento","fee","","not-a-number"`
    );

    expect(result.imported).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(mockedContributionCreate).not.toHaveBeenCalled();
  });
});

describe("importExpensesAction", () => {
  const headers = "ID,Fecha,Tipo,Categoría,Descripción,Número de Recibo,Monto";

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["Mantenimiento", "maintenance"],
    ["Obras", "works"],
    ["Otros", "others"],
    ["Unrecognized", "others"],
  ])("maps the '%s' label to %s", async (label, expected) => {
    mockRequireAdmin.mockResolvedValue(undefined);
    mockedExpenseCreate.mockResolvedValue({ id: 1 } as never);

    await importExpensesAction(
      `${headers}\n1,"2026-01-15","${label}","Cat","desc","","1000"`
    );

    const createCall = mockedExpenseCreate.mock.calls[0][0].data as {
      type: string;
    };
    expect(createCall.type).toBe(expected);
  });

  it("skips a row with a missing amount", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);

    const result = await importExpensesAction(
      `${headers}\n1,"2026-01-15","Otros","Cat","desc","","0"`
    );

    expect(result.imported).toBe(0);
    expect(result.errors).toHaveLength(1);
  });
});
