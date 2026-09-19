import { describe, it, expect, afterEach, vi } from "vitest";

const mockGetUserRole = vi.fn();
vi.mock("@/lib/auth", () => ({
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { checkLotAccess } from "./check-lot-access";

describe("checkLotAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not redirect when the user has a role", async () => {
    mockGetUserRole.mockResolvedValue("owner");

    await checkLotAccess();

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to /unauthorized when the user has no role", async () => {
    mockGetUserRole.mockResolvedValue(null);

    await checkLotAccess();

    expect(mockRedirect).toHaveBeenCalledWith("/unauthorized");
  });
});
