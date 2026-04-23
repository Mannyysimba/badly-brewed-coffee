import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { refunds, orders, auditLogs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { refundRequest } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  const guard = await requireRole(["customer"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const parsed = refundRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { orderId, orderItemId, reason, note, amount } = parsed.data;
  const uid = Number(guard.session.user.id);

  const order = db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, uid))).get();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const [row] = db
    .insert(refunds)
    .values({
      orderId,
      orderItemId: orderItemId ?? null,
      userId: uid,
      reason,
      note: note ?? null,
      amount,
    })
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: uid,
      action: "refund.request",
      entity: "refund",
      entityId: String(row.id),
      newValue: JSON.stringify(row),
    })
    .run();

  return NextResponse.json(row, { status: 201 });
}
