// Shared Redis client + state helpers for the spain-site planners.
//
// All storage uses a single keyset keyed by `kind` (e.g. "house", "cinema").
// State is stored as JSON: { version: number, data: T }.
// - version increments on each successful save
// - client passes the version they think they're updating from
// - server returns 409 Conflict if the client's version is stale
//   so we can show a merge prompt in the UI
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function makeClient(): Redis {
  // Both KV_* (auto-injected by Vercel Marketplace + Upstash) and UPSTASH_*
  // (Upstash-direct) are supported. KV_* is what Vercel sets; we use that.
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "KV env vars missing (KV_REST_API_URL, KV_REST_API_TOKEN). " +
        "Install the Upstash Redis integration on the spain-site Vercel project."
    );
  }
  return new Redis({ url, token });
}

// Lazy singleton — initialised on first call.
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) _redis = makeClient();
  return _redis;
}

// Versioned state envelope.
type Envelope<T> = {
  v: number; // version
  t: number; // server timestamp ms
  data: T;
};

// Read a kind's state. Returns null if nothing's ever been saved.
async function read<T>(kind: string): Promise<Envelope<T> | null> {
  const raw = await getRedis().get<string>(`spain:state:${kind}`);
  if (!raw) return null;
  // Upstash auto-parses JSON when the value looks like JSON.
  return typeof raw === "string" ? (JSON.parse(raw) as Envelope<T>) : (raw as Envelope<T>);
}

// Save with optimistic-concurrency check.
// - if `expectedVersion` is null → unconditional overwrite (first write)
// - if `expectedVersion` matches → OK, version+1, return new envelope
// - if `expectedVersion` doesn't match → 409 Conflict + current envelope
async function write<T>(
  kind: string,
  data: T,
  expectedVersion: number | null
): Promise<{ ok: true; env: Envelope<T> } | { ok: false; current: Envelope<T> }> {
  const current = await read<T>(kind);

  if (expectedVersion !== null) {
    if (!current) {
      // No saved state but client thinks they're updating. Treat as conflict.
      return {
        ok: false,
        current: { v: 0, t: Date.now(), data: data as T },
      };
    }
    if (current.v !== expectedVersion) {
      return { ok: false, current };
    }
  }

  const next: Envelope<T> = {
    v: (current?.v ?? 0) + 1,
    t: Date.now(),
    data,
  };
  await getRedis().set(`spain:state:${kind}`, JSON.stringify(next));
  return { ok: true, env: next };
}

// Cookie-based auth check. The proxy already gates the route, but we defend
// in depth — never trust that the middleware ran (it can be misconfigured,
// skipped on a redirect, etc).
async function requireAuth(): Promise<boolean> {
  const c = await cookies();
  const sessionCookie = c.get("spain_site_session")?.value;
  if (!sessionCookie) return false;
  // Recompute the expected value using SITE_PASSWORD. If the env var is
  // missing, fail closed.
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return false;
  const expected =
    "auth_" + Buffer.from(pw).toString("base64").slice(0, 24);
  return sessionCookie === expected;
}

// Standard error helpers for the route handlers.
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
function serverError(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 500 });
}

export const state = { read, write, requireAuth, unauthorized, serverError };
export type { Envelope };
