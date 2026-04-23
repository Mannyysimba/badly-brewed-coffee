import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const row = db.select().from(users).where(eq(users.email, email)).get();
        if (!row) return null;
        if (row.status === "suspended") return null;

        const ok = await bcrypt.compare(password, row.passwordHash);
        if (!ok) return null;

        return {
          id: String(row.id),
          email: row.email,
          name: row.name,
          role: row.role,
          status: row.status,
        };
      },
    }),
  ],
});

export async function requireRole(roles: Array<"customer" | "barista" | "manager" | "admin">) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, status: 401 };
  if (!roles.includes(session.user.role)) return { ok: false as const, status: 403 };
  return { ok: true as const, session };
}
