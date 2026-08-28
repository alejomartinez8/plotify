import type { User as PrismaUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import { User, UserRole } from "@/types/users.types";

function toUser(user: PrismaUser): User {
  return {
    ...user,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Retrieves all DB-managed users (Admins and Treasurers), newest first.
 * Note: this does not include Admins granted solely via the ADMIN_EMAILS
 * env var safety net (docs/SPEC-USER-ROLES-CONSOLIDATION.md, 4.3).
 */
export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map(toUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Looks up a single user by email, used by auth role resolution.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? toUser(user) : null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

/**
 * Looks up a single user by id.
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUser(user) : null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

/**
 * Registers a new user with an explicit role.
 */
export async function createUser(data: {
  email: string;
  name?: string | null;
  role: UserRole;
}): Promise<User | null> {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || null,
        role: data.role,
      },
    });
    return toUser(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Updates an existing user's email, name, and/or role.
 */
export async function updateUser(
  id: string,
  data: {
    email: string;
    name?: string | null;
    role: UserRole;
  }
): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name || null,
        role: data.role,
      },
    });
    return toUser(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

/**
 * Removes a user, revoking whatever role they had.
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
