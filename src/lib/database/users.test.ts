import { describe, it, expect, afterEach, vi } from "vitest";
import type { User as PrismaUser } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import {
  getUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "./users";

function makePrismaUser(overrides: Partial<PrismaUser> = {}): PrismaUser {
  return {
    id: "user-1",
    email: "admin@example.com",
    name: null,
    role: "admin",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  } as PrismaUser;
}

const mockedFindMany = vi.mocked(prisma.user.findMany);
const mockedFindUnique = vi.mocked(prisma.user.findUnique);
const mockedCreate = vi.mocked(prisma.user.create);
const mockedUpdate = vi.mocked(prisma.user.update);
const mockedDelete = vi.mocked(prisma.user.delete);

describe("getUsers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("converts createdAt to an ISO string", async () => {
    mockedFindMany.mockResolvedValue([makePrismaUser()]);

    const result = await getUsers();

    expect(result[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns an empty array instead of throwing when the query fails", async () => {
    mockedFindMany.mockRejectedValue(new Error("db down"));

    expect(await getUsers()).toEqual([]);
  });
});

describe("getUserByEmail / getUserById", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no user matches", async () => {
    mockedFindUnique.mockResolvedValue(null);

    expect(await getUserByEmail("nobody@example.com")).toBeNull();
  });

  it("returns null instead of throwing when the query fails", async () => {
    mockedFindUnique.mockRejectedValue(new Error("db down"));

    expect(await getUserByEmail("admin@example.com")).toBeNull();
  });
});

describe("createUser / updateUser / deleteUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user with the given role", async () => {
    mockedCreate.mockResolvedValue(makePrismaUser({ role: "treasurer" }));

    const result = await createUser({
      email: "t@example.com",
      role: "treasurer",
    });

    expect(result?.role).toBe("treasurer");
  });

  it("returns null instead of throwing on a duplicate email", async () => {
    mockedCreate.mockRejectedValue(new Error("Unique constraint failed"));

    expect(
      await createUser({ email: "admin@example.com", role: "admin" })
    ).toBeNull();
  });

  it("updates a user's role", async () => {
    mockedUpdate.mockResolvedValue(makePrismaUser({ role: "treasurer" }));

    const result = await updateUser("user-1", {
      email: "admin@example.com",
      role: "treasurer",
    });

    expect(result?.role).toBe("treasurer");
  });

  it("returns true/false for delete success/failure", async () => {
    mockedDelete.mockResolvedValueOnce(makePrismaUser());
    expect(await deleteUser("user-1")).toBe(true);

    mockedDelete.mockRejectedValueOnce(new Error("db down"));
    expect(await deleteUser("user-1")).toBe(false);
  });
});
