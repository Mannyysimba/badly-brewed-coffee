import { ProductForm } from "../product-form";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const defaultType = sp.type === "bean" ? "bean" : "drink";
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          New {defaultType === "drink" ? "drink" : "bean"}
        </h1>
        <p className="text-sm text-muted mt-1">Add a new item to the menu.</p>
      </div>
      <ProductForm mode="create" defaultType={defaultType} />
    </div>
  );
}
