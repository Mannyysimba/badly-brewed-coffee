"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartMilk = "whole" | "oat" | "almond" | "skim" | "none";

export type CartLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  milkType: CartMilk;
  imageUrl?: string | null;
  type: "drink" | "bean";
};

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: number, milkType: CartMilk) => void;
  setQty: (productId: number, milkType: CartMilk, qty: number) => void;
  setMilk: (productId: number, fromMilk: CartMilk, toMilk: CartMilk) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const idx = s.lines.findIndex(
            (l) => l.productId === line.productId && l.milkType === line.milkType
          );
          if (idx >= 0) {
            const copy = [...s.lines];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + line.quantity };
            return { lines: copy };
          }
          return { lines: [...s.lines, line] };
        }),
      remove: (productId, milkType) =>
        set((s) => ({
          lines: s.lines.filter((l) => !(l.productId === productId && l.milkType === milkType)),
        })),
      setQty: (productId, milkType, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.productId === productId && l.milkType === milkType ? { ...l, quantity: qty } : l
            )
            .filter((l) => l.quantity > 0),
        })),
      setMilk: (productId, fromMilk, toMilk) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.productId === productId && l.milkType === fromMilk ? { ...l, milkType: toMilk } : l
          ),
        })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((s, l) => s + l.price * l.quantity, 0),
      count: () => get().lines.reduce((s, l) => s + l.quantity, 0),
    }),
    { name: "bbc-cart" }
  )
);
