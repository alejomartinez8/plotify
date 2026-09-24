import { describe, it, expect, vi, afterEach } from "vitest";

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

const mockGetVisibleLotIds = vi.fn();
const mockGetUserRole = vi.fn();
vi.mock("@/lib/auth", () => ({
  getVisibleLotIds: (...args: unknown[]) => mockGetVisibleLotIds(...args),
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
}));

vi.mock("@/lib/check-lot-access", () => ({
  checkLotAccess: vi.fn(),
}));

const mockGetLotWithContributions = vi.fn();
const mockGetLots = vi.fn();
vi.mock("@/lib/database/lots", () => ({
  getLotWithContributions: (...args: unknown[]) =>
    mockGetLotWithContributions(...args),
  getLots: (...args: unknown[]) => mockGetLots(...args),
}));

vi.mock("@/lib/database/quotas", () => ({
  getQuotaConfigs: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/utils", () => ({
  calculateLotDebtDetail: vi.fn(() => null),
}));

vi.mock("@/components/shared/LotDetailView", () => ({
  default: () => null,
}));

import LotPage, { generateMetadata } from "./page";

const ownLot = {
  id: "lot-1",
  lotNumber: "001",
  owner: "Jane Doe",
  contributions: [],
};
const otherLot = { id: "lot-2", lotNumber: "002", owner: "John Roe" };

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("LotPage visibility", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns not found when an owner opens another owner's lot", async () => {
    mockGetVisibleLotIds.mockResolvedValue(["lot-1"]);

    await expect(LotPage(params("lot-2"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockGetLotWithContributions).not.toHaveBeenCalled();
  });

  it("renders the owner's own lot with only their lots in the selector", async () => {
    mockGetVisibleLotIds.mockResolvedValue(["lot-1"]);
    mockGetUserRole.mockResolvedValue("owner");
    mockGetLotWithContributions.mockResolvedValue(ownLot);
    mockGetLots.mockResolvedValue([ownLot, otherLot]);

    const element = await LotPage(params("lot-1"));

    expect(mockNotFound).not.toHaveBeenCalled();
    expect(element.props.allLots).toEqual([ownLot]);
  });

  it("lets users with full access open any lot", async () => {
    mockGetVisibleLotIds.mockResolvedValue(null);
    mockGetUserRole.mockResolvedValue("admin");
    mockGetLotWithContributions.mockResolvedValue({
      ...otherLot,
      contributions: [],
    });
    mockGetLots.mockResolvedValue([ownLot, otherLot]);

    const element = await LotPage(params("lot-2"));

    expect(element.props.allLots).toHaveLength(2);
  });

  it("does not leak another owner's name in the page metadata", async () => {
    mockGetVisibleLotIds.mockResolvedValue(["lot-1"]);

    const metadata = await generateMetadata(params("lot-2"));

    expect(JSON.stringify(metadata)).not.toContain("John Roe");
    expect(mockGetLotWithContributions).not.toHaveBeenCalled();
  });
});
