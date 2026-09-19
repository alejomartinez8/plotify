import { describe, it, expect, afterEach, vi } from "vitest";
import type { QuotaConfig as PrismaQuotaConfig } from "@prisma/client";
import { parseLocalDate } from "@/lib/utils";

vi.mock("@/lib/prisma", () => ({
  default: {
    quotaConfig: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import {
  toQuotaConfig,
  createQuotaConfig,
  updateQuotaConfig,
  deleteQuotaConfig,
} from "./quotas";

const mockedCreate = vi.mocked(prisma.quotaConfig.create);
const mockedUpdate = vi.mocked(prisma.quotaConfig.update);
const mockedDelete = vi.mocked(prisma.quotaConfig.delete);

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
    stages: [],
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

describe("createQuotaConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("stamps the current year on the created quota", async () => {
    mockedCreate.mockResolvedValue(makePrismaQuotaConfig());

    await createQuotaConfig({ quotaType: "maintenance", amount: 5000 });

    expect(mockedCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ year: new Date().getFullYear() }),
    });
  });

  it("returns null instead of throwing when the database call fails", async () => {
    mockedCreate.mockRejectedValue(new Error("db down"));

    const result = await createQuotaConfig({
      quotaType: "maintenance",
      amount: 5000,
    });

    expect(result).toBeNull();
  });

  it("forwards the stages array for a works quota", async () => {
    mockedCreate.mockResolvedValue(makePrismaQuotaConfig());

    await createQuotaConfig({
      quotaType: "works",
      amount: 300000,
      stages: [1, 2],
    });

    expect(mockedCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ stages: [1, 2] }),
    });
  });
});

describe("updateQuotaConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("only sends the fields that were provided", async () => {
    mockedUpdate.mockResolvedValue(makePrismaQuotaConfig());

    await updateQuotaConfig("quota-1", { amount: 6000 });

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "quota-1" },
      data: { amount: 6000 },
    });
  });

  it("allows clearing description and dueDate with null", async () => {
    mockedUpdate.mockResolvedValue(makePrismaQuotaConfig());

    await updateQuotaConfig("quota-1", { description: null, dueDate: null });

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "quota-1" },
      data: { description: null, dueDate: null },
    });
  });
});

describe("deleteQuotaConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success", async () => {
    mockedDelete.mockResolvedValue(makePrismaQuotaConfig());

    expect(await deleteQuotaConfig("quota-1")).toBe(true);
  });

  it("returns false instead of throwing when the database call fails", async () => {
    mockedDelete.mockRejectedValue(new Error("db down"));

    expect(await deleteQuotaConfig("quota-1")).toBe(false);
  });
});
