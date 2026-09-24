import { describe, it, expect, afterEach, vi } from "vitest";

const mockGetUserRole = vi.fn();
vi.mock("@/lib/auth", () => ({
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

import { checkLotAccess, checkFullDataAccess } from "./check-lot-access";

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

describe("checkFullDataAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each(["admin", "treasurer"])("does not redirect a %s", async (role) => {
    mockGetUserRole.mockResolvedValue(role);

    await checkFullDataAccess();

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects an owner to the dashboard", async () => {
    mockGetUserRole.mockResolvedValue("owner");

    await checkFullDataAccess();

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects a user without a role to /unauthorized", async () => {
    mockGetUserRole.mockResolvedValue(null);

    await checkFullDataAccess();

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/unauthorized");
  });
});
