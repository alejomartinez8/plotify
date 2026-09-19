import { describe, it, expect, afterEach, vi } from "vitest";

// ADMIN_EMAILS is read into a module-level constant at import time, so it
// must be stubbed *before* importing auth.ts. A static top-level import
// would run before this file's own code (imports are hoisted), so this
// case needs its own file with a dynamic import instead.
const mockAuth = vi.fn();
vi.mock("next-auth", () => ({
  default: () => ({
    auth: (...args: unknown[]) => mockAuth(...args),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  }),
}));
vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(() => ({})),
}));

const mockGetUserByEmail = vi.fn();
vi.mock("@/lib/database/users", () => ({
  getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    lot: { count: vi.fn() },
  },
}));

describe("getUserRole (ADMIN_EMAILS precedence)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("grants admin via the ADMIN_EMAILS safety net even with no DB role", async () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com, other@example.com");
    const { getUserRole } = await import("./auth");

    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });

    expect(await getUserRole()).toBe("admin");
  });

  it("does not grant admin to an email outside the list", async () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    const { getUserRole } = await import("./auth");
    const prisma = (await import("@/lib/prisma")).default;

    mockAuth.mockResolvedValue({ user: { email: "someone-else@example.com" } });
    mockGetUserByEmail.mockResolvedValue(null);
    vi.mocked(prisma.lot.count).mockResolvedValue(0);

    expect(await getUserRole()).toBeNull();
  });
});
