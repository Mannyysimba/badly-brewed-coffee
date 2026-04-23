import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ShopMenu } from "./shop-menu";

export const dynamic = "force-dynamic";

export default async function ShopMenuPage() {
  const drinks = db
    .select()
    .from(products)
    .where(and(eq(products.availability, true), eq(products.type, "drink")))
    .all();
  const beans = db
    .select()
    .from(products)
    .where(and(eq(products.availability, true), eq(products.type, "bean")))
    .all();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold">Today&apos;s menu</h1>
        <p className="text-sm text-muted mt-1">Made to order. Milk swaps at no extra.</p>
      </div>

      <ShopMenu drinks={drinks} beans={beans} />
    </div>
  );
}
