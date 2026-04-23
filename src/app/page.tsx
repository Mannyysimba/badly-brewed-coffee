import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  Coffee,
  Truck,
  Award,
  RotateCcw,
  Star,
} from "lucide-react";

const CUSTOMER = "customer@test.com";
const signinAs = (email: string) =>
  `/signin?prefill=${encodeURIComponent(email)}`;

const TEAM_ROLES = [
  { label: "Customer", email: "customer@test.com" },
  { label: "Barista", email: "barista@test.com" },
  { label: "Manager", email: "manager@test.com" },
  { label: "Admin", email: "admin@test.com" },
];

const DRINKS = [
  { name: "Latte", price: "£4.50", note: "Silky, mellow, crowd-pleaser." },
  { name: "Flat White", price: "£4.60", note: "Double shot, microfoam, tight." },
  { name: "Cappuccino", price: "£4.20", note: "Equal parts espresso, milk, foam." },
  { name: "Mocha", price: "£4.70", note: "Chocolate + espresso + steamed milk." },
  { name: "Cortado", price: "£4.30", note: "4oz gibraltar, balanced to the gram." },
  { name: "Americano", price: "£3.80", note: "Double shot, hot water, clean." },
];

const BEANS = [
  {
    name: "Ethiopian Yirgacheffe",
    origin: "Ethiopia",
    roast: "Light",
    price: "£18.50",
    image: "/images/beans.png",
  },
  {
    name: "Colombian Supremo",
    origin: "Colombia",
    roast: "Medium",
    price: "£16.00",
    image: "/images/beans.png",
  },
  {
    name: "Kenyan AA",
    origin: "Kenya",
    roast: "Medium",
    price: "£19.90",
    image: "/images/beans.png",
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
          <a href="#drinks" className="hover:text-white transition">Drinks</a>
          <a href="#beans" className="hover:text-white transition">Beans</a>
          <a href="#loyalty" className="hover:text-white transition">Loyalty</a>
          <a href="#visit" className="hover:text-white transition">Visit us</a>
        </div>
        <Link
          href={signinAs(CUSTOMER)}
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

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-32 md:pt-24 md:pb-44">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-white/70 border border-white/20 rounded-full px-3 py-1 backdrop-blur-sm bg-white/5">
            Open today · 7am – 7pm
          </span>

          <h1 className="mt-6 font-semibold leading-[0.95] tracking-[-0.02em] text-5xl md:text-7xl lg:text-[96px] max-w-4xl">
            Your daily dose of{" "}
            <em className="font-display italic font-normal text-[#e8bfa0]">perfection.</em>
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/75 max-w-xl">
            Fresh coffee pulled to order, single-origin beans roasted weekly, and a loyalty card
            that actually counts itself. Welcome to Badly Brewed.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
            <Link
              href={signinAs(CUSTOMER)}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#c17e5c] hover:bg-[#b06f4e] text-white font-semibold transition shadow-[0_10px_30px_-10px_rgba(193,126,92,0.6)]"
            >
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#beans"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/30 hover:border-white/60 text-white font-medium transition backdrop-blur-sm"
            >
              Browse beans
            </a>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-white/55">
            <MapPin className="h-3 w-3" /> Badly Brewed Coffee · Sheffield
          </p>
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="relative z-10 -mt-20 px-6 md:px-10 pb-16 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Coffee, title: "Made to order", body: "Every cup pulled fresh when you walk in or click." },
            { icon: Award, title: "Auto-loyalty", body: "10 stamps = 1 free coffee. Tracked on your account, not a card." },
            { icon: Truck, title: "Beans delivered", body: "Take home the beans you love. UK delivery or in-store pickup." },
            { icon: RotateCcw, title: "Easy refunds", body: "Not happy with a bag? One form online, we handle the rest." },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="h-9 w-9 rounded-xl bg-[#c17e5c]/20 text-[#e8bfa0] border border-[#c17e5c]/30 flex items-center justify-center mb-4">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-[14px]">{v.title}</p>
                <p className="text-[12.5px] text-white/60 mt-1 leading-relaxed">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Drinks ---------- */}
      <section id="drinks" className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">On the menu</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
              Six drinks. <em className="italic text-[#e8bfa0]">Pulled right.</em>
            </h2>
          </div>
          <Link
            href={signinAs(CUSTOMER)}
            className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5"
          >
            Order a cup <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DRINKS.map((d) => (
            <div
              key={d.name}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-lg">{d.name}</h3>
                <span className="font-mono text-sm text-[#e8bfa0]">{d.price}</span>
              </div>
              <p className="text-[13px] text-white/60 mt-1.5">{d.note}</p>
              <div className="mt-5 flex items-center gap-1 text-[10px] text-white/45 uppercase tracking-wider">
                <span>Whole</span>·<span>Oat</span>·<span>Almond</span>·<span>Skim</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Beans ---------- */}
      <section id="beans" className="px-6 md:px-10 py-20 bg-[#14100b] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">Take-home beans</p>
              <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
                Roasted weekly, <em className="italic text-[#e8bfa0]">shipped next day.</em>
              </h2>
            </div>
            <Link
              href={signinAs(CUSTOMER)}
              className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5"
            >
              Shop the full range <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BEANS.map((b) => (
              <Link
                key={b.name}
                href={signinAs(CUSTOMER)}
                className="group block rounded-2xl overflow-hidden border border-white/10 bg-[#0e0a07] hover:border-[#c17e5c]/40 transition"
              >
                <div className="relative aspect-[4/3] bg-[#1c140e] overflow-hidden">
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold">{b.name}</h3>
                    <span className="font-mono text-sm text-[#e8bfa0]">{b.price}</span>
                  </div>
                  <p className="text-[12px] text-white/55 mt-1.5">
                    {b.origin} · {b.roast} roast · 250g
                  </p>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#e8bfa0] text-[#e8bfa0]" />
                    ))}
                    <span className="text-[11px] text-white/40 ml-1">(127)</span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#e8bfa0] group-hover:translate-x-0.5 transition">
                    Add to basket <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Loyalty ---------- */}
      <section id="loyalty" className="px-6 md:px-10 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
            <Image src="/images/shot-2.jpg" alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-semibold uppercase tracking-wider">
                10<sup className="text-[7px]">th</sup> cup free
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">Loyalty</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
              No paper cards. <br />
              <em className="italic text-[#e8bfa0]">Just yours.</em>
            </h2>
            <p className="mt-5 text-white/70 text-[15px] leading-relaxed max-w-lg">
              Every coffee adds a stamp to your account. We track it. You drink it. On the 10th,
              it&apos;s on us — up to £5 off. No cards to lose, no queue shuffle.
            </p>

            <div className="mt-6 flex items-center gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < 7;
                return (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      filled
                        ? "bg-[#c17e5c] text-white"
                        : "border-2 border-dashed border-white/20 text-white/30"
                    }`}
                  >
                    {filled ? "☕" : i + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-white/50 mt-3">
              Sample account — 7 of 10. 3 more to go for a free brew.
            </p>

            <div className="mt-8">
              <Link
                href={signinAs(CUSTOMER)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#c17e5c] hover:bg-[#b06f4e] text-white font-semibold transition"
              >
                Start collecting <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Visit us ---------- */}
      <section id="visit" className="px-6 md:px-10 py-20 bg-[#14100b] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#e8bfa0]/70">Visit us</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">
            Coffee, the way <em className="italic text-[#e8bfa0]">it should be.</em>
          </h2>
          <p className="mt-5 text-white/70 max-w-xl mx-auto">
            Drop by the shop in Sheffield or order online. Either way, we&apos;ll have a cup ready.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-[11px] uppercase tracking-widest text-white/45">Address</p>
              <p className="mt-1.5">Division Street<br />Sheffield, S1 4GF</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-[11px] uppercase tracking-widest text-white/45">Hours</p>
              <p className="mt-1.5">Mon–Fri · 7:00 – 19:00<br />Sat–Sun · 8:00 – 18:00</p>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-[11px] uppercase tracking-widest text-white/45">Contact</p>
              <p className="mt-1.5">hello@badlybrewed.co<br />+44 114 000 0000</p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href={signinAs(CUSTOMER)}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#c17e5c] hover:bg-[#b06f4e] text-white font-semibold transition"
            >
              Order online <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Team demo shortcuts (discreet) ---------- */}
      <section className="px-6 md:px-10 py-14 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
            Team 17 · Quick demo access
          </p>
          <p className="mt-2 text-[13px] text-white/55">
            Shortcut sign-in for reviewers and teammates. Password = username.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {TEAM_ROLES.map((r) => (
              <Link
                key={r.email}
                href={signinAs(r.email)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-white/15 hover:border-white/40 text-[12.5px] text-white/75 hover:text-white transition"
              >
                {r.label}
                <span className="text-white/30 text-[10px] font-mono hidden sm:inline">
                  {r.email.split("@")[0]}
                </span>
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
          <span>Team 17 · University of Sheffield</span>
        </div>
      </footer>
    </main>
  );
}
