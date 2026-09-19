import { describe, it, expect, afterEach, vi } from "vitest";

const mockCheckAdminAccess = vi.fn();
vi.mock("./helpers", () => ({
  checkAdminAccess: (...args: unknown[]) => mockCheckAdminAccess(...args),
}));

const mockCreateUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockGetUserById = vi.fn();
vi.mock("@/lib/database/users", () => ({
  createUser: (...args: unknown[]) => mockCreateUser(...args),
  updateUser: (...args: unknown[]) => mockUpdateUser(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

const mockGetUserEmail = vi.fn();
vi.mock("@/lib/auth", () => ({
  getUserEmail: () => mockGetUserEmail(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "./user-actions";
import { translations } from "@/lib/translations";

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("email", overrides.email ?? "new-admin@example.com");
  formData.set("name", overrides.name ?? "");
  formData.set("role", overrides.role ?? "admin");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("createUserAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the user is created", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue({ id: "user-1" });

    const result = await createUserAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(true);
  });

  it("does not create when admin access is denied", async () => {
    mockCheckAdminAccess.mockResolvedValue({
      success: false,
      message: "Admin access required to manage users",
    });

    const result = await createUserAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("rejects an invalid email before hitting the database", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);

    const result = await createUserAction(
      { message: null, errors: {} },
      makeFormData({ email: "not-an-email" })
    );

    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeDefined();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("reports userAlreadyExists when creation returns null", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue(null);

    const result = await createUserAction(
      { message: null, errors: {} },
      makeFormData()
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.userAlreadyExists);
  });
});

describe("updateUserAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when the user is updated", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("acting-admin@example.com");
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "someone-else@example.com",
      role: "treasurer",
    });
    mockUpdateUser.mockResolvedValue({ id: "user-1" });

    const result = await updateUserAction(
      { message: null, errors: {} },
      makeFormData({ id: "user-1", role: "admin" })
    );

    expect(result.success).toBe(true);
  });

  it("blocks an admin from changing their own role", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("admin@example.com");
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      role: "admin",
    });

    const result = await updateUserAction(
      { message: null, errors: {} },
      makeFormData({
        id: "user-1",
        email: "admin@example.com",
        role: "treasurer",
      })
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotChangeOwnRole);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("allows an admin to edit their own record without changing their role", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("admin@example.com");
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      role: "admin",
    });
    mockUpdateUser.mockResolvedValue({ id: "user-1" });

    const result = await updateUserAction(
      { message: null, errors: {} },
      makeFormData({
        id: "user-1",
        email: "admin@example.com",
        role: "admin",
        name: "Updated Name",
      })
    );

    expect(result.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalled();
  });
});

describe("deleteUserAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes another user's record", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("admin@example.com");
    mockGetUserById.mockResolvedValue({
      id: "user-2",
      email: "someone-else@example.com",
    });
    mockDeleteUser.mockResolvedValue(true);

    const result = await deleteUserAction("user-2");

    expect(result.success).toBe(true);
  });

  it("refuses to let an admin delete their own record", async () => {
    mockCheckAdminAccess.mockResolvedValue(null);
    mockGetUserEmail.mockResolvedValue("admin@example.com");
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
    });

    const result = await deleteUserAction("user-1");

    expect(result.success).toBe(false);
    expect(result.message).toBe(translations.errors.cannotRemoveSelf);
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});
