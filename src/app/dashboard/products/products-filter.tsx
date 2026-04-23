"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "@/components/ui";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function ProductsFilter({ defaultQ, defaultType }: { defaultQ: string; defaultType: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function update(next: { q?: string; type?: string }) {
    start(() => {
      const p = new URLSearchParams(params);
      if (next.q !== undefined) (next.q ? p.set("q", next.q) : p.delete("q"));
      if (next.type !== undefined) (next.type !== "all" ? p.set("type", next.type) : p.delete("type"));
      router.replace(`/dashboard/products?${p.toString()}`);
    });
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          className="pl-8"
          placeholder="Search by name, origin, roast..."
          defaultValue={defaultQ}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>
      <Select
        defaultValue={defaultType}
        onChange={(e) => update({ type: e.target.value })}
        className="w-[140px]"
      >
        <option value="all">All types</option>
        <option value="drink">Drinks</option>
        <option value="bean">Beans</option>
      </Select>
    </div>
  );
}
