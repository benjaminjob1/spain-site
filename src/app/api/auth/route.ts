import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "spain_site_session";
const SESSION_SECRET = process.env.SITE_PASSWORD || "los-alcazares-2026";
const COOKIE_VALUE = "auth_" + Buffer.from(SESSION_SECRET).toString("base64").slice(0, 24);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.password === "string" && body.password === SESSION_SECRET) {
    const c = await cookies();
    c.set({
      name: SESSION_COOKIE,
      value: COOKIE_VALUE,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}