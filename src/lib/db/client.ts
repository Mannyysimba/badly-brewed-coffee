import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { __bbc_db?: Database.Database };

// On Vercel the function bundle is read-only, but /tmp is writable per
// lambda instance. We copy the seeded DB shipped with the deploy into /tmp
// on the first request, then open that writable copy. Data doesn't persist
// across cold starts but the demo walks fine — all four test users stay
// signed-in-able and writes work for the duration of the instance.
function resolvePath() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  if (process.env.VERCEL) {
    const tmpPath = "/tmp/bbc.db";
    if (!fs.existsSync(tmpPath)) {
      const seedPath = path.join(process.cwd(), "data", "bbc.db");
      if (fs.existsSync(seedPath)) {
        try {
          fs.copyFileSync(seedPath, tmpPath);
        } catch (err) {
          console.error("[db] failed to seed /tmp from bundle:", err);
        }
      }
    }
    return tmpPath;
  }

  return "./data/bbc.db";
}

let _db: DB | null = null;
function ensure(): DB {
  if (_db) return _db;
  const sqlite = globalForDb.__bbc_db ?? new Database(resolvePath());
  if (process.env.NODE_ENV !== "production") globalForDb.__bbc_db = sqlite;
  try {
    sqlite.pragma("journal_mode = WAL");
  } catch {
    // :memory: or read-only mounts reject WAL — ignore
  }
  sqlite.pragma("foreign_keys = ON");
  _db = drizzle(sqlite, { schema });
  return _db;
}

// Lazy proxy — importing `db` doesn't open the connection. The filesystem
// only gets touched when a query actually runs.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = ensure() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(real)
      : value;
  },
});

export { schema };
