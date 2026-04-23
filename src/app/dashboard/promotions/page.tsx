import { getActivePromos } from "@/lib/queries";
import { Card, Badge, Table, Th, Td, Tr, EmptyState } from "@/components/ui";
import { formatGBP, formatDate } from "@/lib/utils";
import { Ticket } from "lucide-react";
import { PromoCreate } from "./promo-create";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promos = getActivePromos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Promotions</h1>
          <p className="text-sm text-muted mt-1">
            {promos.length} active code{promos.length === 1 ? "" : "s"}
          </p>
        </div>
        <PromoCreate />
      </div>

      <Card className="p-0 overflow-hidden">
        {promos.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-5 w-5" />}
            title="No active promotions"
            description="Create one to start offering discounts."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Applies to</Th>
                <Th>Min order</Th>
                <Th>Window</Th>
                <Th className="text-right">Uses</Th>
                <Th className="text-right">Discount given</Th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <code className="px-2 py-0.5 rounded bg-[var(--color-bisque)] font-mono text-xs font-semibold">
                      {p.code}
                    </code>
                  </Td>
                  <Td className="font-mono">{p.percentOff}%</Td>
                  <Td><Badge tone={p.eligibleType === "all" ? "neutral" : "info"}>{p.eligibleType}</Badge></Td>
                  <Td className="font-mono text-muted">{formatGBP(p.minOrder)}</Td>
                  <Td className="text-xs text-muted">
                    {formatDate(p.startsAt)} → {formatDate(p.endsAt)}
                  </Td>
                  <Td className="text-right font-mono tabular-nums">{p.usageCount}</Td>
                  <Td className="text-right font-mono tabular-nums">{formatGBP(p.totalDiscountGiven)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
