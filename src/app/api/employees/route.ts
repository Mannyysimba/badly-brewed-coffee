import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { employeeInput } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const parsed = employeeInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { email, name, role, password } = parsed.data;
  const lower = email.toLowerCase();
  const existing = db.select().from(users).where(eq(users.email, lower)).get();
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const [row] = db
    .insert(users)
    .values({
      email: lower,
      name,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    })
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "employee.create",
      entity: "user",
      entityId: String(row.id),
      newValue: JSON.stringify({ id: row.id, email: row.email, role: row.role }),
    })
    .run();

  return NextResponse.json({ id: row.id, email: row.email, role: row.role }, { status: 201 });
}
