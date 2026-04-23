import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

const body = z.object({
  status: z.enum(["pending", "in_progress", "ready", "collected", "cancelled"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["barista", "manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const existing = db.select().from(orders).where(eq(orders.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next = parsed.data.status;
  const [row] = db
    .update(orders)
    .set({
      status: next,
      baristaId: next !== "pending" ? Number(guard.session.user.id) : existing.baristaId,
      completedAt: next === "collected" ? new Date() : existing.completedAt,
    })
    .where(eq(orders.id, Number(id)))
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "order.status",
      entity: "order",
      entityId: String(id),
      oldValue: existing.status,
      newValue: next,
    })
    .run();

  return NextResponse.json(row);
}
