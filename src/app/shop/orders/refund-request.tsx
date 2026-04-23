"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Textarea, Label } from "@/components/ui";
import { X } from "lucide-react";

const REASONS = [
  { value: "defective", label: "Defective" },
  { value: "wrong_item", label: "Wrong item" },
  { value: "quality", label: "Quality issue" },
  { value: "customer_request", label: "Customer request" },
  { value: "damaged", label: "Damaged" },
];

export function RefundRequest({
  orderId,
  orderItemId,
  amount,
  productName,
}: {
  orderId: number;
  orderItemId: number;
  amount: number;
  productName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("quality");
  const [note, setNote] = useState("");

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, orderItemId, reason, note, amount }),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Refund
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Request refund</h3>
            <p className="text-xs text-muted mt-0.5">{productName} · £{amount.toFixed(2)}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What went wrong?"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Sending..." : "Submit request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
