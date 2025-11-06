import { requireAdmin } from "@/lib/auth";

/**
 * Helper to check admin access and handle errors consistently
 * Returns an error state if access is denied, or null if authorized
 */
export async function checkAdminAccess<T extends { success?: boolean; message?: string | null }>(
  actionTimer: { end: () => void },
  errorMessage: string
): Promise<T | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    actionTimer.end();
    return {
      success: false,
      message: errorMessage,
    } as T;
  }
}
