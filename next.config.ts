import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
  // Ship the seeded SQLite DB file into every serverless function bundle
  // so /tmp can seed itself on cold start (see src/lib/db/client.ts).
  outputFileTracingIncludes: {
    "/**/*": ["./data/bbc.db"],
  },
};

export default nextConfig;
