"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/db/schema";
import { Button, Select, Card, Badge } from "@/components/ui";
import { formatGBP } from "@/lib/utils";
import { useCart, type CartMilk } from "@/lib/cart-store";
import { Plus, Check } from "lucide-react";

const MILKS: CartMilk[] = ["whole", "oat", "almond", "skim"];

export function ShopMenu({ drinks, beans }: { drinks: Product[]; beans: Product[] }) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4">Drinks</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drinks.map((d) => <DrinkCard key={d.id} product={d} />)}
        </div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-4">Beans to take home</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beans.map((b) => <BeanCard key={b.id} product={b} />)}
        </div>
      </section>
    </div>
  );
}

function DrinkCard({ product }: { product: Product }) {
  const [milk, setMilk] = useState<CartMilk>(product.hasMilk ? "whole" : "none");
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      milkType: milk,
      imageUrl: product.imageUrl,
      type: "drink",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Card className="p-0 overflow-hidden">
      {product.imageUrl && (
        <div className="relative h-40 w-full bg-[var(--color-bisque)]">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{product.name}</h3>
          <span className="font-mono text-sm">{formatGBP(product.price)}</span>
        </div>
        {product.description && (
          <p className="text-xs text-muted line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          {product.hasMilk && (
            <Select value={milk} onChange={(e) => setMilk(e.target.value as CartMilk)} className="flex-1 h-8 text-xs">
              {MILKS.map((m) => (
                <option key={m} value={m}>{m} milk</option>
              ))}
            </Select>
          )}
          <Button size="sm" onClick={handleAdd} variant={added ? "success" : "primary"} className="shrink-0">
            {added ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BeanCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      milkType: "none",
      imageUrl: product.imageUrl,
      type: "bean",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Card className="p-0 overflow-hidden">
      {product.imageUrl && (
        <div className="relative h-40 w-full bg-[var(--color-bisque)]">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{product.name}</h3>
          <span className="font-mono text-sm">{formatGBP(product.price)}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {product.origin && <Badge tone="neutral">{product.origin}</Badge>}
          {product.roastLevel && <Badge tone="info">{product.roastLevel}</Badge>}
          {product.stockLevel < 10 && <Badge tone="warn">Low stock</Badge>}
        </div>
        {product.description && (
          <p className="text-xs text-muted line-clamp-2">{product.description}</p>
        )}
        <Button size="sm" onClick={handleAdd} variant={added ? "success" : "primary"} className="w-full">
          {added ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add 250g bag</>}
        </Button>
      </div>
    </Card>
  );
}
