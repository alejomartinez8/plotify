import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateExpense = vi.fn();
const mockUpdateExpense = vi.fn();
const mockDeleteExpense = vi.fn();
const mockGetExpenseById = vi.fn();
vi.mock("@/lib/database/expenses", () => ({
  createExpense: (...args: unknown[]) => mockCreateExpense(...args),
  updateExpense: (...args: unknown[]) => mockUpdateExpense(...args),
  deleteExpense: (...args: unknown[]) => mockDeleteExpense(...args),
  getExpenseById: (...args: unknown[]) => mockGetExpenseById(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "./expense-actions";
import { translations } from "@/lib/translations";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("type", overrides.type ?? "maintenance");
  formData.set("amount", overrides.amount ?? "5000");
  formData.set("date", overrides.date ?? "2026-01-15");
  formData.set("description", overrides.description ?? "");
  formData.set("category", overrides.category ?? "");
  formData.set("receiptNumber", overrides.receiptNumber ?? "");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

function makeExistingExpense(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: "maintenance",
    amount: 5000,
    date: "2026-01-15",
    description: "",
    category: "",
    approvalStatus: "pending",
    ...overrides,
  };
}

describe("createExpenseAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the expense is created", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateExpense.mockResolvedValue({ id: 1 });

    const result = await createExpenseAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(true);
  });

  it("does not create when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required to create expenses",
    });

    const result = await createExpenseAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("rejects a non-positive amount before hitting the database", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createExpenseAction(
      { message: null, errors: {} },
      makeFormData({ amount: "0" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.amount).toBeDefined();
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("reports a database error when creation throws", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateExpense.mockRejectedValue(new Error("connection refused"));

    const result = await createExpenseAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
  });
});

describe("updateExpenseAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the expense is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetExpenseById.mockResolvedValue(makeExistingExpense());
    mockUpdateExpense.mockResolvedValue({ id: 1 });

    const result = await updateExpenseAction(
      { message: null, errors: {} },
      makeFormData({ id: "1" })
    );

    expect(result.success).toBe(true);
  });

  it("blocks changing amount/type/date/category on an approved expense", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetExpenseById.mockResolvedValue(
      makeExistingExpense({ approvalStatus: "approved" })
    );

    const result = await updateExpenseAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", amount: "9999" })
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotEditApprovedField);
    expect(mockUpdateExpense).not.toHaveBeenCalled();
  });

  it("allows editing description on an approved expense", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetExpenseById.mockResolvedValue(
      makeExistingExpense({ approvalStatus: "approved" })
    );
    mockUpdateExpense.mockResolvedValue({ id: 1 });

    const result = await updateExpenseAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", description: "updated note" })
    );

    expect(result.success).toBe(true);
  });
});

describe("deleteExpenseAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes when the expense is not approved", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetExpenseById.mockResolvedValue(makeExistingExpense());
    mockDeleteExpense.mockResolvedValue(true);

    const result = await deleteExpenseAction(1);

    expect(result.success).toBe(true);
  });

  it("refuses to delete an approved expense", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetExpenseById.mockResolvedValue(
      makeExistingExpense({ approvalStatus: "approved" })
    );

    const result = await deleteExpenseAction(1);

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotDeleteApproved);
    expect(mockDeleteExpense).not.toHaveBeenCalled();
  });
});
