"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { formatDateTime, formatGBP } from "@/lib/utils";
import Link from "next/link";

export type BaristaOrder = {
  id: number;
  referenceId: string;
  status: string;
  placedAt: string;
  totalPrice: number;
  customer: string;
  items: { name: string; qty: number; milkType: string | null; type: string }[];
};

const COLUMNS = [
  { status: "pending", title: "Pending", tone: "warn" as const },
  { status: "in_progress", title: "In progress", tone: "info" as const },
  { status: "ready", title: "Ready for collection", tone: "ok" as const },
  { status: "collected", title: "Collected", tone: "neutral" as const },
];

const NEXT: Record<string, string | null> = {
  pending: "in_progress",
  in_progress: "ready",
  ready: "collected",
  collected: null,
};
const LABEL: Record<string, string> = {
  pending: "Start brewing",
  in_progress: "Mark ready",
  ready: "Mark collected",
};

export function BaristaBoard({ orders, windowKind }: { orders: BaristaOrder[]; windowKind: "today" | "week" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function advance(id: number, current: string) {
    const next = NEXT[current];
    if (!next) return;
    start(async () => {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  const grouped: Record<string, BaristaOrder[]> = {
    pending: [],
    in_progress: [],
    ready: [],
    collected: [],
  };
  for (const o of orders) grouped[o.status]?.push(o);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Behind the counter</h1>
          <p className="text-sm text-muted mt-1">Push orders through the pipeline.</p>
        </div>
        <div className="flex rounded-[var(--radius-md)] border border-[var(--border)] bg-elev overflow-hidden">
          <Link
            href="/barista?window=today"
            className={`px-4 h-9 text-xs font-semibold inline-flex items-center ${windowKind === "today" ? "bg-[var(--color-coffee)] text-white" : "text-fg/70"}`}
          >
            Today
          </Link>
          <Link
            href="/barista?window=week"
            className={`px-4 h-9 text-xs font-semibold inline-flex items-center ${windowKind === "week" ? "bg-[var(--color-coffee)] text-white" : "text-fg/70"}`}
          >
            Last 7 days
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
              <Badge tone={col.tone}>{grouped[col.status]?.length ?? 0}</Badge>
            </div>
            <div className="space-y-2.5">
              {(grouped[col.status] ?? []).map((o) => (
                <Card key={o.id} className="p-4 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-xs text-muted">{o.referenceId}</p>
                    <p className="font-mono text-xs">{formatGBP(o.totalPrice)}</p>
                  </div>
                  <p className="text-xs text-muted">{o.customer} · {formatDateTime(o.placedAt)}</p>
                  <ul className="text-xs space-y-0.5">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        <span className="font-semibold">{it.qty}×</span> {it.name}
                        {it.type === "drink" && it.milkType && it.milkType !== "none" && (
                          <span className="text-muted"> · {it.milkType}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {NEXT[o.status] && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      onClick={() => advance(o.id, o.status)}
                      disabled={pending}
                    >
                      {LABEL[o.status]} →
                    </Button>
                  )}
                </Card>
              ))}
              {(grouped[col.status] ?? []).length === 0 && (
                <p className="text-xs text-muted text-center py-6">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
