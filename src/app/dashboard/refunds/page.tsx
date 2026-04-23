import { db } from "@/lib/db/client";
import { refunds, orders, orderItems, products, users } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getRefundStats } from "@/lib/queries";
import { Card, Badge, Table, Th, Td, Tr, EmptyState, Button, Input, Label, Select } from "@/components/ui";
import { formatGBP, formatDate, parseISODate, toISODate } from "@/lib/utils";
import { Receipt } from "lucide-react";
import { RefundActions } from "./refund-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  quality: "Quality",
  customer_request: "Customer request",
  damaged: "Damaged",
};

export default async function RefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const from = parseISODate(sp.from);
  const to = parseISODate(sp.to);
  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);
  const reason = sp.reason && sp.reason !== "all" ? sp.reason : undefined;

  const stats = getRefundStats();

  const conditions = [
    from ? gte(refunds.createdAt, from) : undefined,
    to ? lte(refunds.createdAt, to) : undefined,
    reason ? eq(refunds.reason, reason as "defective") : undefined,
  ].filter(Boolean);

  const rows = db
    .select({
      id: refunds.id,
      orderRef: orders.referenceId,
      productName: products.name,
      qty: orderItems.quantity,
      amount: refunds.amount,
      reason: refunds.reason,
      note: refunds.note,
      status: refunds.status,
      createdAt: refunds.createdAt,
      processedBy: refunds.processedBy,
      processedName: users.name,
      customer: {
        name: users.name,
      },
    })
    .from(refunds)
    .innerJoin(orders, eq(orders.id, refunds.orderId))
    .leftJoin(orderItems, eq(orderItems.id, refunds.orderItemId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(users, eq(users.id, refunds.processedBy))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(refunds.createdAt))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Refunds</h1>
        <p className="text-sm text-muted mt-1">Review, approve, or reject customer refund requests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Approved refunds</p>
          <p className="mt-2 text-2xl font-semibold font-display">{stats.totalApproved}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Total refunded</p>
          <p className="mt-2 text-2xl font-semibold font-display">{formatGBP(stats.totalAmount)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Avg refund</p>
          <p className="mt-2 text-2xl font-semibold font-display">{formatGBP(stats.avgAmount)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">This month</p>
          <p className="mt-2 text-2xl font-semibold font-display">{stats.thisMonth}</p>
        </Card>
      </div>

      <Card className="p-5">
        <form className="grid sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" defaultValue={from ? toISODate(from) : ""} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" defaultValue={to ? toISODate(to) : ""} />
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select id="reason" name="reason" defaultValue={sp.reason ?? "all"}>
              <option value="all">All reasons</option>
              {Object.entries(REASON_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <Button type="submit">Apply</Button>
          <Link href="/dashboard/refunds">
            <Button type="button" variant="outline">Reset</Button>
          </Link>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="No refunds yet"
            description="When a customer requests a refund it will land here for review."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Date</Th>
                <Th>Order</Th>
                <Th>Product</Th>
                <Th>Qty</Th>
                <Th className="text-right">Amount</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th>Processed by</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-mono text-xs">#{r.id}</Td>
                  <Td className="text-xs text-muted">{formatDate(r.createdAt)}</Td>
                  <Td className="font-mono text-xs">{r.orderRef}</Td>
                  <Td className="text-sm">
                    {r.productName ?? "—"}
                    {r.note && <p className="text-[10px] text-muted mt-0.5">{r.note}</p>}
                  </Td>
                  <Td className="text-sm">{r.qty ?? "—"}</Td>
                  <Td className="text-right font-mono tabular-nums">{formatGBP(r.amount)}</Td>
                  <Td>
                    <Badge tone="neutral">{REASON_LABELS[r.reason] ?? r.reason}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={r.status === "approved" ? "ok" : r.status === "rejected" ? "err" : "warn"}>
                      {r.status}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-muted">{r.processedName ?? "—"}</Td>
                  <Td>
                    {r.status === "pending" && <RefundActions id={r.id} />}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
