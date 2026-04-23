import { db } from "@/lib/db/client";
import { orders, orderItems, products, refunds } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { formatGBP, formatDateTime } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";
import { RefundRequest } from "./refund-request";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const uid = Number(session.user.id);

  const userOrders = db.select().from(orders).where(eq(orders.userId, uid)).orderBy(desc(orders.placedAt)).all();

  const itemsByOrder = new Map<
    number,
    Array<{ id: number; name: string; qty: number; unitPrice: number; milkType: string | null; productId: number }>
  >();
  for (const o of userOrders) {
    const its = db
      .select({
        id: orderItems.id,
        name: products.name,
        qty: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        milkType: orderItems.milkType,
        productId: products.id,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, o.id))
      .all();
    itemsByOrder.set(o.id, its);
  }

  const myRefunds = db.select().from(refunds).where(eq(refunds.userId, uid)).all();
  const refundedItemIds = new Set(myRefunds.map((r) => r.orderItemId).filter(Boolean) as number[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">My orders</h1>
        <p className="text-sm text-muted mt-1">Track current cups and review history.</p>
      </div>

      {userOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="No orders yet"
          description="Step up to the counter and order a latte."
          action={<Link href="/shop"><Button>Browse menu</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {userOrders.map((o) => {
            const its = itemsByOrder.get(o.id) ?? [];
            return (
              <Card key={o.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-muted font-mono">{o.referenceId}</p>
                    <p className="text-xs text-muted mt-0.5">{formatDateTime(o.placedAt)}</p>
                  </div>
                  <Badge
                    tone={
                      o.status === "collected"
                        ? "ok"
                        : o.status === "cancelled"
                        ? "err"
                        : o.status === "ready"
                        ? "info"
                        : "warn"
                    }
                  >
                    {o.status.replace("_", " ")}
                  </Badge>
                </div>

                <ul className="mt-4 space-y-1.5 text-sm">
                  {its.map((it) => (
                    <li key={it.id} className="flex items-baseline justify-between gap-3">
                      <span>
                        {it.qty}× {it.name}
                        {it.milkType && it.milkType !== "none" && (
                          <span className="text-muted text-xs"> · {it.milkType} milk</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{formatGBP(it.unitPrice * it.qty)}</span>
                        {o.status === "collected" && !refundedItemIds.has(it.id) && (
                          <RefundRequest
                            orderId={o.id}
                            orderItemId={it.id}
                            amount={it.unitPrice * it.qty}
                            productName={it.name}
                          />
                        )}
                        {refundedItemIds.has(it.id) && (
                          <Badge tone="warn">Refund requested</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-app flex justify-between text-sm">
                  <span className="text-muted">
                    {o.promoCode && <>Promo {o.promoCode} · </>}
                    {o.discountAmount > 0 && <>−{formatGBP(o.discountAmount)} off</>}
                  </span>
                  <span className="font-mono font-semibold">{formatGBP(o.totalPrice)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
