"use client";

import { useMemo, useState } from "react";
import Cinema3D from "./Cinema3D";

type Calc = {
  roomLength: number; // metres
  roomWidth: number;
  roomHeight: number;
  screenDiag: number; // inches (16:9)
  viewingDistance: number; // metres, override
  numRows: number;
  seatsPerRow: number;
};

const DEFAULT: Calc = {
  roomLength: 6,
  roomWidth: 4,
  roomHeight: 2.7,
  screenDiag: 120,
  viewingDistance: 4,
  numRows: 2,
  seatsPerRow: 4,
};

// Recommended viewing distance = 1.5–2.5× screen width for cinema feel,
// 1.0–1.5× screen width for immersive / THX.
function recommendedDistances(screenDiag: number) {
  const screenWidth = (screenDiag * 0.0254 * 16) / Math.sqrt(16 * 16 + 9 * 9); // 16:9 width in m
  return {
    immersive: screenWidth * 1.25,
    cinema: screenWidth * 1.75,
    thx: screenWidth * 2.5,
    screenWidth,
  };
}

const SPEAKER_POSITIONS = [
  // returns angle (deg from MLP, 0 = front centre) and distance (m, default 1)
  { id: "L", label: "Front Left", angle: -30, distance: 1 },
  { id: "C", label: "Centre", angle: 0, distance: 1 },
  { id: "R", label: "Front Right", angle: 30, distance: 1 },
  { id: "LFE", label: "Subwoofer", angle: 0, distance: 1, sub: true },
  { id: "SL", label: "Side Left", angle: -90, distance: 1 },
  { id: "SR", label: "Side Right", angle: 90, distance: 1 },
  { id: "BL", label: "Back Left", angle: -150, distance: 1 },
  { id: "BR", label: "Back Right", angle: 150, distance: 1 },
];

const EQUIPMENT = [
  { cat: "Display", item: "4K Projector", low: 1500, mid: 3000, high: 8000, notes: "3000+ lumens for daytime use" },
  { cat: "Display", item: "ALR Fixed Screen", low: 500, mid: 1200, high: 3000, notes: "Ambient-light rejecting" },
  { cat: "Display", item: "Spare Lamp", low: 150, mid: 250, high: 400, notes: "Lamps dim over time" },
  { cat: "AVR", item: "9-ch AV Receiver", low: 800, mid: 1500, high: 3500, notes: "Denon / Yamaha / Marantz, Atmos" },
  { cat: "Speakers", item: "LCR × 3 (front)", low: 600, mid: 1500, high: 4000, notes: "Same model across LCR for timbre match" },
  { cat: "Speakers", item: "Surrounds × 4", low: 400, mid: 1000, high: 2500, notes: "Side + back at ear height" },
  { cat: "Speakers", item: "Height × 4 (Atmos)", low: 400, mid: 1000, high: 2500, notes: "In-ceiling or upfiring" },
  { cat: "Sub", item: "Subwoofer × 2", low: 800, mid: 1800, high: 4000, notes: "Dual subs for smooth bass" },
  { cat: "Source", item: "Apple TV 4K / Shield", low: 200, mid: 250, high: 250, notes: "Streaming + lossless audio" },
  { cat: "Source", item: "4K Blu-ray player", low: 200, mid: 400, high: 800, notes: "Reference audio + discs" },
  { cat: "Acoustic", item: "First-reflection panels × 6", low: 200, mid: 600, high: 1500, notes: "L/R walls + ceiling + rear" },
  { cat: "Acoustic", item: "Bass traps × 4", low: 150, mid: 400, high: 1000, notes: "Corners of room" },
  { cat: "Acoustic", item: "Rear wall diffusion", low: 200, mid: 500, high: 1200, notes: "Behind MLP" },
  { cat: "Room", item: "Blackout curtains", low: 150, mid: 400, high: 1000, notes: "If no window" },
  { cat: "Room", item: "Dark wall paint / velvet", low: 100, mid: 300, high: 800, notes: "Reduces reflections" },
  { cat: "Seating", item: "Theatre seats (per seat)", low: 400, mid: 800, high: 1800, notes: "Rows of recliners" },
  { cat: "Power", item: "Power conditioner / UPS", low: 200, mid: 500, high: 1500, notes: "Clean mains + surge" },
  { cat: "Cabling", item: "Speaker wire + HDMI + interconnects", low: 200, mid: 500, high: 1500, notes: "Don't skimp on HDMI (Ultra Certified)" },
];

