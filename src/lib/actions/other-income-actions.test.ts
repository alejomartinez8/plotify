import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateOtherIncome = vi.fn();
const mockUpdateOtherIncome = vi.fn();
const mockDeleteOtherIncome = vi.fn();
const mockGetOtherIncomeById = vi.fn();
vi.mock("@/lib/database/other-income", () => ({
  createOtherIncome: (...args: unknown[]) => mockCreateOtherIncome(...args),
  updateOtherIncome: (...args: unknown[]) => mockUpdateOtherIncome(...args),
  deleteOtherIncome: (...args: unknown[]) => mockDeleteOtherIncome(...args),
  getOtherIncomeById: (...args: unknown[]) => mockGetOtherIncomeById(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createOtherIncomeAction,
  updateOtherIncomeAction,
  deleteOtherIncomeAction,
} from "./other-income-actions";
import { translations } from "@/lib/translations";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("type", overrides.type ?? "maintenance");
  formData.set("amount", overrides.amount ?? "5000");
  formData.set("date", overrides.date ?? "2026-01-15");
  formData.set("description", overrides.description ?? "");
  formData.set("receiptNumber", overrides.receiptNumber ?? "");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

function makeExistingOtherIncome(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: "maintenance",
    amount: 5000,
    date: "2026-01-15",
    description: "",
    approvalStatus: "pending",
    ...overrides,
  };
}

describe("createOtherIncomeAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the other income is created", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateOtherIncome.mockResolvedValue({ id: 1 });

    const result = await createOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(true);
  });

  it("does not create when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required to create other income",
    });

    const result = await createOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateOtherIncome).not.toHaveBeenCalled();
  });

  it("rejects a non-positive amount before hitting the database", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData({ amount: "0" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.amount).toBeDefined();
    expect(mockCreateOtherIncome).not.toHaveBeenCalled();
  });

  it("reports a database error when creation throws", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateOtherIncome.mockRejectedValue(new Error("connection refused"));

    const result = await createOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
  });
});

describe("updateOtherIncomeAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the other income is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetOtherIncomeById.mockResolvedValue(makeExistingOtherIncome());
    mockUpdateOtherIncome.mockResolvedValue({ id: 1 });

    const result = await updateOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData({ id: "1" })
    );

    expect(result.success).toBe(true);
  });

  it("blocks changing amount/type/date on an approved record", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetOtherIncomeById.mockResolvedValue(
      makeExistingOtherIncome({ approvalStatus: "approved" })
    );

    const result = await updateOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", amount: "9999" })
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotEditApprovedField);
    expect(mockUpdateOtherIncome).not.toHaveBeenCalled();
  });

  it("allows editing description on an approved record", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetOtherIncomeById.mockResolvedValue(
      makeExistingOtherIncome({ approvalStatus: "approved" })
    );
    mockUpdateOtherIncome.mockResolvedValue({ id: 1 });

    const result = await updateOtherIncomeAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", description: "updated note" })
    );

    expect(result.success).toBe(true);
  });
});

describe("deleteOtherIncomeAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes when the record is not approved", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetOtherIncomeById.mockResolvedValue(makeExistingOtherIncome());
    mockDeleteOtherIncome.mockResolvedValue(true);

    const result = await deleteOtherIncomeAction(1);

    expect(result.success).toBe(true);
  });

  it("refuses to delete an approved record", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetOtherIncomeById.mockResolvedValue(
      makeExistingOtherIncome({ approvalStatus: "approved" })
    );

    const result = await deleteOtherIncomeAction(1);

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotDeleteApproved);
    expect(mockDeleteOtherIncome).not.toHaveBeenCalled();
  });
});
