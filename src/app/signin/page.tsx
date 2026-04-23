"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Coffee } from "lucide-react";

function SignInInner() {
  const params = useSearchParams();
  const router = useRouter();
  const prefill = params.get("prefill") ?? "";
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState(prefill ? prefill.split("@")[0] : "");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setErr("Wrong email or password.");
      return;
    }
    router.push(callbackUrl === "/" ? "/" : callbackUrl);
    router.refresh();
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
