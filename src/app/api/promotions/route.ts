import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { promoCodes, auditLogs } from "@/lib/db/schema";
import { promoInput } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const parsed = promoInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const v = parsed.data;
  try {
    const [row] = db
      .insert(promoCodes)
      .values({
        code: v.code,
        percentOff: v.percentOff,
        minOrder: v.minOrder,
        eligibleType: v.eligibleType,
        startsAt: new Date(v.startsAt),
        endsAt: new Date(v.endsAt),
      })
      .returning()
      .all();

    db.insert(auditLogs)
      .values({
        actorId: Number(guard.session.user.id),
        action: "promo.create",
        entity: "promo",
        entityId: String(row.id),
        newValue: JSON.stringify(row),
      })
      .run();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const message = err instanceof Error && /UNIQUE/.test(err.message)
      ? "A promo code with that name already exists."
      : "Could not create promo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
