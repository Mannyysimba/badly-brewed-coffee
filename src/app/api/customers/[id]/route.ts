import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

const body = z.object({ status: z.enum(["active", "suspended"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const existing = db.select().from(users).where(eq(users.id, Number(id))).get();
  if (!existing || existing.role !== "customer") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [row] = db
    .update(users)
    .set({ status: parsed.data.status })
    .where(eq(users.id, Number(id)))
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: `customer.${parsed.data.status === "suspended" ? "suspend" : "activate"}`,
      entity: "user",
      entityId: String(id),
      oldValue: existing.status,
      newValue: row.status,
    })
    .run();

  return NextResponse.json({ id: row.id, status: row.status });
}
