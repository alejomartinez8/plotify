"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createUser, deleteUser, getUserById } from "@/lib/database/users";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";
import { getUserEmail } from "@/lib/auth";
import { checkAdminAccess } from "./helpers";

const UserSchema = z.object({
  email: z.string().email(translations.errors.userEmailInvalid),
  name: z.string().optional(),
  role: z.enum(["admin", "treasurer"], {
    message: translations.errors.userRoleRequired,
  }),
});

export type UserState = {
  errors?: {
    email?: string[];
    name?: string[];
    role?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createUserAction(
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const actionTimer = logger.timer("Create User Action");

  const adminError = await checkAdminAccess<UserState>(
    actionTimer,
    "Admin access required to manage users"
  );
  if (adminError) return adminError;

  const validatedFields = UserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    actionTimer.end();
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: translations.errors.missingFields,
      success: false,
    };
  }

  const { email, name, role } = validatedFields.data;

  try {
    const result = await createUser({ email, name: name || null, role });

    if (!result) {
      actionTimer.end();
      return {
        success: false,
        message: translations.errors.userAlreadyExists,
      };
    }
  } catch (error) {
    logger.error(
      "Database error during user creation",
      error instanceof Error ? error : new Error(String(error)),
      { component: "createUserAction" }
    );
    actionTimer.end();
    return {
      success: false,
      message: translations.errors.userAlreadyExists,
    };
  }

  revalidatePath("/admin");
  actionTimer.end();
  return { success: true, message: `${translations.messages.created}.` };
}

export async function deleteUserAction(id: string): Promise<UserState> {
  const actionTimer = logger.timer("Delete User Action");

  const adminError = await checkAdminAccess<UserState>(
    actionTimer,
    "Admin access required to manage users"
  );
  if (adminError) return adminError;

  // Guard against self-lockout-by-accident: an admin can't remove their
  // own row here (another admin has to). The ADMIN_EMAILS env var stays
  // a full recovery path regardless — see
  // docs/SPEC-USER-ROLES-CONSOLIDATION.md, 4.3 and 5.4.
  const [currentEmail, target] = await Promise.all([
    getUserEmail(),
    getUserById(id),
  ]);
  if (target && currentEmail && target.email === currentEmail) {
    actionTimer.end();
    return {
      success: false,
      message: translations.errors.cannotRemoveSelf,
    };
  }

  try {
    const result = await deleteUser(id);

    if (!result) {
      actionTimer.end();
      return {
        success: false,
        message: `${translations.errors.database}: Failed to delete user.`,
      };
    }

    revalidatePath("/admin");
    actionTimer.end();
    return { success: true, message: `${translations.messages.deleted}.` };
  } catch (error) {
    logger.error(
      "Database error during user deletion",
      error instanceof Error ? error : new Error(String(error)),
      { component: "deleteUserAction" }
    );
    actionTimer.end();
    return {
      success: false,
      message: `${translations.errors.database}: Failed to delete user.`,
    };
  }
}
