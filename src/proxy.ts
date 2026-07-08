import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "spain_site_session";

function getSessionSecret(): string {
  const s = process.env.SITE_PASSWORD;
  if (!s || s.length < 8) {
    throw new Error(
      "SITE_PASSWORD env var is missing or too short. Set it in Vercel env vars before deploying."
    );
  }
  return s;
}

// Best-effort pre-compute so a missing env var at build time doesn't crash
// the module. proxy() re-resolves per request via getSessionSecret() so the
// value is always fresh.
function computeCookieValue(): string {
  try {
    return "auth_" + Buffer.from(getSessionSecret()).toString("base64").slice(0, 24);
  } catch {
    return "";
  }
}

export function proxy(req: NextRequest) {
  // Re-resolve per request in case env was injected at runtime.
  const cookieValue = computeCookieValue();
  const hasCookie =
    cookieValue !== "" && req.cookies.get(SESSION_COOKIE)?.value === cookieValue;
  const path = req.nextUrl.pathname;
  const isLogin = path === "/login";

  if (hasCookie) {
    if (isLogin) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (isLogin) return NextResponse.next();

  // If we got here without a valid cookie, send to /login. If the env var is
  // missing entirely, /login will still render but posting the password
  // there will throw — at least we don't silently let traffic through.
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Allow /api/auth (login + logout) through. Everything else needs the cookie.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};
