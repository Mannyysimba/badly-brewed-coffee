"use client";

import { useState } from "react";
import { useCart, type CartMilk } from "@/lib/cart-store";
import { Button, Card, Input, Select, EmptyState } from "@/components/ui";
import { formatGBP } from "@/lib/utils";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MILKS: CartMilk[] = ["whole", "oat", "almond", "skim"];

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const setMilk = useCart((s) => s.setMilk);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());
  const router = useRouter();

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; percentOff: number } | null>(null);
  const [promoErr, setPromoErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [placing, setPlacing] = useState(false);

  const discount = promoApplied ? (total * promoApplied.percentOff) / 100 : 0;
  const finalTotal = total - discount;

  async function verifyPromo() {
    setPromoErr(null);
    setChecking(true);
    const res = await fetch(`/api/promotions/verify?code=${encodeURIComponent(promo)}&amount=${total}`);
    setChecking(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPromoErr(data.error ?? "Invalid promo code.");
      setPromoApplied(null);
      return;
    }
    const data = await res.json();
    setPromoApplied({ code: data.code, percentOff: data.percentOff });
  }

  async function checkout() {
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          milkType: l.milkType,
        })),
        promoCode: promoApplied?.code ?? null,
      }),
    });
    setPlacing(false);
    if (!res.ok) return;
    clear();
    router.push("/shop/orders");
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-5 w-5" />}
        title="Your cart is empty"
        description="Browse the menu and add a warm cup or a bag of beans."
        action={
          <Link href="/shop">
            <Button>Browse menu</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Your cart</h1>
        <p className="text-sm text-muted mt-1">{lines.length} line{lines.length === 1 ? "" : "s"}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card className="p-0 overflow-hidden divide-y divide-[var(--border)]">
          {lines.map((l) => (
            <div key={`${l.productId}-${l.milkType}`} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-muted">
                  {l.type === "drink" && l.milkType !== "none" ? `${l.milkType} milk · ` : ""}
                  {formatGBP(l.price)} each
                </p>
                {l.type === "drink" && l.milkType !== "none" && (
                  <Select
                    value={l.milkType}
                    onChange={(e) => setMilk(l.productId, l.milkType, e.target.value as CartMilk)}
                    className="mt-2 w-36 h-7 text-xs"
                  >
                    {MILKS.map((m) => (
                      <option key={m} value={m}>{m} milk</option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQty(l.productId, l.milkType, Math.max(0, l.quantity - 1))}
                  className="h-8 w-8"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  className="w-12 text-center h-8"
                  type="number"
                  value={l.quantity}
                  onChange={(e) => setQty(l.productId, l.milkType, Math.max(0, parseInt(e.target.value) || 0))}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQty(l.productId, l.milkType, l.quantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="w-20 text-right font-mono tabular-nums">
                {formatGBP(l.price * l.quantity)}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => remove(l.productId, l.milkType)}
                className="h-8 w-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </Card>

        <Card className="p-5 h-fit space-y-4 lg:sticky lg:top-24">
          <div>
            <p className="text-xs text-muted mb-2">Promo code</p>
            <div className="flex gap-2">
              <Input
                placeholder="WELCOME10"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                disabled={!!promoApplied}
              />
              {promoApplied ? (
                <Button variant="outline" onClick={() => { setPromoApplied(null); setPromo(""); }}>
                  Clear
                </Button>
              ) : (
                <Button variant="secondary" onClick={verifyPromo} disabled={!promo || checking}>
                  {checking ? "..." : "Apply"}
                </Button>
              )}
            </div>
            {promoApplied && (
              <p className="text-xs text-[var(--color-ok)] mt-2">
                {promoApplied.code} applied · {promoApplied.percentOff}% off
              </p>
            )}
            {promoErr && <p className="text-xs text-[var(--color-err)] mt-2">{promoErr}</p>}
          </div>

          <div className="pt-4 border-t border-app space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-mono">{formatGBP(total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--color-ok)]">
                <span>Discount</span>
                <span className="font-mono">− {formatGBP(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-app">
              <span>Total</span>
              <span className="font-mono">{formatGBP(finalTotal)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={checkout} disabled={placing}>
            {placing ? "Placing order..." : "Place order"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
