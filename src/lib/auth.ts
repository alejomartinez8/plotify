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

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((email) =>
  email.trim()
) || [];

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
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        console.log(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      console.log(`Authorized login: ${user.email}`);
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
