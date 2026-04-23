import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { refunds, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refundDecision } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const parsed = refundDecision.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const existing = db.select().from(refunds).where(eq(refunds.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Already decided" }, { status: 409 });
  }

  const [row] = db
    .update(refunds)
    .set({
      status: parsed.data.status,
      processedBy: Number(guard.session.user.id),
      processedAt: new Date(),
    })
    .where(eq(refunds.id, Number(id)))
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: `refund.${parsed.data.status}`,
      entity: "refund",
      entityId: String(id),
      oldValue: existing.status,
      newValue: parsed.data.status,
    })
    .run();

  return NextResponse.json(row);
}
