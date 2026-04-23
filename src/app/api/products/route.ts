import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { products, auditLogs } from "@/lib/db/schema";
import { productInput } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const body = await req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const v = parsed.data;
  const [row] = db
    .insert(products)
    .values({
      type: v.type,
      name: v.name,
      price: v.price,
      cost: v.cost,
      description: v.description ?? null,
      imageUrl: v.imageUrl || null,
      availability: v.availability,
      stockLevel: v.stockLevel,
      origin: v.origin ?? null,
      roastLevel: v.roastLevel ?? null,
      hasMilk: v.hasMilk,
    })
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "product.create",
      entity: "product",
      entityId: String(row.id),
      newValue: JSON.stringify(row),
    })
    .run();

  return NextResponse.json(row, { status: 201 });
}
