import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckTreasurerAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkTreasurerAccess: (...args: unknown[]) =>
    mockCheckTreasurerAccess(...args),
}));

const mockApproveContribution = vi.fn();
const mockUnapproveContribution = vi.fn();
vi.mock("@/lib/database/contributions", () => ({
  approveContribution: (...args: unknown[]) => mockApproveContribution(...args),
  unapproveContribution: (...args: unknown[]) =>
    mockUnapproveContribution(...args),
}));

const mockApproveExpense = vi.fn();
const mockUnapproveExpense = vi.fn();
vi.mock("@/lib/database/expenses", () => ({
  approveExpense: (...args: unknown[]) => mockApproveExpense(...args),
  unapproveExpense: (...args: unknown[]) => mockUnapproveExpense(...args),
}));

const mockGetApprovalHistory = vi.fn();
vi.mock("@/lib/database/approval-history", () => ({
  getApprovalHistory: (...args: unknown[]) => mockGetApprovalHistory(...args),
}));

const mockGetUserEmail = vi.fn();
const mockIsAdmin = vi.fn();
const mockIsTreasurer = vi.fn();
vi.mock("@/lib/auth", () => ({
  getUserEmail: () => mockGetUserEmail(),
  isAdmin: () => mockIsAdmin(),
  isTreasurer: () => mockIsTreasurer(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  approveContributionAction,
  unapproveContributionAction,
  approveExpenseAction,
  unapproveExpenseAction,
  getApprovalHistoryAction,
} from "./approval-actions";
import { translations } from "@/lib/translations";

describe("approveContributionAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("approves using the acting treasurer's email", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("treasurer@example.com");
    mockApproveContribution.mockResolvedValue({ id: 1 });

    const result = await approveContributionAction(1, "looks right");

    expect(result.success).toBe(true);
    expect(mockApproveContribution).toHaveBeenCalledWith(
      1,
      "treasurer@example.com",
      "looks right"
    );
  });

  it("does not approve when treasurer access is denied", async () => {
    mockCheckTreasurerAccess.mockResolvedValue({
      success: false,
      message: translations.errors.treasurerAccessRequired,
    });

    const result = await approveContributionAction(1);

    expect(result.success).toBe(false);
    expect(mockApproveContribution).not.toHaveBeenCalled();
  });

  it("reports failure when the session has no treasurer email", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue(null);

    const result = await approveContributionAction(1);

    expect(result.success).toBe(false);
    expect(mockApproveContribution).not.toHaveBeenCalled();
  });

  it("reports failure when the database call returns null", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("treasurer@example.com");
    mockApproveContribution.mockResolvedValue(null);

    const result = await approveContributionAction(1);

    expect(result.success).toBe(false);
  });
});

describe("unapproveContributionAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("unapproves using the acting treasurer's email", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("treasurer@example.com");
    mockUnapproveContribution.mockResolvedValue({ id: 1 });

    const result = await unapproveContributionAction(1, "mistake");

    expect(result.success).toBe(true);
    expect(mockUnapproveContribution).toHaveBeenCalledWith(
      1,
      "treasurer@example.com",
      "mistake"
    );
  });
});

describe("approveExpenseAction / unapproveExpenseAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("approves an expense using the acting treasurer's email", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("treasurer@example.com");
    mockApproveExpense.mockResolvedValue({ id: 1 });

    const result = await approveExpenseAction(1);

    expect(result.success).toBe(true);
    expect(mockApproveExpense).toHaveBeenCalledWith(
      1,
      "treasurer@example.com",
      null
    );
  });

  it("unapproves an expense using the acting treasurer's email", async () => {
    mockCheckTreasurerAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("treasurer@example.com");
    mockUnapproveExpense.mockResolvedValue({ id: 1 });

    const result = await unapproveExpenseAction(1);

    expect(result.success).toBe(true);
    expect(mockUnapproveExpense).toHaveBeenCalledWith(
      1,
      "treasurer@example.com",
      null
    );
  });
});

describe("getApprovalHistoryAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the history for an admin", async () => {
    mockIsAdmin.mockResolvedValue(true);
    mockIsTreasurer.mockResolvedValue(false);
    mockGetApprovalHistory.mockResolvedValue([{ id: 1 }]);

    const result = await getApprovalHistoryAction("contribution", 1);

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns the history for a treasurer", async () => {
    mockIsAdmin.mockResolvedValue(false);
    mockIsTreasurer.mockResolvedValue(true);
    mockGetApprovalHistory.mockResolvedValue([{ id: 1 }]);

    const result = await getApprovalHistoryAction("expense", 1);

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns an empty array for anyone else", async () => {
    mockIsAdmin.mockResolvedValue(false);
    mockIsTreasurer.mockResolvedValue(false);

    const result = await getApprovalHistoryAction("contribution", 1);

    expect(result).toEqual([]);
    expect(mockGetApprovalHistory).not.toHaveBeenCalled();
  });
});
