import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateQuotaConfig = vi.fn();
const mockUpdateQuotaConfig = vi.fn();
const mockDeleteQuotaConfig = vi.fn();
vi.mock("@/lib/database/quotas", () => ({
  createQuotaConfig: (...args: unknown[]) => mockCreateQuotaConfig(...args),
  updateQuotaConfig: (...args: unknown[]) => mockUpdateQuotaConfig(...args),
  deleteQuotaConfig: (...args: unknown[]) => mockDeleteQuotaConfig(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createQuotaConfigAction,
  updateQuotaConfigAction,
  deleteQuotaConfigAction,
} from "./quota-actions";
import { translations } from "@/lib/translations";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("quotaType", overrides.quotaType ?? "maintenance");
  formData.set("amount", overrides.amount ?? "5000");
  formData.set("description", overrides.description ?? "");
  formData.set("dueDate", overrides.dueDate ?? "2026-01-15");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("createQuotaConfigAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success and forwards a parsed dueDate", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateQuotaConfig.mockResolvedValue({ id: "quota-1" });

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(true);
    expect(mockCreateQuotaConfig).toHaveBeenCalledWith(
      expect.objectContaining({ quotaType: "maintenance", amount: 5000 })
    );
  });

  it("does not create when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required",
    });

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateQuotaConfig).not.toHaveBeenCalled();
  });

  it("rejects a missing due date before hitting the database", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData({ dueDate: "" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.dueDate).toBeDefined();
    expect(mockCreateQuotaConfig).not.toHaveBeenCalled();
  });

  it("reports a database error when creation throws", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateQuotaConfig.mockRejectedValue(new Error("connection refused"));

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
  });

  it("requires a due date for a works quota too, and forwards its stages", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateQuotaConfig.mockResolvedValue({ id: "quota-1" });

    const formData = makeFormData({ quotaType: "works" });
    formData.append("stages", "1");
    formData.append("stages", "2");

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      formData
    );

    expect(result.success).toBe(true);
    expect(mockCreateQuotaConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        quotaType: "works",
        stages: [1, 2],
      })
    );
  });

  it("rejects a works quota with no due date", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const formData = makeFormData({ quotaType: "works", dueDate: "" });
    formData.append("stages", "1");

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      formData
    );

    expect(result.success).toBe(false);
    expect(result.errors?.dueDate).toBeDefined();
    expect(mockCreateQuotaConfig).not.toHaveBeenCalled();
  });

  it("rejects a works quota with no stage selected", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData({ quotaType: "works" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.stages).toBeDefined();
    expect(mockCreateQuotaConfig).not.toHaveBeenCalled();
  });
});

describe("updateQuotaConfigAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the quota config is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockUpdateQuotaConfig.mockResolvedValue({ id: "quota-1" });

    const result = await updateQuotaConfigAction(
      { message: null, errors: {} },
      makeFormData({ id: "quota-1" })
    );

    expect(result.success).toBe(true);
  });
});

describe("deleteQuotaConfigAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes and reports success", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockDeleteQuotaConfig.mockResolvedValue(true);

    const result = await deleteQuotaConfigAction("quota-1");

    expect(result.success).toBe(true);
  });

  it("does not delete when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required",
    });

    const result = await deleteQuotaConfigAction("quota-1");

    expect(result.success).toBe(false);
    expect(mockDeleteQuotaConfig).not.toHaveBeenCalled();
  });

  it("reports a database error when deletion throws", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockDeleteQuotaConfig.mockRejectedValue(new Error("connection refused"));

    const result = await deleteQuotaConfigAction("quota-1");

    expect(result.success).toBe(false);
    expect(result.message).toContain(translations.errors.database);
  });
});
