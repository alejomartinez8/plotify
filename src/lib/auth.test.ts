import { describe, it, expect, afterEach, vi } from "vitest";

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

vi.mock("@/lib/prisma", () => ({
  default: {
    lot: {
      count: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockGetUserByEmail = vi.fn();
vi.mock("@/lib/database/users", () => ({
  getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
}));

import prisma from "@/lib/prisma";
import {
  getUserEmail,
  getUserRole,
  isAdmin,
  isTreasurer,
  ownsLot,
  getUserLotIds,
  requireAdmin,
  requireTreasurer,
  requireLotAccess,
  requireAnyLotAccess,
  requireAllLotsAccess,
} from "./auth";

const mockedLotCount = vi.mocked(prisma.lot.count);
const mockedLotFindUnique = vi.mocked(prisma.lot.findUnique);
const mockedLotFindMany = vi.mocked(prisma.lot.findMany);

function mockSession(email: string | null) {
  mockAuth.mockResolvedValue(email ? { user: { email } } : null);
}

describe("getUserEmail", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the session email", async () => {
    mockSession("owner@example.com");
    expect(await getUserEmail()).toBe("owner@example.com");
  });

  it("returns null when there is no session", async () => {
    mockSession(null);
    expect(await getUserEmail()).toBeNull();
  });

  it("returns null instead of throwing when the session lookup fails", async () => {
    mockAuth.mockRejectedValue(new Error("session store down"));
    expect(await getUserEmail()).toBeNull();
  });
});

describe("getUserRole", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for an unauthenticated user", async () => {
    mockSession(null);
    expect(await getUserRole()).toBeNull();
  });

  it("returns the DB role when the user has one", async () => {
    mockSession("treasurer@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "treasurer" });
    expect(await getUserRole()).toBe("treasurer");
  });

  it("returns owner when the user has an assigned lot and no DB role", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    expect(await getUserRole()).toBe("owner");
  });

  it("returns null when the user has neither a DB role nor an assigned lot", async () => {
    mockSession("nobody@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(0);
    expect(await getUserRole()).toBeNull();
  });

  it("prefers the DB role over lot ownership", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });
    expect(await getUserRole()).toBe("admin");
    expect(mockedLotCount).not.toHaveBeenCalled();
  });
});

describe("isAdmin / isTreasurer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("isAdmin is true only for the admin role", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });
    expect(await isAdmin()).toBe(true);
  });

  it("isTreasurer is false for an admin", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });
    expect(await isTreasurer()).toBe(false);
  });
});

describe("ownsLot", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the lot's ownerEmail matches the session email", async () => {
    mockSession("owner@example.com");
    mockedLotFindUnique.mockResolvedValue({
      ownerEmail: "owner@example.com",
    } as never);
    expect(await ownsLot("lot-1")).toBe(true);
  });

  it("returns false when the lot belongs to someone else", async () => {
    mockSession("owner@example.com");
    mockedLotFindUnique.mockResolvedValue({
      ownerEmail: "other@example.com",
    } as never);
    expect(await ownsLot("lot-1")).toBe(false);
  });

  it("returns false instead of throwing when the query fails", async () => {
    mockSession("owner@example.com");
    mockedLotFindUnique.mockRejectedValue(new Error("db down"));
    expect(await ownsLot("lot-1")).toBe(false);
  });
});

describe("getUserLotIds", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the ids of lots owned by the session email", async () => {
    mockSession("owner@example.com");
    mockedLotFindMany.mockResolvedValue([
      { id: "lot-1" },
      { id: "lot-2" },
    ] as never);
    expect(await getUserLotIds()).toEqual(["lot-1", "lot-2"]);
  });

  it("returns an empty array for an unauthenticated user", async () => {
    mockSession(null);
    expect(await getUserLotIds()).toEqual([]);
    expect(mockedLotFindMany).not.toHaveBeenCalled();
  });
});

describe("requireAdmin / requireTreasurer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requireAdmin resolves for an admin", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });
    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("requireAdmin throws for a non-admin", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(0);
    await expect(requireAdmin()).rejects.toThrow("Admin access required");
  });

  it("requireTreasurer throws for an admin (no fallback)", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });
    await expect(requireTreasurer()).rejects.toThrow(
      "Treasurer access required"
    );
  });

  it("requireTreasurer resolves for a treasurer", async () => {
    mockSession("treasurer@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "treasurer" });
    await expect(requireTreasurer()).resolves.toBeUndefined();
  });
});

describe("requireLotAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lets an admin through without checking ownership", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });

    await expect(requireLotAccess("lot-1")).resolves.toBeUndefined();
    expect(mockedLotFindUnique).not.toHaveBeenCalled();
  });

  it("lets an owner through for their own lot", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindUnique.mockResolvedValue({
      ownerEmail: "owner@example.com",
    } as never);

    await expect(requireLotAccess("lot-1")).resolves.toBeUndefined();
  });

  it("throws when the user does not own the lot", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindUnique.mockResolvedValue({
      ownerEmail: "other@example.com",
    } as never);

    await expect(requireLotAccess("lot-1")).rejects.toThrow(
      "You don't have permission to access this lot"
    );
  });
});

describe("requireAnyLotAccess / requireAllLotsAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requireAnyLotAccess throws when no lot ids are given", async () => {
    await expect(requireAnyLotAccess([])).rejects.toThrow("No lots specified");
  });

  it("requireAnyLotAccess passes when the user owns at least one of the lots", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindMany.mockResolvedValue([{ id: "lot-2" }] as never);

    await expect(
      requireAnyLotAccess(["lot-1", "lot-2"])
    ).resolves.toBeUndefined();
  });

  it("requireAnyLotAccess throws when the user owns none of the lots", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindMany.mockResolvedValue([{ id: "lot-3" }] as never);

    await expect(requireAnyLotAccess(["lot-1", "lot-2"])).rejects.toThrow(
      /permission to manage collaborators/
    );
  });

  it("requireAllLotsAccess throws unless the user owns every lot", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindMany.mockResolvedValue([{ id: "lot-1" }] as never);

    await expect(requireAllLotsAccess(["lot-1", "lot-2"])).rejects.toThrow(
      /permission to manage collaborators for all/
    );
  });

  it("requireAllLotsAccess passes when the user owns every lot", async () => {
    mockSession("owner@example.com");
    mockGetUserByEmail.mockResolvedValue(null);
    mockedLotCount.mockResolvedValue(1);
    mockedLotFindMany.mockResolvedValue([
      { id: "lot-1" },
      { id: "lot-2" },
    ] as never);

    await expect(
      requireAllLotsAccess(["lot-1", "lot-2"])
    ).resolves.toBeUndefined();
  });

  it("lets an admin through without checking ownership", async () => {
    mockSession("admin@example.com");
    mockGetUserByEmail.mockResolvedValue({ role: "admin" });

    await expect(
      requireAllLotsAccess(["lot-1", "lot-2"])
    ).resolves.toBeUndefined();
    expect(mockedLotFindMany).not.toHaveBeenCalled();
  });
});
