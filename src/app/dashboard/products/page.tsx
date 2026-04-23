import Link from "next/link";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button, Card, Badge, Table, Th, Td, Tr, EmptyState } from "@/components/ui";
import { formatGBP } from "@/lib/utils";
import { Coffee, Package, Plus } from "lucide-react";
import { ProductsFilter } from "./products-filter";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase();
  const type = sp.type ?? "all";

  const rows = db.select().from(products).orderBy(desc(products.createdAt)).all();
  const filtered = rows.filter((r) => {
    if (type !== "all" && r.type !== type) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.origin?.toLowerCase().includes(q) ||
      r.roastLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted mt-1">
            {filtered.length} of {rows.length} items
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/products/new?type=drink">
            <Button variant="secondary">
              <Coffee className="h-4 w-4" /> Add drink
            </Button>
          </Link>
          <Link href="/dashboard/products/new?type=bean">
            <Button>
              <Plus className="h-4 w-4" /> Add bean
            </Button>
          </Link>
        </div>
      </div>

      <ProductsFilter defaultQ={q} defaultType={type} />

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title="No products match that"
            description="Try clearing the filter or adding a new item."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-right">Cost</Th>
                <Th className="text-right">Margin</Th>
                <Th className="text-right">Stock</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const margin = p.cost > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                return (
                  <Tr key={p.id}>
                    <Td className="text-muted font-mono text-xs">#{p.id}</Td>
                    <Td>
                      <Link href={`/dashboard/products/${p.id}`} className="font-medium hover:text-[var(--color-coffee)]">
                        {p.name}
                      </Link>
                      {p.type === "bean" && (
                        <p className="text-[10px] text-muted">
                          {p.origin} · {p.roastLevel}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={p.type === "drink" ? "info" : "neutral"}>{p.type}</Badge>
                    </Td>
                    <Td className="text-right font-mono tabular-nums">{formatGBP(p.price)}</Td>
                    <Td className="text-right font-mono tabular-nums text-muted">{formatGBP(p.cost)}</Td>
                    <Td className="text-right font-mono tabular-nums text-xs">{margin.toFixed(0)}%</Td>
                    <Td className="text-right font-mono tabular-nums">
                      {p.type === "bean" ? (
                        <span className={p.stockLevel < 10 ? "text-[var(--color-err)] font-semibold" : ""}>
                          {p.stockLevel}kg
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <Badge tone={p.availability ? "ok" : "err"}>{p.availability ? "Live" : "Hidden"}</Badge>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
