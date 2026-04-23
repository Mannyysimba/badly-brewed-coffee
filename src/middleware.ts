import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const path = nextUrl.pathname;
  const publicPaths = ["/", "/signin"];
  const isPublic =
    publicPaths.includes(path) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/images/") ||
    path.startsWith("/fonts/") ||
    /\.(svg|png|jpg|jpeg|webp|ico|otf|woff2?|ttf)$/i.test(path);

  if (isPublic) return NextResponse.next();

  if (!session?.user) {
    const url = new URL("/signin", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  const role = session.user.role;

  if (path.startsWith("/dashboard/employees") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  if (path.startsWith("/dashboard") && role !== "manager" && role !== "admin") {
    return NextResponse.redirect(new URL(role === "barista" ? "/barista" : "/shop", nextUrl));
  }
  if (path.startsWith("/barista") && role !== "barista" && role !== "manager" && role !== "admin") {
    return NextResponse.redirect(new URL("/shop", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
