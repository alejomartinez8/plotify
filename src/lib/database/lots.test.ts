import { describe, it, expect, afterEach, vi } from "vitest";
import type { Lot as PrismaLot } from "@prisma/client";
import { toLot } from "./lots";
import { parseLocalDate } from "@/lib/utils";

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
