import { type NextRequest } from "next/server";
import { state } from "@/lib/kv";

type BudgetTier = "low" | "mid" | "high";

type Calc = {
  roomLength: number;
  roomWidth: number;
  roomHeight: number;
  screenDiag: number;
  viewingDistance: number;
  numRows: number;
  seatsPerRow: number;
};

type CinemaState = {
  calc: Calc;
  budgetTier: BudgetTier;
};

export async function GET() {
  if (!(await state.requireAuth())) return state.unauthorized();
  const env = await state.read<CinemaState>("cinema");
  if (!env) {
    return Response.json({ ok: true, version: null, data: null, updatedAt: null });
  }
  return Response.json({ ok: true, version: env.v, data: env.data, updatedAt: env.t });
}

export async function POST(req: NextRequest) {
  if (!(await state.requireAuth())) return state.unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    data?: CinemaState;
    version?: number | null;
  };
  if (!body.data) {
    return Response.json({ ok: false, error: "missing data" }, { status: 400 });
  }

  const { calc, budgetTier } = body.data;
  if (!calc || typeof calc !== "object" || !["low", "mid", "high"].includes(budgetTier)) {
    return Response.json(
      { ok: false, error: "calc object + budgetTier (low|mid|high) required" },
      { status: 400 }
    );
  }

  const expected = typeof body.version === "number" ? body.version : null;
  const result = await state.write<CinemaState>("cinema", body.data, expected);

  if (result.ok) {
    return Response.json({
      ok: true,
      version: result.env.v,
      updatedAt: result.env.t,
    });
  }
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
