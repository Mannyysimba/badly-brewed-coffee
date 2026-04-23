import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { products, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { productInput } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const existing = db.select().from(products).where(eq(products.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const v = parsed.data;
  const [row] = db
    .update(products)
    .set({
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
    .where(eq(products.id, Number(id)))
    .returning()
    .all();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "product.update",
      entity: "product",
      entityId: String(id),
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(row),
    })
    .run();

  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(["manager", "admin"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const { id } = await params;
  const existing = db.select().from(products).where(eq(products.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft-delete via availability so past orders keep resolving product names.
  db.update(products).set({ availability: false }).where(eq(products.id, Number(id))).run();

  db.insert(auditLogs)
    .values({
      actorId: Number(guard.session.user.id),
      action: "product.hide",
      entity: "product",
      entityId: String(id),
    })
    .run();

  return NextResponse.json({ ok: true });
}
