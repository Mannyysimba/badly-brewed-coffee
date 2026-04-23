import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { employeeUpdate } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const parsed = employeeUpdate.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const existing = db.select().from(users).where(eq(users.id, Number(id))).get();
  if (!existing || existing.role === "customer") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: Partial<typeof users.$inferInsert> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.role !== undefined) patch.role = parsed.data.role;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.password !== undefined) patch.passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const [row] = db.update(users).set(patch).where(eq(users.id, Number(id))).returning().all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "employee.update",
      entity: "user",
      entityId: String(id),
      oldValue: JSON.stringify({ role: existing.role, status: existing.status }),
      newValue: JSON.stringify({ role: row.role, status: row.status }),
    })
    .run();

  return NextResponse.json({ id: row.id, role: row.role, status: row.status });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  if (Number(id) === Number(guard.session.user.id)) {
    return NextResponse.json({ error: "Can't remove yourself" }, { status: 400 });
  }

  const existing = db.select().from(users).where(eq(users.id, Number(id))).get();
  if (!existing || existing.role === "customer") return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If the employee has foreign-key dependencies (orders as barista, audit logs)
  // a hard delete could fail — suspend instead for safety.
  db.update(users).set({ status: "suspended" }).where(eq(users.id, Number(id))).run();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "employee.remove",
      entity: "user",
      entityId: String(id),
    })
    .run();

  // Keep the row silent — rename to block the email from being used again.
  const stamp = Date.now();
  db.update(users)
    .set({ email: `removed-${stamp}-${existing.email}` })
    .where(eq(users.id, Number(id)))
    .run();

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
