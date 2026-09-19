import { describe, it, expect, afterEach, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateLot = vi.fn();
const mockUpdateLot = vi.fn();
vi.mock("@/lib/database/lots", () => ({
  createLot: (...args: unknown[]) => mockCreateLot(...args),
  updateLot: (...args: unknown[]) => mockUpdateLot(...args),
  deleteLot: vi.fn(),
  getLots: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createLotAction, updateLotAction } from "./lot-actions";
import { translations } from "@/lib/translations";

function makeLotFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("lotNumber", overrides.lotNumber ?? "001");
  formData.set("owner", overrides.owner ?? "Jane Doe");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

function duplicateLotNumberError() {
  return new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed on the fields: (`lotNumber`)",
    { code: "P2002", clientVersion: "6.19.0" }
  );
}

// Regression tests for the "no se pueden crear nuevos lotes" bug:
// createLotAction/updateLotAction relied on createLot/updateLot throwing on
// failure, but those functions used to swallow their own errors and return
// null, so the action always reported success even when the write failed.
describe("createLotAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success and forwards the parsed fields when the lot is created", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateLot.mockResolvedValue({ id: "lot-1", lotNumber: "001" });

    const result = await createLotAction(
      { message: null, errors: {} },
      makeLotFormData({ lotNumber: "001", owner: "Jane Doe" })
    );

    expect(result.success).toBe(true);
    expect(mockCreateLot).toHaveBeenCalledWith(
      expect.objectContaining({ lotNumber: "001", owner: "Jane Doe" })
    );
  });

  it("reports a duplicate-lot-number error instead of a false success", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateLot.mockRejectedValue(duplicateLotNumberError());

    const result = await createLotAction(
      { message: null, errors: {} },
      makeLotFormData({ lotNumber: "001" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.lotNumber).toEqual([
      translations.errors.lotNumberExists,
    ]);
  });

  it("reports a generic database error for unrelated failures", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateLot.mockRejectedValue(new Error("connection refused"));

    const result = await createLotAction(
      { message: null, errors: {} },
      makeLotFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
    expect(result.errors?.lotNumber).toBeUndefined();
  });

  it("forwards the selected stage, defaulting to 1 when none is provided", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateLot.mockResolvedValue({ id: "lot-1", lotNumber: "001" });

    await createLotAction(
      { message: null, errors: {} },
      makeLotFormData({ lotNumber: "001", stage: "2" })
    );

    expect(mockCreateLot).toHaveBeenCalledWith(
      expect.objectContaining({ stage: 2 })
    );

    await createLotAction(
      { message: null, errors: {} },
      makeLotFormData({ lotNumber: "002" })
    );

    expect(mockCreateLot).toHaveBeenLastCalledWith(
      expect.objectContaining({ stage: 1 })
    );
  });

  it("does not attempt to create a lot when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required to create lots",
    });

    const result = await createLotAction(
      { message: null, errors: {} },
      makeLotFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateLot).not.toHaveBeenCalled();
  });
});

describe("updateLotAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports a duplicate-lot-number error instead of a false success", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockUpdateLot.mockRejectedValue(duplicateLotNumberError());

    const result = await updateLotAction(
      { message: null, errors: {} },
      makeLotFormData({ id: "lot-1", lotNumber: "001" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.lotNumber).toEqual([
      translations.errors.lotNumberExists,
    ]);
  });

  it("reports success when the lot is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockUpdateLot.mockResolvedValue({ id: "lot-1", lotNumber: "002" });

    const result = await updateLotAction(
      { message: null, errors: {} },
      makeLotFormData({ id: "lot-1", lotNumber: "002" })
    );

    expect(result.success).toBe(true);
  });
});
