import { type NextRequest } from "next/server";
import { state } from "@/lib/kv";

type Item = {
  id: string;
  cat: string;
  item: string;
  notes: string;
  status: "todo" | "doing" | "done" | "blocked";
};

type Room = { id: string; label: string; notes: string };

type HouseState = {
  items: Item[];
  rooms: Room[];
};

export async function GET() {
  if (!(await state.requireAuth())) return state.unauthorized();
  const env = await state.read<HouseState>("house");
  if (!env) {
    return Response.json({ ok: true, version: null, data: null, updatedAt: null });
  }
  return Response.json({ ok: true, version: env.v, data: env.data, updatedAt: env.t });
}

export async function POST(req: NextRequest) {
  if (!(await state.requireAuth())) return state.unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    data?: HouseState;
    version?: number | null;
  };
  if (!body.data) {
    return Response.json({ ok: false, error: "missing data" }, { status: 400 });
  }

  // Light validation — keep it cheap. Reject anything obviously broken.
  if (!Array.isArray(body.data.items) || !Array.isArray(body.data.rooms)) {
    return Response.json({ ok: false, error: "items + rooms arrays required" }, { status: 400 });
  }

  const expected = typeof body.version === "number" ? body.version : null;
  const result = await state.write<HouseState>("house", body.data, expected);

  if (result.ok) {
    return Response.json({
      ok: true,
      version: result.env.v,
      updatedAt: result.env.t,
    });
  }
  // Conflict — return current state so client can show a merge prompt.
  return Response.json(
    {
      ok: false,
      conflict: true,
      version: result.current.v,
      data: result.current.data,
      updatedAt: result.current.t,
    },
    { status: 409 }
  );
}
