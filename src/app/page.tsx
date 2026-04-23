import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, MapPin, Coffee, BarChart3, ShieldCheck } from "lucide-react";

const DEFAULT_PREFILL = "customer@test.com";

type Role = {
  title: string;
  email: string;
  password: string;
  tagline: string;
  bullets: string[];
  icon: typeof Coffee;
};

const ROLES: Role[] = [
  {
    title: "Customer",
    email: "customer@test.com",
    password: "customer",
    tagline: "Order beans. Earn stamps. Track every cup.",
    bullets: [
      "Browse the bean catalogue — search, filter, favourite",
      "Auto-loyalty card, 10 stamps for a free coffee",
      "Online refund requests with a unique ticket number",
    ],
    icon: Coffee,
  },
  {
    title: "Barista",
    email: "barista@test.com",
    password: "barista",
    tagline: "In-store terminal. Orders, stamps, deliveries.",
    bullets: [
      "Serve walk-in orders, card or cash, auto-log the sale",
      "Manage loyalty stamps, claim free coffees at 9+",
      "Handle in-store refunds and verify online ones",
    ],
    icon: Coffee,
  },
  {
    title: "Manager",
    email: "manager@test.com",
    password: "manager",
    tagline: "The dashboard side of the counter.",
    bullets: [
      "Sales analytics by date — drinks, beans, top sellers",
      "Manage the menu, promo codes, loyalty rules",
      "Review refunds, see customer spend, spot low stock",
    ],
    icon: BarChart3,
  },
  {
    title: "Admin",
    email: "admin@test.com",
    password: "admin",
    tagline: "Employee accounts. Security. Clean-up.",
    bullets: [
      "Create and remove manager / barista accounts",
      "Reset passwords, suspend inactive customers",
      "Audit activity logs across the whole system",
    ],
    icon: ShieldCheck,
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
    <main className="min-h-screen bg-[#0e0a07] text-white overflow-x-hidden">
      {/* ---------- Top nav ---------- */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon-white.svg" alt="BBC" width={28} height={28} priority />
          <span className="text-[15px] font-semibold tracking-tight">Badly Brewed Coffee</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#who" className="hover:text-white transition">Who it&apos;s for</a>
          <a href="#team" className="hover:text-white transition">Team 17</a>
          <a href="#stack" className="hover:text-white transition">Stack</a>
        </div>
        <Link
          href={`/signin?prefill=${encodeURIComponent(DEFAULT_PREFILL)}`}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-[#0e0a07] text-sm font-semibold hover:bg-white/90 transition"
        >
          Sign in <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0e0a07]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-28 md:pt-24 md:pb-40">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-white/70 border border-white/20 rounded-full px-3 py-1 backdrop-blur-sm bg-white/5">
            Team 17 · University project
          </span>

          <h1 className="mt-6 font-semibold leading-[0.95] tracking-[-0.02em] text-5xl md:text-7xl lg:text-[96px] max-w-4xl">
            Your daily dose of{" "}
            <em className="font-display italic font-normal text-[#e8bfa0]">perfection.</em>
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/75 max-w-xl">
            One clean system for the whole shop — customer ordering, barista terminal, manager
            analytics, admin control. Warm, fast, built for real humans behind the counter.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
            <Link
              href={`/signin?prefill=${encodeURIComponent(DEFAULT_PREFILL)}`}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#c17e5c] hover:bg-[#b06f4e] text-white font-semibold transition shadow-[0_10px_30px_-10px_rgba(193,126,92,0.6)]"
            >
              Step in as customer <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#who"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/30 hover:border-white/60 text-white font-medium transition backdrop-blur-sm"
            >
              See every role
            </a>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-white/55">
            <MapPin className="h-3 w-3" /> Badly Brewed Coffee · Sheffield
          </p>
        </div>
      </section>

      {/* ---------- Role cards ---------- */}
      <section id="who" className="relative z-10 -mt-16 px-6 md:px-10 pb-24 max-w-7xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">01 · Who it&apos;s for</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl italic font-normal">
            Four seats <span className="not-italic font-semibold">at the counter.</span>
          </h2>
          <p className="mt-3 text-sm text-white/65">
            Click any role to sign in with the demo account pre-filled. Password is the same as the
            username — no typing needed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                href={`/signin?prefill=${encodeURIComponent(r.email)}`}
                className="group relative flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-[10px] text-white/30 font-mono">0{i + 1}</div>
                <div className="h-10 w-10 rounded-xl bg-[#c17e5c]/20 text-[#e8bfa0] border border-[#c17e5c]/30 flex items-center justify-center mb-5">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <p className="text-[13px] text-white/60 mt-1">{r.tagline}</p>

                <ul className="mt-5 space-y-2 text-[12.5px] text-white/75 leading-relaxed">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[#c17e5c] shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/35 truncate">{r.email}</span>
                  <span className="inline-flex items-center gap-1 text-[#e8bfa0] group-hover:translate-x-0.5 transition">
                    enter <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- What BBC does ---------- */}
      <section className="relative px-6 md:px-10 py-24 bg-[#14100b] border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">02 · What it does</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
              From paper stamps <br />
              to <em className="italic text-[#e8bfa0]">a real system.</em>
            </h2>
            <p className="mt-6 text-white/70 text-[15px] leading-relaxed max-w-lg">
              Badly Brewed Coffee grew out of manual loyalty stamps and email-based bean orders.
              This build digitises both sides — customers manage their own loyalty and refunds
              online, while staff get clean analytics and reliable order tracking.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                ["Auto-loyalty", "Stamps tracked on the account, no paper cards."],
                ["Verified refunds", "Online form, unique ticket, manager approval."],
                ["Live analytics", "Daily revenue, top sellers, drinks vs beans split."],
                ["Role-based access", "Customer, barista, manager, admin. Clean routing."],
              ].map(([title, body]) => (
                <div key={title} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <p className="text-[13px] font-semibold">{title}</p>
                  <p className="text-[12px] text-white/55 mt-1 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
            <Image
              src="/images/shot-1.jpg"
              alt="Latte art"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="rounded-xl bg-black/60 backdrop-blur border border-white/10 p-4">
                <p className="text-[11px] uppercase tracking-widest text-white/50">Now shipping</p>
                <p className="text-[15px] font-semibold mt-0.5">
                  Six drinks · four single-origin beans
                </p>
                <p className="text-[12px] text-white/60 mt-1">
                  Latte, Americano, Cappuccino, Flat White, Cortado, Mocha — plus beans from
                  Ethiopia, Colombia, Brazil, Kenya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Team 17 ---------- */}
      <section id="team" className="relative px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">03 · Team 17</p>
              <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
                Six people. <em className="italic text-[#e8bfa0]">One brief.</em>
              </h2>
            </div>
            <p className="text-sm text-white/55 max-w-sm">
              Built as a university team project for a full-stack requirements-driven system.
              Stakeholders mapped: owner, employees, admin, customers, Steel City community,
              delivery partner, payment provider.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              "Giorgos Michaelides",
              "Joshua Siddons",
              "Mehran Bhutto",
              "Konstantinos Ioannou",
              "Chun Hei Ting Samuel",
              "Manil Belkacem",
            ].map((name) => (
              <div
                key={name}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-[13px]"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stack ---------- */}
      <section id="stack" className="relative px-6 md:px-10 pb-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">04 · Stack</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
            Boring tech, <em className="italic text-[#e8bfa0]">polished UI.</em>
          </h2>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Next.js 15",
              "TypeScript strict",
              "Tailwind v4",
              "Drizzle ORM",
              "SQLite",
              "Auth.js v5",
              "Recharts",
              "Zustand",
              "Zod",
            ].map((t) => (
              <span
                key={t}
                className="px-4 h-9 inline-flex items-center rounded-full border border-white/15 text-[13px] text-white/80 bg-white/[0.02]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative px-6 md:px-10 pb-24">
        <div className="max-w-4xl mx-auto text-center p-10 md:p-14 rounded-3xl border border-white/10 bg-gradient-to-br from-[#c17e5c]/15 via-transparent to-[#c17e5c]/5">
          <h3 className="font-display text-3xl md:text-4xl">
            Ready for a <em className="italic text-[#e8bfa0]">taste?</em>
          </h3>
          <p className="mt-3 text-white/65 max-w-lg mx-auto text-[14px]">
            Sign in with any demo account. Nothing to install, all four roles live side by side.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {ROLES.map((r) => (
              <Link
                key={r.email}
                href={`/signin?prefill=${encodeURIComponent(r.email)}`}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full border border-white/20 hover:border-white/50 text-[13px] font-medium transition"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4 text-xs text-white/45">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon-white.svg" alt="" width={18} height={18} />
            <span>Badly Brewed Coffee · Sheffield</span>
          </div>
          <span>Team 17 · University of Sheffield · Requirements project</span>
        </div>
      </footer>
    </main>
  );
}
