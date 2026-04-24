"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Coffee } from "lucide-react";

function SignInInner() {
  const params = useSearchParams();
  const prefill = params.get("prefill") ?? "";
  const auto = params.get("auto") === "1";
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState(prefill ? prefill.split("@")[0] : "");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(auto);
  const autoTriggered = useRef(false);

  async function doSignIn(emailArg: string, passwordArg: string) {
    setErr(null);
    setLoading(true);
    // Clear any lingering session so role-gates don't bounce us to the wrong dashboard.
    await signOut({ redirect: false });
    const res = await signIn("credentials", {
      email: emailArg,
      password: passwordArg,
      redirect: false,
    });
    setLoading(false);
    if (res?.error || !res?.ok) {
      setErr("Wrong email or password.");
      return;
    }
    // Hard navigation so the freshly-set cookie is sent on the next request.
    window.location.assign(callbackUrl === "/" ? "/" : callbackUrl);
  }

  useEffect(() => {
    if (auto && prefill && !autoTriggered.current) {
      autoTriggered.current = true;
      doSignIn(prefill, prefill.split("@")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, prefill]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    doSignIn(email, password);
  }

  if (auto && loading && !err) {
    return (
      <main className="bean-bg min-h-screen flex items-center justify-center px-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <Coffee className="h-8 w-8 text-[var(--color-coffee)] animate-pulse" />
          <p className="text-sm text-muted">Brewing your session as {prefill}…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bean-bg min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-6 text-sm text-muted hover:text-fg">
          <Coffee className="h-4 w-4" />
          <span className="font-display">Badly Brewed</span>
        </Link>
        <Card className="p-7">
          <CardTitle className="text-base">Welcome back</CardTitle>
          <CardDescription>Sign in to step behind the counter.</CardDescription>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@test.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {err && <p className="text-xs text-[var(--color-err)]">{err}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-[11px] text-muted leading-relaxed">
            Try{" "}
            <code className="px-1 py-0.5 rounded bg-[var(--color-bisque)]">manager@test.com</code>{" "}
            /{" "}
            <code className="px-1 py-0.5 rounded bg-[var(--color-bisque)]">manager</code> for the
            full manager dashboard.
          </p>
        </Card>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
