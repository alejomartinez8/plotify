import { auth } from "@/lib/auth/config";
import { logger } from "@/lib/logger";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((email) =>
  email.trim()
) || [];

/**
 * Get the current NextAuth session
 */
export async function getSession() {
  try {
    return await auth();
  } catch (error) {
    logger.error(
      "Error getting session",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return null;
  }
}

/**
 * Check if user is authenticated via NextAuth
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session || !session.user?.email) {
      return false;
    }

    // Verify email is in admin whitelist
    return ADMIN_EMAILS.includes(session.user.email);
  } catch (error) {
    logger.error(
      "Error checking authentication",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return false;
  }
}

/**
 * Require authentication, throw error if not authenticated
 */
export async function requireAuth(): Promise<boolean> {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error("Authentication required");
  }
  return true;
}

/**
 * Get Google Drive tokens from session
 */
export async function getGoogleTokens() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return null;
    }

    return {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    };
  } catch (error) {
    logger.error(
      "Error getting Google tokens",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return null;
  }
}
