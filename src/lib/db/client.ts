import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { __bbc_db?: Database.Database };

function resolvePath() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // On Vercel (read-only FS except /tmp) fall back to an in-memory DB.
  // Signin etc. won't work there — the landing is the only thing we expect
  // to render. Run locally (`npm run dev`) for the full app.
  if (process.env.VERCEL) return ":memory:";
  return "./data/bbc.db";
}

let _db: DB | null = null;
function ensure(): DB {
  if (_db) return _db;
  const sqlite =
    globalForDb.__bbc_db ?? new Database(resolvePath());
  if (process.env.NODE_ENV !== "production") globalForDb.__bbc_db = sqlite;
  try {
    sqlite.pragma("journal_mode = WAL");
  } catch {
    // :memory: refuses WAL, ignore
  }
  sqlite.pragma("foreign_keys = ON");
  _db = drizzle(sqlite, { schema });
  return _db;
}

// Lazy proxy — importing `db` doesn't open the connection. The file system
// only gets touched when something actually runs a query.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = ensure() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
