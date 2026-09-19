import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateContribution = vi.fn();
const mockUpdateContribution = vi.fn();
const mockDeleteContribution = vi.fn();
const mockGetContributionById = vi.fn();
vi.mock("@/lib/database/contributions", () => ({
  createContribution: (...args: unknown[]) => mockCreateContribution(...args),
  updateContribution: (...args: unknown[]) => mockUpdateContribution(...args),
  deleteContribution: (...args: unknown[]) => mockDeleteContribution(...args),
  getContributionById: (...args: unknown[]) => mockGetContributionById(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createContributionAction,
  updateContributionAction,
  deleteContributionAction,
} from "./contribution-actions";
import { translations } from "@/lib/translations";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("lotId", overrides.lotId ?? "lot-1");
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

function makeExistingContribution(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    lotId: "lot-1",
    type: "maintenance",
    amount: 5000,
    date: "2026-01-15",
    description: "",
    approvalStatus: "pending",
    ...overrides,
  };
}

describe("createContributionAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the contribution is created", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateContribution.mockResolvedValue({ id: 1 });

    const result = await createContributionAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(true);
    expect(mockCreateContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        lotId: "lot-1",
        type: "maintenance",
        amount: 5000,
      })
    );
  });

  it("does not create when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required to create contributions",
    });

    const result = await createContributionAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateContribution).not.toHaveBeenCalled();
  });

  it("rejects invalid data before hitting the database", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createContributionAction(
      { message: null, errors: {} },
      makeFormData({ type: "invalid-type" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.type).toBeDefined();
    expect(mockCreateContribution).not.toHaveBeenCalled();
  });

  it("reports a database error when creation returns null", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateContribution.mockResolvedValue(null);

    const result = await createContributionAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
  });

  it("reports a database error when creation throws", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateContribution.mockRejectedValue(new Error("connection refused"));

    const result = await createContributionAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
  });
});

describe("updateContributionAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the contribution is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(makeExistingContribution());
    mockUpdateContribution.mockResolvedValue({ id: 1 });

    const result = await updateContributionAction(
      { message: null, errors: {} },
      makeFormData({ id: "1" })
    );

    expect(result.success).toBe(true);
  });

  it("blocks changing amount/type/date on an approved contribution", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(
      makeExistingContribution({ approvalStatus: "approved" })
    );

    const result = await updateContributionAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", amount: "9999" })
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotEditApprovedField);
    expect(mockUpdateContribution).not.toHaveBeenCalled();
  });

  it("allows editing description on an approved contribution", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(
      makeExistingContribution({ approvalStatus: "approved" })
    );
    mockUpdateContribution.mockResolvedValue({ id: 1 });

    const result = await updateContributionAction(
      { message: null, errors: {} },
      makeFormData({ id: "1", description: "updated note" })
    );

    expect(result.success).toBe(true);
    expect(mockUpdateContribution).toHaveBeenCalled();
  });

  it("reports failure when the contribution does not exist", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(null);

    const result = await updateContributionAction(
      { message: null, errors: {} },
      makeFormData({ id: "1" })
    );

    expect(result.success).toBe(false);
    expect(mockUpdateContribution).not.toHaveBeenCalled();
  });
});

describe("deleteContributionAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes when the contribution is not approved", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(makeExistingContribution());
    mockDeleteContribution.mockResolvedValue(true);

    const result = await deleteContributionAction(1);

    expect(result.success).toBe(true);
  });

  it("refuses to delete an approved contribution", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetContributionById.mockResolvedValue(
      makeExistingContribution({ approvalStatus: "approved" })
    );

    const result = await deleteContributionAction(1);

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotDeleteApproved);
    expect(mockDeleteContribution).not.toHaveBeenCalled();
  });
});
