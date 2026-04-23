import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { Coffee, Package, ClipboardCheck } from "lucide-react";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "customer") {
    if (session.user.role === "barista") redirect("/barista");
    else redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-app">
      <Topbar userName={session.user.name ?? "Customer"} role="customer" />
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center gap-4 mb-6 text-sm border-b border-app -mx-2 px-2">
          <Link href="/shop" className="inline-flex items-center gap-1.5 pb-3 border-b-2 border-transparent hover:border-[var(--color-coffee)] hover:text-[var(--color-coffee)]">
            <Package className="h-4 w-4" /> Menu
          </Link>
          <Link href="/shop/orders" className="inline-flex items-center gap-1.5 pb-3 border-b-2 border-transparent hover:border-[var(--color-coffee)] hover:text-[var(--color-coffee)]">
            <ClipboardCheck className="h-4 w-4" /> My orders
          </Link>
          <div className="ml-auto pb-3 text-xs text-muted inline-flex items-center gap-1.5">
            <Coffee className="h-3 w-3" /> Fresh brews, every hour.
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
