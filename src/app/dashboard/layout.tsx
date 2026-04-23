import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const role = session.user.role;
  if (role !== "manager" && role !== "admin") {
    redirect(role === "barista" ? "/barista" : "/shop");
  }

  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={session.user.name ?? "User"} role={role} />
        <main className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
