import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Extend the built-in session types
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
    accessTokenExpires?: number;
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
      // Only allow emails in the ADMIN_EMAILS whitelist
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        console.log(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      console.log(`Authorized login: ${user.email}`);
      return true;
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : undefined,
        };
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token has expired, try to refresh it
      // Note: This is a simplified version. In production, you'd want to implement
      // proper token refresh logic using the refresh token
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
