import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

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
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        console.log(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      console.log(`Authorized login: ${user.email}`);
      return true;
    },
    async jwt({ token, account, user }) {
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

      if (
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
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
