import { db } from "@/lib/db/client";
import { orders, orderItems, products, refunds, users, promoCodes } from "@/lib/db/schema";
import { and, eq, gte, lt, sql, desc, ne, inArray } from "drizzle-orm";
import { startOfDay, endOfDay } from "@/lib/utils";

export type DashboardKpis = {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  pendingRefunds: number;
  lowStockProducts: number;
};

export function getDashboardKpis(): DashboardKpis {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const revenueRow = db
    .select({
      total: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.placedAt, today), lt(orders.placedAt, tomorrow), ne(orders.status, "cancelled")))
    .get();

  const active = db
    .select({ c: sql<number>`count(*)` })
    .from(orders)
    .where(inArray(orders.status, ["pending", "in_progress", "ready"]))
    .get();

  const refund = db
    .select({ c: sql<number>`count(*)` })
    .from(refunds)
    .where(eq(refunds.status, "pending"))
    .get();

  const lowStock = db
    .select({ c: sql<number>`count(*)` })
    .from(products)
    .where(and(eq(products.type, "bean"), sql`${products.stockLevel} < 10`))
    .get();

  return {
    todayRevenue: Number(revenueRow?.total ?? 0),
    todayOrders: Number(revenueRow?.count ?? 0),
    activeOrders: Number(active?.c ?? 0),
    pendingRefunds: Number(refund?.c ?? 0),
    lowStockProducts: Number(lowStock?.c ?? 0),
  };
}

export function getRevenueByDay(days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const rows = db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`,
      total: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.placedAt, from), ne(orders.status, "cancelled")))
    .groupBy(sql`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`)
    .orderBy(sql`strftime('%Y-%m-%d', ${orders.placedAt}, 'unixepoch')`)
    .all();
  return rows.map((r) => ({ day: r.day, total: Number(r.total), count: Number(r.count) }));
}

export function getTopProducts(limit = 5) {
  return db
    .select({
      productId: orderItems.productId,
      name: products.name,
      type: products.type,
      qty: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      revenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(ne(orders.status, "cancelled"))
    .groupBy(orderItems.productId, products.name, products.type)
    .orderBy(desc(sql`sum(${orderItems.quantity} * ${orderItems.unitPrice})`))
    .limit(limit)
    .all()
    .map((r) => ({ ...r, qty: Number(r.qty), revenue: Number(r.revenue) }));
}

export function getTypeSplit() {
  const rows = db
    .select({
      type: products.type,
      revenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(ne(orders.status, "cancelled"))
    .groupBy(products.type)
    .all();
  return rows.map((r) => ({ type: r.type, revenue: Number(r.revenue) }));
}

export function getCustomerStats() {
  const total = db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "customer"))
    .get();

  const monthAgo = new Date();
  monthAgo.setDate(1);
  monthAgo.setHours(0, 0, 0, 0);

  const recent = db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "customer"), gte(users.createdAt, monthAgo)))
    .get();

  return { total: Number(total?.c ?? 0), thisMonth: Number(recent?.c ?? 0) };
}

export function getCustomersWithSpend() {
  const rows = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      loyaltyNumber: users.loyaltyNumber,
      createdAt: users.createdAt,
      status: users.status,
      spent: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
      orderCount: sql<number>`count(${orders.id})`,
    })
    .from(users)
    .leftJoin(orders, and(eq(orders.userId, users.id), ne(orders.status, "cancelled")))
    .where(eq(users.role, "customer"))
    .groupBy(users.id)
    .orderBy(desc(sql`coalesce(sum(${orders.totalPrice}), 0)`))
    .all();
  return rows.map((r) => ({ ...r, spent: Number(r.spent), orderCount: Number(r.orderCount) }));
}

export function getRefundStats() {
  const all = db.select().from(refunds).all();
  const approved = all.filter((r) => r.status === "approved");
  const total = approved.reduce((s, r) => s + r.amount, 0);
  const avg = approved.length > 0 ? total / approved.length : 0;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonthCount = all.filter((r) => new Date(r.createdAt) >= monthStart).length;
  return {
    totalApproved: approved.length,
    totalAmount: total,
    avgAmount: avg,
    thisMonth: thisMonthCount,
  };
}

export function getActivePromos() {
  return db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.active, true))
    .orderBy(desc(promoCodes.startsAt))
    .all();
}
