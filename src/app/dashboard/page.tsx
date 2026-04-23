import { getDashboardKpis, getRevenueByDay, getTopProducts } from "@/lib/queries";
import { Card, CardTitle, CardDescription, Badge } from "@/components/ui";
import { formatGBP, toISODate } from "@/lib/utils";
import { RevenueChart, TopProductsChart } from "@/components/charts";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Receipt, AlertTriangle, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const kpis = getDashboardKpis();
  const revenue = getRevenueByDay(14);
  const top = getTopProducts(5);
  const today = toISODate(new Date());

  const kpiCards = [
    {
      label: "Today's revenue",
      value: formatGBP(kpis.todayRevenue),
      sub: `${kpis.todayOrders} order${kpis.todayOrders === 1 ? "" : "s"}`,
      icon: TrendingUp,
      tone: "info" as const,
    },
    {
      label: "Active orders",
      value: String(kpis.activeOrders),
      sub: "pending · in progress · ready",
      icon: ClipboardList,
      tone: kpis.activeOrders > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      label: "Pending refunds",
      value: String(kpis.pendingRefunds),
      sub: kpis.pendingRefunds > 0 ? "Needs review" : "All caught up",
      icon: Receipt,
      tone: kpis.pendingRefunds > 0 ? ("err" as const) : ("ok" as const),
    },
    {
      label: "Low stock",
      value: String(kpis.lowStockProducts),
      sub: "beans < 10kg",
      icon: AlertTriangle,
      tone: kpis.lowStockProducts > 0 ? ("warn" as const) : ("ok" as const),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-muted uppercase tracking-[0.2em]">{today}</p>
        <h1 className="font-display text-3xl mt-1 font-semibold">Good morning, manager.</h1>
        <p className="text-sm text-muted mt-1">
          Here&apos;s how the shop is brewing today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold font-display tracking-tight">{k.value}</p>
                  <p className="text-[11px] text-muted mt-1">{k.sub}</p>
                </div>
                <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-bisque)] text-[var(--color-coffee)] flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <Badge tone={k.tone}>{k.tone === "ok" ? "healthy" : k.tone === "warn" ? "watch" : k.tone === "err" ? "action" : "live"}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <CardTitle>Revenue · last 14 days</CardTitle>
              <CardDescription>Gross, excluding cancellations.</CardDescription>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-[11px] font-medium text-[var(--color-coffee)] inline-flex items-center gap-1"
            >
              Analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 h-56">
            <RevenueChart data={revenue} />
          </div>
        </Card>

        <Card className="p-5">
          <CardTitle>Top sellers</CardTitle>
          <CardDescription>All-time by revenue.</CardDescription>
          <div className="mt-4 h-56">
            <TopProductsChart data={top} />
          </div>
        </Card>
      </div>
    </div>
  );
}
