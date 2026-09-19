import { describe, it, expect, afterEach, vi } from "vitest";

const mockRequireAdmin = vi.fn();
const mockRequireTreasurer = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  requireTreasurer: (...args: unknown[]) => mockRequireTreasurer(...args),
}));

import { checkAdminAccess, checkTreasurerAccess } from "./helpers";

function makeTimer() {
  return { end: vi.fn() };
}

describe("checkAdminAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when requireAdmin resolves", async () => {
    mockRequireAdmin.mockResolvedValue(undefined);
    const timer = makeTimer();

    const result = await checkAdminAccess(timer, "Admin required");

    expect(result).toBeNull();
    expect(timer.end).not.toHaveBeenCalled();
  });

  it("returns an error state and ends the timer when requireAdmin throws", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Admin access required"));
    const timer = makeTimer();

    const result = await checkAdminAccess(timer, "Admin required");

    expect(result).toEqual({ success: false, message: "Admin required" });
    expect(timer.end).toHaveBeenCalledTimes(1);
  });
});

describe("checkTreasurerAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when requireTreasurer resolves", async () => {
    mockRequireTreasurer.mockResolvedValue(undefined);
    const timer = makeTimer();

    const result = await checkTreasurerAccess(timer, "Treasurer required");

    expect(result).toBeNull();
  });

  it("returns an error state and ends the timer when requireTreasurer throws", async () => {
    mockRequireTreasurer.mockRejectedValue(
      new Error("Treasurer access required")
    );
    const timer = makeTimer();

    const result = await checkTreasurerAccess(timer, "Treasurer required");

    expect(result).toEqual({ success: false, message: "Treasurer required" });
    expect(timer.end).toHaveBeenCalledTimes(1);
  });
});
