import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { logger } from "@/lib/logger";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

const ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.file",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Allow any Google user to sign in
      // Role will be determined by ADMIN_EMAILS list or lot ownership
      if (!user.email) {
        logger.warn("Login attempt without email", {
          component: "signIn",
        });
        return false;
      }

      logger.info("User signed in", {
        component: "signIn",
        email: user.email,
      });
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);

/**
 * Check if user is authenticated (session exists with valid email)
 * Email whitelist validation is already done by NextAuth signIn callback
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await auth();
    return !!session?.user?.email;
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

export async function requireAuth(): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }
}

/**
 * Get Google Drive tokens from session
 */
export async function getGoogleTokens() {
  try {
    const session = await auth();

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

/**
 * Get current user's email from session
 */
export async function getUserEmail(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.email || null;
  } catch (error) {
    logger.error(
      "Error getting user email",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return null;
  }
}

/**
 * Get user role based on email
 * Admin: if email is in ADMIN_EMAILS
 * Owner: any other authenticated user
 */
export async function getUserRole(): Promise<"admin" | "owner" | null> {
  try {
    const email = await getUserEmail();
    if (!email) return null;

    if (ADMIN_EMAILS.includes(email)) {
      return "admin";
    }

    return "owner";
  } catch (error) {
    logger.error(
      "Error getting user role",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return null;
  }
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Check if current user owns a specific lot
 */
export async function ownsLot(lotId: string): Promise<boolean> {
  try {
    const email = await getUserEmail();
    if (!email) return false;

    // Import prisma here to avoid circular dependencies
    const { default: prisma } = await import("@/lib/prisma");

    const lot = await prisma.lot.findUnique({
      where: { id: lotId },
      select: { ownerEmail: true },
    });

    return lot?.ownerEmail === email;
  } catch (error) {
    logger.error(
      "Error checking lot ownership",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
        lotId,
      }
    );
    return false;
  }
}

/**
 * Get all lot IDs owned by the current user
 */
export async function getUserLotIds(): Promise<string[]> {
  try {
    const email = await getUserEmail();
    if (!email) return [];

    // Import prisma here to avoid circular dependencies
    const { default: prisma } = await import("@/lib/prisma");

    const lots = await prisma.lot.findMany({
      where: { ownerEmail: email },
      select: { id: true },
    });

    return lots.map((lot) => lot.id);
  } catch (error) {
    logger.error(
      "Error getting user lot IDs",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "auth",
      }
    );
    return [];
  }
}

/**
 * Require admin role, throw error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Admin access required");
  }
}

/**
 * Require lot access, throw error if user doesn't own the lot and is not admin
 */
export async function requireLotAccess(lotId: string): Promise<void> {
  const admin = await isAdmin();
  if (admin) return; // Admins have access to all lots

  const owns = await ownsLot(lotId);
  if (!owns) {
    throw new Error("You don't have permission to access this lot");
  }
}

/**
 * Require access to at least one of the provided lots
 * Throws error if user is not admin and doesn't own any of the lots
 */
export async function requireAnyLotAccess(lotIds: string[]): Promise<void> {
  if (lotIds.length === 0) {
    throw new Error("No lots specified");
  }

  const admin = await isAdmin();
  if (admin) return; // Admins have access to all lots

  const userLotIds = await getUserLotIds();
  const ownsAny = lotIds.some((lotId) => userLotIds.includes(lotId));

  if (!ownsAny) {
    throw new Error(
      "You don't have permission to manage collaborators for these lots"
    );
  }
}

/**
 * Require access to all of the provided lots
 * Throws error if user is not admin and doesn't own all the lots
 */
export async function requireAllLotsAccess(lotIds: string[]): Promise<void> {
  if (lotIds.length === 0) {
    throw new Error("No lots specified");
  }

  const admin = await isAdmin();
  if (admin) return; // Admins have access to all lots

  const userLotIds = await getUserLotIds();
  const ownsAll = lotIds.every((lotId) => userLotIds.includes(lotId));

  if (!ownsAll) {
    throw new Error(
      "You don't have permission to manage collaborators for all these lots"
    );
  }
}
