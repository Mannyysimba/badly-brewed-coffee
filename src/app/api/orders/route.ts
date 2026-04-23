import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, orderItems, products, promoCodes } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { checkoutInput } from "@/lib/validators";
import { requireRole } from "@/lib/auth";

function ref() {
  return "BBC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  const guard = await requireRole(["customer"]);
  if (!guard.ok) return NextResponse.json({ error: "Forbidden" }, { status: guard.status });

  const body = await req.json().catch(() => null);
  const parsed = checkoutInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { items, promoCode } = parsed.data;
  const productIds = items.map((i) => i.productId);
  const prods = db.select().from(products).where(inArray(products.id, productIds)).all();
  if (prods.length !== productIds.length) {
    return NextResponse.json({ error: "Some items no longer exist" }, { status: 400 });
  }

  const byId = new Map(prods.map((p) => [p.id, p]));
  let subtotal = 0;
  let cost = 0;
  const itemRows: Array<{ productId: number; quantity: number; unitPrice: number; milkType: "whole" | "oat" | "almond" | "skim" | "none" }> = [];
  for (const it of items) {
    const p = byId.get(it.productId)!;
    if (!p.availability) {
      return NextResponse.json({ error: `${p.name} is no longer available` }, { status: 400 });
    }
    subtotal += p.price * it.quantity;
    cost += p.cost * it.quantity;
    itemRows.push({
      productId: p.id,
      quantity: it.quantity,
      unitPrice: p.price,
      milkType: (p.type === "drink" && p.hasMilk ? (it.milkType ?? "whole") : "none") as "whole" | "oat" | "almond" | "skim" | "none",
    });
  }

  let discount = 0;
  let promoApplied: string | null = null;
  if (promoCode) {
    const now = new Date();
    const promo = db
      .select()
      .from(promoCodes)
      .where(and(eq(promoCodes.code, promoCode.toUpperCase()), eq(promoCodes.active, true), lte(promoCodes.startsAt, now), gte(promoCodes.endsAt, now)))
      .get();
    if (promo && subtotal >= promo.minOrder) {
      const eligibleSubtotal =
        promo.eligibleType === "all"
          ? subtotal
          : itemRows.reduce((s, it) => {
              const p = byId.get(it.productId)!;
              return p.type === promo.eligibleType ? s + p.price * it.quantity : s;
            }, 0);
      discount = (eligibleSubtotal * promo.percentOff) / 100;
      promoApplied = promo.code;

      db.update(promoCodes)
        .set({
          usageCount: promo.usageCount + 1,
          totalDiscountGiven: promo.totalDiscountGiven + discount,
        })
        .where(eq(promoCodes.id, promo.id))
        .run();
    }
  }

  const totalPrice = Math.max(0, subtotal - discount);

  const [order] = db
    .insert(orders)
    .values({
      referenceId: ref(),
      userId: Number(guard.session.user.id),
      totalPrice,
      totalCost: cost,
      promoCode: promoApplied,
      discountAmount: discount,
    })
    .returning()
    .all();

  db.insert(orderItems)
    .values(itemRows.map((it) => ({ ...it, orderId: order.id })))
    .run();

  return NextResponse.json(order, { status: 201 });
}
