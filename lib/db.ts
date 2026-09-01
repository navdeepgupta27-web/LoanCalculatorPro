import "server-only";

import { createClient, type Client, type InArgs } from "@libsql/client";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { SCHEMA_STATEMENTS } from "./schema";

/**
 * SQLite access layer.
 *
 * Local development writes to a plain `.db` file on disk. Production on a
 * serverless host points `DATABASE_URL` at Turso (hosted libSQL, wire- and
 * SQL-compatible with SQLite) because serverless filesystems are read-only and
 * ephemeral — a local file would silently lose every write between invocations.
 * The query code below is identical either way.
 */

const DEFAULT_LOCAL_URL = "file:./data/loancalculatorpro.db";

declare global {
  // Reused across hot reloads in dev so we do not leak connections.
  var __lcpDb: { client: Client; ready: Promise<void> } | undefined;
}

function resolveUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || DEFAULT_LOCAL_URL;
  if (!url.startsWith("file:")) return url;

  // A file-backed database is a development convenience only; production runs
  // against Turso over the network. Resolving the path at build time would make
  // the bundler trace the entire project into the serverless output, so this
  // branch is confined to dev.
  if (process.env.NODE_ENV === "production") return url;

  const filePath = resolve(/* turbopackIgnore: true */ process.cwd(), url.slice("file:".length));
  try {
    mkdirSync(dirname(filePath), { recursive: true });
  } catch {
    /* directory already exists, or the FS is read-only — surfaced on first query */
  }
  return `file:${filePath}`;
}

function build(): { client: Client; ready: Promise<void> } {
  const url = resolveUrl();
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim() || undefined;

  if (process.env.NODE_ENV === "production" && url.startsWith("file:") && process.env.VERCEL) {
    console.warn(
      "[db] DATABASE_URL is a local file but the app is running on Vercel. " +
        "Writes will not persist — point DATABASE_URL at a Turso database.",
    );
  }

  const client = createClient({ url, authToken });
  const ready = (async () => {
    for (const stmt of SCHEMA_STATEMENTS) {
      await client.execute(stmt);
    }
  })();

  return { client, ready };
}

function handle() {
  if (!globalThis.__lcpDb) globalThis.__lcpDb = build();
  return globalThis.__lcpDb;
}

/** Returns a client with the schema guaranteed to exist. */
export async function db(): Promise<Client> {
  const h = handle();
  await h.ready;
  return h.client;
}

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

export async function all<T = Row>(sql: string, args: InArgs = []): Promise<T[]> {
  const client = await db();
  const rs = await client.execute({ sql, args });
  return rs.rows as unknown as T[];
}

export async function one<T = Row>(sql: string, args: InArgs = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InArgs = []) {
  const client = await db();
  return client.execute({ sql, args });
}

/** Single scalar (COUNT, SUM, …) with a fallback when the table is empty. */
export async function scalar<T = number>(sql: string, args: InArgs = [], fallback?: T): Promise<T> {
  const row = await one<Row>(sql, args);
  if (!row) return fallback as T;
  const first = Object.values(row)[0];
  return (first ?? fallback) as T;
}

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

/**
 * One-way hash of a visitor IP. We never store raw addresses — the hash is
 * only used to rate-limit logins and to count unique visitors, and it cannot
 * be reversed back to an address.
 */
export function hashIp(ip: string | null | undefined): string {
  const salt = process.env.IP_SALT || "loancalculatorpro-default-salt";
  return createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex").slice(0, 32);
}

/** Best-effort client IP from the proxy headers Vercel and Nginx set. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "unknown";
}
