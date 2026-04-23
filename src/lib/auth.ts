import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

type DemoRole = "customer" | "barista" | "manager" | "admin";

// Hardcoded demo accounts. Sign-in always succeeds for these regardless of
// the password entered — this is a student demo, not a real auth layer.
const DEMO_USERS: Record<
  string,
  { id: string; name: string; role: DemoRole; status: "active" }
> = {
  "customer@test.com": { id: "1", name: "Casey Customer", role: "customer", status: "active" },
  "barista@test.com":  { id: "2", name: "Benji Barista",  role: "barista",  status: "active" },
  "manager@test.com":  { id: "3", name: "Mona Manager",   role: "manager",  status: "active" },
  "admin@test.com":    { id: "4", name: "Addy Admin",     role: "admin",    status: "active" },
};

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
        if (!email) return null;

        // 1) Demo shortcut — accept any password for the four seeded roles.
        //    Keeps the demo working even when the DB isn't reachable.
        const demo = DEMO_USERS[email];
        if (demo) {
          return { email, ...demo };
        }

        // 2) Fallback: real DB lookup for any other account (employees
        //    created via admin, test customers seeded, etc.). Wrapped in
        //    try/catch so the demo shortcut above keeps working even if
        //    the DB layer explodes.
        try {
          const { db } = await import("@/lib/db/client");
          const { users } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");
          const password = String(creds?.password ?? "");
          if (!password) return null;

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
        } catch (err) {
          console.error("[auth] DB lookup failed:", err);
          return null;
        }
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
