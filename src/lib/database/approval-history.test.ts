import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    approvalHistory: { findMany: vi.fn() },
  },
}));

import prisma from "@/lib/prisma";
import { getApprovalHistory } from "./approval-history";

const mockedFindMany = vi.mocked(prisma.approvalHistory.findMany);

describe("getApprovalHistory", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("converts createdAt to an ISO string and casts the enum fields", async () => {
    mockedFindMany.mockResolvedValue([
      {
        id: "hist-1",
        recordType: "contribution",
        recordId: 1,
        action: "approved",
        treasurerEmail: "t@example.com",
        note: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ] as never);

    const result = await getApprovalHistory("contribution", 1);

    expect(result[0]).toMatchObject({
      recordType: "contribution",
      action: "approved",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("filters by recordType and recordId", async () => {
    mockedFindMany.mockResolvedValue([]);

    await getApprovalHistory("expense", 42);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { recordType: "expense", recordId: 42 },
      })
    );
  });

  it("returns an empty array instead of throwing when the query fails", async () => {
    mockedFindMany.mockRejectedValue(new Error("db down"));

    expect(await getApprovalHistory("contribution", 1)).toEqual([]);
  });
});
