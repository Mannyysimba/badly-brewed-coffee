"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { X, ArrowRight, Coffee } from "lucide-react";

type Props = {
  children: React.ReactNode;
  className?: string;
  email?: string;
  redirectTo?: string;
  roleLabel?: string;
};

export function SigninTrigger({
  children,
  className,
  email = "customer@test.com",
  redirectTo = "/shop",
  roleLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <SigninModal
          defaultEmail={email}
          redirectTo={redirectTo}
          roleLabel={roleLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SigninModal({
  defaultEmail,
  redirectTo,
  roleLabel,
  onClose,
}: {
  defaultEmail: string;
  redirectTo: string;
  roleLabel?: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultEmail.split("@")[0] || "customer");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password: password || "x",
      redirect: false,
    });
    if (res?.error) {
      setLoading(false);
      setErr("Something went wrong. Try again.");
      return;
    }
    // Full page load so the server-side session check picks up the new
    // cookie. router.push + refresh can race with the cookie write and
    // drop you back on the landing — window.location never does.
    window.location.assign(redirectTo);
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-[#14100b] border border-white/10 shadow-2xl p-7 text-white animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <Coffee className="h-5 w-5 text-[#e8bfa0]" />
          <span className="text-sm font-semibold">Badly Brewed</span>
        </div>

        <h2 className="font-display text-2xl leading-tight">
          {roleLabel ? (
            <>
              Sign in as <em className="italic text-[#e8bfa0]">{roleLabel}.</em>
            </>
          ) : mode === "signin" ? (
            <>
              Welcome <em className="italic text-[#e8bfa0]">back.</em>
            </>
          ) : (
            <>
              Make an <em className="italic text-[#e8bfa0]">account.</em>
            </>
          )}
        </h2>
        <p className="text-[13px] text-white/55 mt-1">
          {roleLabel
            ? `Demo shortcut — credentials are pre-filled, just hit sign in.`
            : mode === "signin"
            ? "Sign in to order beans and track your stamps."
            : "One minute, then the good coffee is yours."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c17e5c]/60 focus:bg-white/[0.06] transition"
              />
            </div>
          )}
          <div>
            <label className="text-[11px] font-medium text-white/60 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c17e5c]/60 focus:bg-white/[0.06] transition"
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-[11px] font-medium text-white/60">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  className="text-[11px] text-white/45 hover:text-white/70"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c17e5c]/60 focus:bg-white/[0.06] transition"
            />
          </div>

          {err && <p className="text-xs text-[#ff8a80]">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-[#c17e5c] hover:bg-[#b06f4e] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            {loading ? (
              "Signing in…"
            ) : (
              <>
                {mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {!roleLabel && (
          <p className="text-center text-[12px] text-white/50 mt-5">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErr(null);
                  }}
                  className="text-[#e8bfa0] hover:text-white font-semibold"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already brewing with us?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErr(null);
                  }}
                  className="text-[#e8bfa0] hover:text-white font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