function eur(n: number) {
  return "€" + Math.round(n).toLocaleString("en-US");
}

function RoomDiagram({ calc }: { calc: Calc }) {
  const { screenWidth } = recommendedDistances(calc.screenDiag);
  // SVG layout: top-down room view, scale 1m = 50px
  const scale = 50;
  const W = calc.roomWidth * scale;
  const L = calc.roomLength * scale;
  const cx = W / 2;
  const cy = L / 2;
  // MLP (main listening position) at ~2/3 of room length from screen
  const mlpDist = (calc.roomLength * 2) / 3;
  const mlpX = cx;
  const mlpY = mlpDist * scale;
  // Screen position at front of room (top of plan view)
  const screenH = (screenWidth * scale * 9) / 16;
  const screenW = screenWidth * scale;
  const screenX = cx - screenW / 2;
  const screenY = 0.3 * scale; // a bit from wall

  // Subwoofer pair - symmetric on front wall
  const subs = [
    { x: cx - screenW * 0.4, y: screenY + screenH + 0.1 * scale },
    { x: cx + screenW * 0.4, y: screenY + screenH + 0.1 * scale },
  ];

  // Speaker positions - 7.1.4 Atmos layout
  const radius = mlpDist * scale * 0.6;
  const speakers = SPEAKER_POSITIONS.map((sp) => {
    const rad = (sp.angle * Math.PI) / 180;
    return {
      ...sp,
      x: mlpX + radius * Math.sin(rad),
      y: mlpY - radius * Math.cos(rad),
    };
  });

  return (
    <svg viewBox={`0 0 ${W + 80} ${L + 40}`} className="w-full h-auto border rounded-xl bg-surface">
      {/* Room outline */}
      <rect x="40" y="20" width={W} height={L} fill="#fafafa" stroke="#c8451f" strokeWidth="2" />
      {/* Screen */}
      <rect
        x={40 + screenX}
        y={20 + screenY}
        width={screenW}
        height={screenH}
        fill="#1f1a17"
        stroke="#c8451f"
        strokeWidth="1"
      />
      <text x={40 + cx} y={20 + screenY - 5} textAnchor="middle" fontSize="11" fill="#1f1a17">
        Screen {calc.screenDiag}"
      </text>
      {/* MLP */}
      <circle cx={40 + mlpX} cy={20 + mlpY} r="6" fill="#d4a843" />
      <text x={40 + mlpX + 10} y={20 + mlpY + 4} fontSize="11" fill="#1f1a17">
        MLP
      </text>
      {/* Speakers */}
      {speakers.map((sp) => (
        <g key={sp.id}>
          <circle cx={40 + sp.x} cy={20 + sp.y} r="5" fill={sp.sub ? "#6b5d52" : "#c8451f"} />
          <text x={40 + sp.x + 8} y={20 + sp.y + 4} fontSize="10" fill="#1f1a17">
            {sp.id}
          </text>
        </g>
      ))}
      {/* Subs */}
      {subs.map((s, i) => (
        <g key={`sub${i}`}>
          <rect x={40 + s.x - 5} y={20 + s.y - 5} width="10" height="10" fill="#6b5d52" />
        </g>
      ))}
      {/* Speaker angle guide (front L/R angle) */}
      <line
        x1={40 + mlpX}
        y1={20 + mlpY}
        x2={40 + speakers.find((s) => s.id === "L")!.x}
        y2={20 + speakers.find((s) => s.id === "L")!.y}
        stroke="#d4a843"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      <line
        x1={40 + mlpX}
        y1={20 + mlpY}
        x2={40 + speakers.find((s) => s.id === "R")!.x}
        y2={20 + speakers.find((s) => s.id === "R")!.y}
        stroke="#d4a843"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      {/* Dimensions */}
      <text x={40 + cx} y={20 + L + 18} textAnchor="middle" fontSize="11" fill="#6b5d52">
        Room: {calc.roomWidth}m × {calc.roomLength}m × {calc.roomHeight}m
      </text>
    </svg>
  );
}

