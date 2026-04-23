import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/topbar";

export default async function BaristaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role === "customer") redirect("/shop");

  return (
    <div className="min-h-screen bg-app">
      <Topbar userName={session.user.name ?? "Barista"} role={session.user.role} />
      <main className="max-w-7xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
