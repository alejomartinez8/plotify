import { describe, it, expect, afterEach, vi } from "vitest";
import type { Lot as PrismaLot } from "@prisma/client";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    lot: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { toLot, createLot, updateLot } from "./lots";
import { parseLocalDate } from "@/lib/utils";

const mockedLotCreate = vi.mocked(prisma.lot.create);
const mockedLotUpdate = vi.mocked(prisma.lot.update);

function makePrismaLot(overrides: Partial<PrismaLot> = {}): PrismaLot {
  return {
    id: "lot-1",
    lotNumber: "001",
    owner: "Jane Doe",
    ownerEmail: null,
    whatsappPhone: null,
    initialWorksDebt: 0,
    isExempt: false,
    exemptionReason: null,
    exemptionEndDate: null,
    ...overrides,
  } as PrismaLot;
}

// Regression tests for the "Activo desde" bug: getLots()/getLotById() used
// to return exemptionEndDate as a raw Date, which shifted a day once
// formatted in the browser's timezone. toLot() converts it to a
// "YYYY-MM-DD" string on the server so that never happens again.
describe.each(["UTC", "America/Bogota"])("toLot (TZ=%s)", (tz) => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts exemptionEndDate to a YYYY-MM-DD string that round-trips what was written", () => {
    vi.stubEnv("TZ", tz);
    // parseLocalDate("2026-01-01") is exactly what createLot/updateLot
    // stores server-side for this input.
    const raw = makePrismaLot({
      exemptionEndDate: parseLocalDate("2026-01-01"),
    });
    expect(toLot(raw).exemptionEndDate).toBe("2026-01-01");
  });

  it("passes through a null exemptionEndDate unchanged", () => {
    vi.stubEnv("TZ", tz);
    const raw = makePrismaLot({ exemptionEndDate: null });
    expect(toLot(raw).exemptionEndDate).toBeNull();
  });
});

// Regression tests for the "no se pueden crear nuevos lotes" bug:
// createLot()/updateLot() used to catch their own Prisma errors and return
// null, so a failed write (e.g. a duplicate lot number) looked identical to
// a successful one to any caller. They must now propagate the error.
describe("createLot", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the created lot on success", async () => {
    mockedLotCreate.mockResolvedValue(makePrismaLot({ lotNumber: "002" }));

    const lot = await createLot({ lotNumber: "002", owner: "John Doe" });

    expect(lot.lotNumber).toBe("002");
  });

  it("propagates a database error instead of returning null", async () => {
    const dbError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`lotNumber`)",
      { code: "P2002", clientVersion: "6.19.0" }
    );
    mockedLotCreate.mockRejectedValue(dbError);

    await expect(
      createLot({ lotNumber: "001", owner: "Jane Doe" })
    ).rejects.toBe(dbError);
  });
});

describe("updateLot", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the updated lot on success", async () => {
    mockedLotUpdate.mockResolvedValue(makePrismaLot({ owner: "Jane Smith" }));

    const lot = await updateLot("lot-1", { owner: "Jane Smith" });

    expect(lot.owner).toBe("Jane Smith");
  });

  it("propagates a database error instead of returning null", async () => {
    const dbError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`lotNumber`)",
      { code: "P2002", clientVersion: "6.19.0" }
    );
    mockedLotUpdate.mockRejectedValue(dbError);

    await expect(
      updateLot("lot-1", { lotNumber: "001" })
    ).rejects.toBe(dbError);
  });
});