export default function CinemaPlanner() {
  const [calc, setCalc] = useState<Calc>(DEFAULT);
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");

  const rec = useMemo(() => recommendedDistances(calc.screenDiag), [calc.screenDiag]);

  const totalCost = useMemo(() => {
    const seating = calc.numRows * calc.seatsPerRow * EQUIPMENT.find((e) => e.item.startsWith("Theatre seats"))![budgetTier];
    const eq = EQUIPMENT.filter((e) => !e.item.startsWith("Theatre seats")).reduce(
      (sum, e) => sum + e[budgetTier],
      0
    );
    return { eq, seating, total: eq + seating };
  }, [budgetTier]);

  const acousticPanelsNeeded = Math.ceil((calc.roomLength * calc.roomHeight + calc.roomWidth * calc.roomHeight) / 8);
  const bassTrapsNeeded = 4; // one per corner

  return (
    <div className="space-y-12">
      {/* === MEDIUM: Distance calculator + speaker diagram === */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">📐 Distance &amp; layout calculator</h2>
        <p className="text-muted mb-6">
          Tweak the room dimensions, screen size, and seating to see recommended viewing distances and a
          7.1.4 speaker layout.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <NumberInput
              label="Room length (m)"
              value={calc.roomLength}
              min={3}
              max={15}
              step={0.5}
              onChange={(v) => setCalc({ ...calc, roomLength: v })}
            />
            <NumberInput
              label="Room width (m)"
              value={calc.roomWidth}
              min={2.5}
              max={12}
              step={0.5}
              onChange={(v) => setCalc({ ...calc, roomWidth: v })}
            />
            <NumberInput
              label="Room height (m)"
              value={calc.roomHeight}
              min={2.2}
              max={5}
              step={0.1}
              onChange={(v) => setCalc({ ...calc, roomHeight: v })}
            />
            <NumberInput
              label='Screen size (inches, 16:9)'
              value={calc.screenDiag}
              min={65}
              max={200}
              step={5}
              onChange={(v) => setCalc({ ...calc, screenDiag: v })}
            />
            <NumberInput
              label="Main listening position (m from screen)"
              value={calc.viewingDistance}
              min={2}
              max={12}
              step={0.1}
              onChange={(v) => setCalc({ ...calc, viewingDistance: v })}
            />
            <NumberInput
              label="Number of seating rows"
              value={calc.numRows}
              min={1}
              max={5}
              step={1}
              onChange={(v) => setCalc({ ...calc, numRows: v })}
            />
            <NumberInput
              label="Seats per row"
              value={calc.seatsPerRow}
              min={1}
              max={12}
              step={1}
              onChange={(v) => setCalc({ ...calc, seatsPerRow: v })}
            />
          </div>

          <div>
            <div className="rounded-xl border bg-surface p-4 mb-4">
              <h3 className="font-semibold mb-2">Recommended viewing distances</h3>
              <p className="text-sm text-muted mb-3">
                For a {calc.screenDiag}" screen (≈ {rec.screenWidth.toFixed(2)} m wide):
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  <b>Immersive:</b> {rec.immersive.toFixed(2)} m (closest, max involvement)
                </li>
                <li>
                  <b>Cinema:</b> {rec.cinema.toFixed(2)} m (classic sweet spot)
                </li>
                <li>
                  <b>THX:</b> {rec.thx.toFixed(2)} m (back of recommended range)
                </li>
              </ul>
              <p className="text-xs text-muted mt-3">
                Your MLP at {calc.viewingDistance.toFixed(2)} m is{" "}
                <b>
                  {calc.viewingDistance < rec.immersive
                    ? "very close — too immersive for some viewers"
                    : calc.viewingDistance > rec.thx
                    ? "very far — feels like the back row"
                    : "in the recommended range"}
                </b>
                .
              </p>
            </div>

            <div className="rounded-xl border bg-surface p-4">
              <h3 className="font-semibold mb-2">Acoustic treatment guide</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <b>First-reflection panels:</b> ~{acousticPanelsNeeded} panels (2" thick, fabric-wrapped)
                </li>
                <li>
                  <b>Bass traps:</b> {bassTrapsNeeded} (one per corner, 4" thick)
                </li>
                <li>
                  <b>Diffusion:</b> on rear wall behind MLP
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-3">Top-down room layout (7.1.4 Atmos)</h3>
          <RoomDiagram calc={calc} />
          <p className="text-xs text-muted mt-2">
            Layout assumes MLP at ⅔ room length from screen, ±30° L/R, ±90° sides, ±150° backs. 4 height
            channels overhead not shown in plan view.
          </p>
        </div>
      </section>

      {/* === LIGHT: Equipment checklist with budget === */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">🛒 Equipment &amp; budget</h2>
        <p className="text-muted mb-6">Estimated costs in EUR, including installation where typical.</p>

        <div className="flex gap-2 mb-4">
          {(["low", "mid", "high"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBudgetTier(t)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                budgetTier === t ? "bg-accent text-white border-accent" : "bg-surface hover:border-accent"
              }`}
            >
              {t === "low" ? "💰 Budget" : t === "mid" ? "🎯 Mid-range" : "💎 Premium"}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b">
              <tr>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Notes</th>
                <th className="text-right p-3">Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {EQUIPMENT.map((e, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3 text-muted">{e.cat}</td>
                  <td className="p-3">{e.item}</td>
                  <td className="p-3 text-muted text-xs">{e.notes}</td>
                  <td className="p-3 text-right font-medium">{eur(e[budgetTier])}</td>
                </tr>
              ))}
              <tr className="border-b last:border-0">
                <td className="p-3 text-muted">Seating</td>
                <td className="p-3">Theatre seats</td>
                <td className="p-3 text-muted text-xs">
                  {calc.numRows} × {calc.seatsPerRow} = {calc.numRows * calc.seatsPerRow} seats
                </td>
                <td className="p-3 text-right font-medium">
                  {eur(
                    calc.numRows *
                      calc.seatsPerRow *
                      EQUIPMENT.find((e) => e.item.startsWith("Theatre seats"))![budgetTier]
                  )}
                </td>
              </tr>
              <tr className="bg-background font-semibold">
                <td className="p-3" colSpan={3}>
                  Total ({budgetTier})
                </td>
                <td className="p-3 text-right text-accent text-base">{eur(totalCost.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          Estimates exclude installation, room construction / finishing, and acoustic isolation. Add 10–25%
          for those.
        </p>
      </section>

      {/* === HEAVY: 3D room designer === */}
      <section>
        <h2 className="text-3xl font-semibold mb-4">🏗️ 3D room designer</h2>
        <p className="text-muted mb-6">
          Drag to rotate, scroll to zoom. Auto-rotates by default — click to stop. Speakers, screen,
          seating rows, MLP marker all rendered. Adjust room dimensions and screen size above to see
          the layout update live.
        </p>
        <Cinema3D calc={calc} />
      </section>
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 w-full px-3 py-2 rounded-lg border bg-surface focus:border-accent outline-none"
      />
    </label>
  );
}