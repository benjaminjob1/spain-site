import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "spain_site_session";
const SESSION_SECRET = process.env.SITE_PASSWORD || "los-alcazares-2026";
const COOKIE_VALUE = "auth_" + Buffer.from(SESSION_SECRET).toString("base64").slice(0, 24);

export function proxy(req: NextRequest) {
  const hasCookie = req.cookies.get(SESSION_COOKIE)?.value === COOKIE_VALUE;
  const isLogin = req.nextUrl.pathname === "/login";

  if (hasCookie) {
    if (isLogin) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (isLogin) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};