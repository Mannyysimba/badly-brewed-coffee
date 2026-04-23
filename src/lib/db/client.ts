import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __bbc_db?: Database.Database };

const sqlite =
  globalForDb.__bbc_db ??
  new Database(process.env.DATABASE_URL || "./data/bbc.db");

if (process.env.NODE_ENV !== "production") globalForDb.__bbc_db = sqlite;

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
