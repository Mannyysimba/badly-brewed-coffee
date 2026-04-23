import { db } from "@/lib/db/client";
import { orders, orderItems, products } from "@/lib/db/schema";
import { and, eq, gte, lte, ne, sql, desc } from "drizzle-orm";
import { Card, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui";
import { RevenueChart, TopProductsChart, TypeSplitChart } from "@/components/charts";
import { formatGBP, parseISODate, toISODate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = parseISODate(sp.from) ?? defaultFrom;
  const to = parseISODate(sp.to) ?? now;
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const paid = and(
    gte(orders.placedAt, from),
    lte(orders.placedAt, to),
    ne(orders.status, "cancelled")
  );

  const kpi = db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
      avg: sql<number>`coalesce(avg(${orders.totalPrice}), 0)`,
    })
    .from(orders)
    .where(paid)
    .get();

  const byDay = db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`,
      total: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(paid)
    .groupBy(sql`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`)
    .orderBy(sql`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`)
    .all()
    .map((r) => ({ ...r, total: Number(r.total), count: Number(r.count) }));

  const top = db
    .select({
      name: products.name,
      type: products.type,
      qty: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(paid)
    .groupBy(orderItems.productId, products.name, products.type)
    .orderBy(desc(sql`sum(${orderItems.quantity} * ${orderItems.unitPrice})`))
    .limit(5)
    .all()
    .map((r) => ({ ...r, qty: Number(r.qty), revenue: Number(r.revenue) }));

  const split = db
    .select({
      type: products.type,
      revenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(paid)
    .groupBy(products.type)
    .all()
    .map((r) => ({ type: r.type === "drink" ? "Drinks" : "Beans", revenue: Number(r.revenue) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Sales analytics</h1>
        <p className="text-sm text-muted mt-1">Revenue & performance across the chosen window.</p>
      </div>

      <Card className="p-5">
        <form className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" defaultValue={toISODate(from)} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" defaultValue={toISODate(to)} />
          </div>
          <Button type="submit">Apply</Button>
          <Link href="/dashboard/analytics">
            <Button type="button" variant="outline">Reset</Button>
          </Link>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold font-display">{formatGBP(Number(kpi?.revenue ?? 0))}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Orders</p>
          <p className="mt-2 text-2xl font-semibold font-display">{Number(kpi?.count ?? 0)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Avg order value</p>
          <p className="mt-2 text-2xl font-semibold font-display">{formatGBP(Number(kpi?.avg ?? 0))}</p>
        </Card>
      </div>

      <Card className="p-5">
        <CardTitle>Revenue by day</CardTitle>
        <CardDescription>Daily gross across the window.</CardDescription>
        <div className="mt-4 h-64"><RevenueChart data={byDay} /></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 p-5">
          <CardTitle>Top 5 products</CardTitle>
          <CardDescription>By revenue in the window.</CardDescription>
          <div className="mt-4 h-64"><TopProductsChart data={top} /></div>
        </Card>
        <Card className="lg:col-span-2 p-5">
          <CardTitle>Drinks vs Beans</CardTitle>
          <CardDescription>Revenue share.</CardDescription>
          <div className="mt-4 h-64"><TypeSplitChart data={split} /></div>
        </Card>
      </div>
    </div>
  );
}
