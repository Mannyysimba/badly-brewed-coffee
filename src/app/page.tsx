import Link from "next/link";
import { Coffee, ArrowRight, Shield, Clipboard, LineChart as LineIcon, User } from "lucide-react";
import { Button } from "@/components/ui";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const quickSignins = [
  {
    role: "Customer",
    email: "customer@test.com",
    password: "customer",
    blurb: "Browse the menu, order a latte, track your cup.",
    icon: User,
    tone: "from-[var(--color-terracotta)]/20 to-[var(--color-terracotta)]/5",
  },
  {
    role: "Barista",
    email: "barista@test.com",
    password: "barista",
    blurb: "Kanban board of live orders to pull and hand out.",
    icon: Coffee,
    tone: "from-[var(--color-coffee-light)]/25 to-[var(--color-coffee-light)]/5",
  },
  {
    role: "Manager",
    email: "manager@test.com",
    password: "manager",
    blurb: "Full dashboard — sales, refunds, customers, stock.",
    icon: LineIcon,
    tone: "from-[var(--color-coffee)]/25 to-[var(--color-coffee)]/5",
  },
  {
    role: "Admin",
    email: "admin@test.com",
    password: "admin",
    blurb: "Everything manager sees + employee management.",
    icon: Shield,
    tone: "from-[var(--color-coffee-dark)]/25 to-[var(--color-coffee-dark)]/5",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    const r = session.user.role;
    if (r === "barista") redirect("/barista");
    if (r === "manager" || r === "admin") redirect("/dashboard");
    redirect("/shop");
  }

  return (
    <main className="bean-bg min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-coffee)] text-white flex items-center justify-center">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display tracking-tight">Badly Brewed</p>
            <p className="text-[10px] text-muted uppercase tracking-widest">Coffee Co.</p>
          </div>
        </div>
        <Link href="/signin">
          <Button variant="outline" size="sm">
            Sign in <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      <section className="px-6 md:px-10 pt-10 pb-14 max-w-6xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--color-coffee)]/80 bg-[var(--color-bisque)] border border-[var(--border)] rounded-full px-3 py-1 font-semibold">
          <Coffee className="h-3 w-3" /> Coffee Shop OS
        </span>
        <h1 className="mt-5 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Run a tiny coffee shop <br className="hidden md:block" />
          <span className="italic text-[var(--color-coffee)]">without tears.</span>
        </h1>
        <p className="mt-5 text-base text-muted max-w-xl">
          A demo app covering every seat at the counter — customer ordering, barista queue, manager analytics, admin
          employee management. Warm, fast, keyboard-friendly.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signin">
            <Button size="lg">
              Open the shop <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="#roles"
            className="inline-flex items-center gap-2 h-11 px-5 text-sm text-fg/80 hover:text-fg"
          >
            <Clipboard className="h-4 w-4" /> See test accounts
          </a>
        </div>
      </section>

      <section id="roles" className="px-6 md:px-10 pb-20 max-w-6xl mx-auto">
        <h2 className="font-display text-xl mb-1">Sign in as</h2>
        <p className="text-sm text-muted mb-6">Password is the same as the username for every test account.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickSignins.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.role}
                href={`/signin?prefill=${encodeURIComponent(q.email)}`}
                className="card relative p-5 overflow-hidden hover:shadow-[0_6px_30px_-10px_rgba(111,78,55,0.25)] transition group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${q.tone} opacity-60 group-hover:opacity-100 transition`}
                />
                <div className="relative">
                  <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-coffee)] text-white flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-sm">{q.role}</p>
                  <p className="text-xs text-muted mt-0.5">{q.blurb}</p>
                  <div className="mt-4 text-[11px] font-mono text-fg/60 space-y-0.5">
                    <p>{q.email}</p>
                    <p>pw · {q.password}</p>
                  </div>
                  <div className="mt-4 text-[11px] font-semibold text-[var(--color-coffee)] inline-flex items-center gap-1">
                    Continue <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-app px-6 md:px-10 py-6 text-xs text-muted text-center">
        Built for demo purposes. SQLite + Next.js + Tailwind. No real coffee was harmed.
      </footer>
    </main>
  );
}
