import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "spain_site_session";

// Fail loudly if SITE_PASSWORD is not set, rather than falling back to a
// hardcoded default. A hardcoded fallback is exactly the kind of thing that
// bites you in a misconfigured deploy. We resolve lazily at request time so
// the module can still be evaluated at build (when SITE_PASSWORD isn't in
// scope).
function getSessionSecret(): string {
  const s = process.env.SITE_PASSWORD;
  if (!s || s.length < 8) {
    throw new Error(
      "SITE_PASSWORD env var is missing or too short. Set it in Vercel env vars before deploying."
    );
  }
  return s;
}

function getCookieValue(): string {
  return "auth_" + Buffer.from(getSessionSecret()).toString("base64").slice(0, 24);
}

// Tiny in-memory rate limiter: 5 attempts per 15 min per IP.
// Good enough for a family site; not bulletproof but stops casual brute force.
const attempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRate(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (rec.count >= RATE_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  rec.count += 1;
  return { ok: true };
}

function clientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; fall back to x-real-ip. We use the first IP in
  // the list (the original client).
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function cookieOpts() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    // Only set "secure" in production. Without this, the cookie doesn't get
    // set on http://localhost during dev, which is annoying.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rate = checkRate(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.password === "string" && body.password === getSessionSecret()) {
    const c = await cookies();
    c.set({ ...cookieOpts(), value: getCookieValue() });
    // Reset rate counter on success so user doesn't get locked out after typing
    // wrong + right.
    attempts.delete(ip);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function DELETE() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
