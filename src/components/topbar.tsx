"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import { LogOut, Coffee, ShoppingBag, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export function Topbar({ userName, role }: { userName: string; role: string }) {
  return (
    <header className="h-14 border-b border-app bg-elev flex items-center justify-between px-5 sticky top-0 z-10">
      <div className="md:hidden flex items-center gap-2">
        <Coffee className="h-5 w-5 text-[var(--color-coffee)]" />
        <span className="text-sm font-semibold font-display">Badly Brewed</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {role === "customer" && (
          <Link href="/shop/orders">
            <Button variant="ghost" size="sm">
              <ClipboardCheck className="h-4 w-4" />
              Orders
            </Button>
          </Link>
        )}
        {role === "customer" && (
          <Link href="/shop/cart">
            <Button variant="secondary" size="sm">
              <ShoppingBag className="h-4 w-4" />
              Cart
            </Button>
          </Link>
        )}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium">{userName}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">{role}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
