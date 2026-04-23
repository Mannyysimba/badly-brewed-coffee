import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "../product-form";
import Image from "next/image";
import { Card } from "@/components/ui";
import { formatGBP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = db.select().from(products).where(eq(products.id, Number(id))).get();
  if (!product) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-5">
        {product.imageUrl ? (
          <div className="relative h-28 w-28 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bisque)] shrink-0">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="112px" />
          </div>
        ) : (
          <div className="h-28 w-28 rounded-[var(--radius-lg)] bg-[var(--color-bisque)] shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted uppercase tracking-wider">#{product.id} · {product.type}</p>
          <h1 className="font-display text-3xl font-semibold mt-0.5">{product.name}</h1>
          <p className="text-sm text-muted mt-2 max-w-xl">{product.description}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="font-mono">{formatGBP(product.price)}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">cost {formatGBP(product.cost)}</span>
          </div>
        </div>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
