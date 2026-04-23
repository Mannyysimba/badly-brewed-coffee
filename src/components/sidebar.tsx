"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Ticket,
  TrendingUp,
  Users,
  Receipt,
  UserCog,
  Coffee,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["manager", "admin"] },
  { href: "/dashboard/products", label: "Products", icon: Package, roles: ["manager", "admin"] },
  { href: "/dashboard/promotions", label: "Promotions", icon: Ticket, roles: ["manager", "admin"] },
  { href: "/dashboard/analytics", label: "Sales Analytics", icon: TrendingUp, roles: ["manager", "admin"] },
  { href: "/dashboard/customers", label: "Customers", icon: Users, roles: ["manager", "admin"] },
  { href: "/dashboard/refunds", label: "Refunds", icon: Receipt, roles: ["manager", "admin"] },
  { href: "/dashboard/employees", label: "Employees", icon: UserCog, roles: ["admin"] },
];

export function Sidebar({ role }: { role: "manager" | "admin" | "barista" | "customer" }) {
  const pathname = usePathname();
  const visible = items.filter((i) => i.roles.includes(role));

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-app bg-elev h-screen sticky top-0">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5 border-b border-app">
        <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-coffee)] text-white flex items-center justify-center">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold font-display tracking-tight">Badly Brewed</p>
          <p className="text-[10px] text-muted uppercase tracking-widest">Coffee Co.</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--color-coffee)]/12 text-[var(--color-coffee)] font-medium"
                  : "text-fg/75 hover:bg-[var(--color-bisque)] hover:text-fg"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-app px-4 py-3 text-[10px] text-muted uppercase tracking-widest">
        Signed in as {role}
      </div>
    </aside>
  );
}
