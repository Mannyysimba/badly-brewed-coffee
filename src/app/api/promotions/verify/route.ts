import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { promoCodes } from "@/lib/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").toUpperCase();
  const amount = Number(url.searchParams.get("amount") ?? "0");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const now = new Date();
  const promo = db
    .select()
    .from(promoCodes)
    .where(and(eq(promoCodes.code, code), eq(promoCodes.active, true), lte(promoCodes.startsAt, now), gte(promoCodes.endsAt, now)))
    .get();

  if (!promo) return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  if (amount < promo.minOrder) {
    return NextResponse.json(
      { error: `Minimum order £${promo.minOrder.toFixed(2)} to use this code.` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: promo.code,
    percentOff: promo.percentOff,
    eligibleType: promo.eligibleType,
  });
}
