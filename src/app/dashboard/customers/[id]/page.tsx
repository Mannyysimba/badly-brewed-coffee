import { db } from "@/lib/db/client";
import { users, orders, orderItems, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Badge, Table, Th, Td, Tr, Button } from "@/components/ui";
import { formatGBP, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerActions } from "./customer-actions";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = Number(id);
  const user = db.select().from(users).where(eq(users.id, uid)).get();
  if (!user || user.role !== "customer") notFound();

  const userOrders = db.select().from(orders).where(eq(orders.userId, uid)).orderBy(desc(orders.placedAt)).all();

  const itemsByOrder = new Map<number, Array<{ name: string; qty: number; unitPrice: number }>>();
  for (const o of userOrders) {
    const its = db
      .select({ name: products.name, qty: orderItems.quantity, unitPrice: orderItems.unitPrice })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, o.id))
      .all();
    itemsByOrder.set(o.id, its);
  }

  const spent = userOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalPrice, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/dashboard/customers" className="text-xs text-muted inline-flex items-center gap-1 hover:text-fg">
        <ArrowLeft className="h-3 w-3" /> Back to customers
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">{user.loyaltyNumber ?? "no loyalty number"}</p>
          <h1 className="font-display text-2xl font-semibold mt-0.5">{user.name}</h1>
          <p className="text-sm text-muted">{user.email}</p>
          <div className="flex gap-3 mt-3">
            <Badge tone={user.status === "active" ? "ok" : "err"}>{user.status}</Badge>
            <span className="text-xs text-muted">Member since {formatDate(user.createdAt)}</span>
          </div>
        </div>
        <CustomerActions id={user.id} status={user.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Lifetime spend</p>
          <p className="mt-2 text-2xl font-semibold font-display">{formatGBP(spent)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Total orders</p>
          <p className="mt-2 text-2xl font-semibold font-display">{userOrders.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Avg order</p>
          <p className="mt-2 text-2xl font-semibold font-display">
            {formatGBP(userOrders.length ? spent / userOrders.length : 0)}
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-app">
          <h3 className="text-sm font-semibold">Order history</h3>
        </div>
        {userOrders.length === 0 ? (
          <p className="text-sm text-muted p-6">No orders yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Ref</Th>
                <Th>Placed</Th>
                <Th>Items</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-mono text-xs">{o.referenceId}</Td>
                  <Td className="text-xs text-muted">{formatDateTime(o.placedAt)}</Td>
                  <Td className="text-xs">
                    {(itemsByOrder.get(o.id) ?? [])
                      .map((it) => `${it.qty}× ${it.name}`)
                      .join(", ") || "—"}
                  </Td>
                  <Td>
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
                  </Td>
                  <Td className="text-right font-mono tabular-nums">{formatGBP(o.totalPrice)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
