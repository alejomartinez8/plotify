import { describe, it, expect, afterEach, vi } from "vitest";
import type { QuotaConfig as PrismaQuotaConfig } from "@prisma/client";
import { toQuotaConfig } from "./quotas";
import { parseLocalDate } from "@/lib/utils";

function makePrismaQuotaConfig(
  overrides: Partial<PrismaQuotaConfig> = {}
): PrismaQuotaConfig {
  return {
    id: "quota-1",
    year: 2026,
    month: null,
    quotaType: "maintenance",
    amount: 50000,
    description: null,
    dueDate: null,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  } as PrismaQuotaConfig;
}

// Same root cause and fix as the "Activo desde" bug (see lots.test.ts),
// applied to QuotaConfig.dueDate: getQuotaConfigs() used to return a raw
// Date, which shifted a day in the browser's timezone (and could even
// misfile a quota under the wrong year in QuotaView's filter dropdown).
describe.each(["UTC", "America/Bogota"])("toQuotaConfig (TZ=%s)", (tz) => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts dueDate to a YYYY-MM-DD string that round-trips what was written", () => {
    vi.stubEnv("TZ", tz);
    const raw = makePrismaQuotaConfig({
      dueDate: parseLocalDate("2026-01-01"),
    });
    expect(toQuotaConfig(raw).dueDate).toBe("2026-01-01");
  });

  it("passes through a null dueDate unchanged", () => {
    vi.stubEnv("TZ", tz);
    const raw = makePrismaQuotaConfig({ dueDate: null });
    expect(toQuotaConfig(raw).dueDate).toBeNull();
  });
});
