"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select } from "@/components/ui";
import { Plus, X } from "lucide-react";
import { toISODate } from "@/lib/utils";

export function PromoCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Could not create promo.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New promo
      </Button>
    );
  }

  const today = toISODate(new Date());
  const in30 = toISODate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="card p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">New promo code</h3>
          <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required placeholder="FRIDAY20" />
          </div>
          <div>
            <Label htmlFor="percentOff">% off</Label>
            <Input id="percentOff" name="percentOff" type="number" min="1" max="100" required defaultValue="10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minOrder">Min order (£)</Label>
            <Input id="minOrder" name="minOrder" type="number" step="0.01" min="0" defaultValue="0" />
          </div>
          <div>
            <Label htmlFor="eligibleType">Applies to</Label>
            <Select id="eligibleType" name="eligibleType" defaultValue="all">
              <option value="all">All</option>
              <option value="drink">Drinks</option>
              <option value="bean">Beans</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startsAt">Starts</Label>
            <Input id="startsAt" name="startsAt" type="date" required defaultValue={today} />
          </div>
          <div>
            <Label htmlFor="endsAt">Ends</Label>
            <Input id="endsAt" name="endsAt" type="date" required defaultValue={in30} />
          </div>
        </div>

        {err && <p className="text-xs text-[var(--color-err)]">{err}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
