"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import type { Product } from "@/lib/db/schema";

export function ProductForm({
  mode,
  product,
  defaultType,
}: {
  mode: "create" | "edit";
  product?: Product;
  defaultType?: "drink" | "bean";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [type, setType] = useState<"drink" | "bean">(product?.type ?? defaultType ?? "drink");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries()) as Record<string, string>;
    body.type = type;
    body.availability = fd.get("availability") === "on" ? "true" : "false";
    body.hasMilk = fd.get("hasMilk") === "on" ? "true" : "false";

    start(async () => {
      const url = mode === "create" ? "/api/products" : `/api/products/${product!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard/products");
      router.refresh();
    });
  }

  async function remove() {
    if (!product) return;
    if (!confirm("Delete this product? It won't touch past orders.")) return;
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/products");
      router.refresh();
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label>Type</Label>
          <div className="flex gap-2">
            {(["drink", "bean"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 h-9 rounded-[var(--radius-md)] text-sm border transition ${
                  type === t
                    ? "bg-[var(--color-coffee)] text-white border-transparent"
                    : "border-[var(--border)] text-fg/70"
                }`}
              >
                {t === "drink" ? "Drink" : "Bean"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={product?.name} />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ""} placeholder="https://..." />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price (£)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price ?? 0} />
          </div>
          <div>
            <Label htmlFor="cost">Cost (£)</Label>
            <Input id="cost" name="cost" type="number" step="0.01" min="0" required defaultValue={product?.cost ?? 0} />
          </div>
          <div>
            <Label htmlFor="stockLevel">
              {type === "bean" ? "Stock (kg)" : "Stock"}
            </Label>
            <Input
              id="stockLevel"
              name="stockLevel"
              type="number"
              min="0"
              defaultValue={product?.stockLevel ?? (type === "bean" ? 20 : 999)}
            />
          </div>
        </div>

        {type === "bean" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" name="origin" defaultValue={product?.origin ?? ""} placeholder="Ethiopia" />
            </div>
            <div>
              <Label htmlFor="roastLevel">Roast level</Label>
              <Select id="roastLevel" name="roastLevel" defaultValue={product?.roastLevel ?? "Medium"}>
                <option>Light</option>
                <option>Medium-Light</option>
                <option>Medium</option>
                <option>Medium-Dark</option>
                <option>Dark</option>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="availability" defaultChecked={product?.availability ?? true} />
            Available
          </label>
          {type === "drink" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="hasMilk" defaultChecked={product?.hasMilk ?? true} />
              Can have milk
            </label>
          )}
        </div>

        {err && <p className="text-xs text-[var(--color-err)]">{err}</p>}

        <div className="flex items-center justify-between pt-4 border-t border-app">
          <div>
            {mode === "edit" && (
              <Button type="button" variant="destructive" onClick={remove}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
