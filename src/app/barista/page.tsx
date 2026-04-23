import { db } from "@/lib/db/client";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { eq, and, gte, desc, inArray } from "drizzle-orm";
import { BaristaBoard, type BaristaOrder } from "./barista-board";

export const dynamic = "force-dynamic";

export default async function BaristaPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const sp = await searchParams;
  const windowKind = sp.window === "today" ? "today" : "week";

  const cutoff = new Date();
  if (windowKind === "today") cutoff.setHours(0, 0, 0, 0);
  else cutoff.setDate(cutoff.getDate() - 7);

  const rows = db
    .select({
      id: orders.id,
      referenceId: orders.referenceId,
      status: orders.status,
      placedAt: orders.placedAt,
      totalPrice: orders.totalPrice,
      customer: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(
      and(
        gte(orders.placedAt, cutoff),
        inArray(orders.status, ["pending", "in_progress", "ready", "collected"])
      )
    )
    .orderBy(desc(orders.placedAt))
    .all();

  const items = db
    .select({
      orderId: orderItems.orderId,
      name: products.name,
      qty: orderItems.quantity,
      milkType: orderItems.milkType,
      type: products.type,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .all();

  const itemsByOrder = new Map<number, typeof items>();
  for (const i of items) {
    const k = i.orderId;
    if (!itemsByOrder.has(k)) itemsByOrder.set(k, []);
    itemsByOrder.get(k)!.push(i);
  }

  const enriched: BaristaOrder[] = rows.map((r) => ({
    ...r,
    placedAt: r.placedAt.toISOString(),
    items: (itemsByOrder.get(r.id) ?? []).map((it) => ({
      name: it.name,
      qty: it.qty,
      milkType: it.milkType,
      type: it.type,
    })),
  }));

  return <BaristaBoard orders={enriched} windowKind={windowKind} />;
}
