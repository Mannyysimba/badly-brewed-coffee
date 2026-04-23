import type { NextAuthConfig, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "barista" | "manager" | "admin";
      status: "active" | "suspended";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // Augment the JWT shape with our extra fields.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface JWT {
    uid?: string;
    role?: "customer" | "barista" | "manager" | "admin";
    status?: "active" | "suspended";
  }
}

// Tells TS that the JWT type import is needed for the augmentation above.
export type _JWT = JWT;

// Edge-safe slice of the auth config: no DB imports, no bcrypt.
// Full credentials provider (with DB lookups) lives in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string;
        // @ts-expect-error custom fields set by the authorize() return value
        token.role = user.role;
        // @ts-expect-error custom fields set by the authorize() return value
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) session.user.id = token.uid;
      if (token.role) session.user.role = token.role;
      if (token.status) session.user.status = token.status;
      return session;
    },
  },
} satisfies NextAuthConfig;
