import Link from "next/link";
import { getCustomerStats, getCustomersWithSpend } from "@/lib/queries";
import { Card, Badge, Table, Th, Td, Tr, EmptyState } from "@/components/ui";
import { formatGBP, formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const stats = getCustomerStats();
  const rows = getCustomersWithSpend();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted mt-1">Loyalty, lifetime spend, and signup trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Total accounts</p>
          <p className="mt-2 text-2xl font-semibold font-display">{stats.total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">New this month</p>
          <p className="mt-2 text-2xl font-semibold font-display">{stats.thisMonth}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted uppercase tracking-wide">Loyalty activated</p>
          <p className="mt-2 text-2xl font-semibold font-display">
            {rows.filter((r) => r.loyaltyNumber).length}
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No customers yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Loyalty</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th className="text-right">Spent</Th>
                <Th className="text-right">Orders</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-mono text-xs">{c.loyaltyNumber ?? "—"}</Td>
                  <Td>
                    <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:text-[var(--color-coffee)]">
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="text-xs text-muted">{c.email}</Td>
                  <Td className="text-right font-mono tabular-nums">{formatGBP(c.spent)}</Td>
                  <Td className="text-right font-mono tabular-nums">{c.orderCount}</Td>
                  <Td className="text-xs text-muted">{formatDate(c.createdAt)}</Td>
                  <Td><Badge tone={c.status === "active" ? "ok" : "err"}>{c.status}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
