"use client";

import { useState } from "react";

type Status = "todo" | "doing" | "done" | "blocked";

type ChecklistItem = {
  id: string;
  cat: string;
  item: string;
  notes: string;
  status: Status;
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Pre-deposit / during purchase
  { id: "c1", cat: "Purchase", item: "NIE number (foreigner ID)", notes: "Apply at Spanish consulate in UK, or in Spain at a police station with foreign office. Required for everything else.", status: "todo" },
  { id: "c2", cat: "Purchase", item: "Bank account (Spanish)", notes: "Bankinter / CaixaBank / Sabadell all have English-speaking staff. Bring NIE + passport + proof of address.", status: "todo" },
  { id: "c3", cat: "Purchase", item: "Notary appointment", notes: "Required to sign deeds (escritura). Notary fee ~0.5–1% of property value.", status: "todo" },
  { id: "c4", cat: "Purchase", item: "Land registry (Registro de la Propiedad)", notes: "Your notary usually files this within days of signing. Get a nota simple to confirm ownership is clean.", status: "todo" },
  { id: "c5", cat: "Purchase", item: "ITP (property transfer tax)", notes: "Murcia region: 8% for resale properties. Paid at signing or within 30 days.", status: "todo" },
  { id: "c6", cat: "Purchase", item: "Plusvalía (municipal tax)", notes: "Council tax on the land value increase. Town hall handles.", status: "todo" },
  // Ongoing / utilities
  { id: "u1", cat: "Utilities", item: "Electricity contract", notes: "Iberdrola / Endesa / Naturgy. Need NIE + CUPS number (from previous owner or new install).", status: "todo" },
  { id: "u2", cat: "Utilities", item: "Water contract", notes: "Local town hall or Aguas de Murcia. CUPS-like number.", status: "todo" },
  { id: "u3", cat: "Utilities", item: "Internet / fibre install", notes: "Movistar / Orange / Vodafone. Check fibre availability for the address. Allow 1-4 weeks.", status: "todo" },
  { id: "u4", cat: "Utilities", item: "Gas (if applicable)", notes: "Most Spanish homes use bottled gas (butano) or electric. Check the kitchen setup.", status: "todo" },
  { id: "u5", cat: "Utilities", item: "Council tax (IBI)", notes: "Annual. Billed by town hall. ~€300-800/yr typical.", status: "todo" },
  { id: "u6", cat: "Utilities", item: "Basura (rubbish collection)", notes: "Annual fee on top of IBI.", status: "todo" },
  // Insurance
  { id: "i1", cat: "Insurance", item: "Home insurance (buildings + contents)", notes: "Required if mortgaged. Liberty Seguros / Mapfre / Linea Directa. €200-600/yr.", status: "todo" },
  { id: "i2", cat: "Insurance", item: "Health insurance / public healthcare", notes: "EU residents can access public system after S1 form (post-Brexit UK). Private top-up common: Sanitas / Adeslas / DKV.", status: "todo" },
  { id: "i3", cat: "Insurance", item: "Car insurance (if bringing UK car)", notes: "OR re-register car as Spanish (import taxes + ITV). Many UK owners keep UK plates with temporary import.", status: "todo" },
  // Move / settle
  { id: "m1", cat: "Move-in", item: "Empadronamiento (register at town hall)", notes: "Required for many things. Take NIE + deed + utility bill.", status: "todo" },
  { id: "m2", cat: "Move-in", item: "Driving licence exchange", notes: "UK licence valid in Spain for residents, but after 2 yrs need to swap. NO test required before Brexit rules changed — check current status.", status: "todo" },
  { id: "m3", cat: "Move-in", item: "School enrolment (if applicable)", notes: "Public schools free, but catchment zones. Apply via consejería de educación.", status: "todo" },
  { id: "m4", cat: "Move-in", item: "Vehicle ITV / ITV appointment", notes: "Annual technical inspection (MOT equivalent). ITV stations by region.", status: "todo" },
  { id: "m5", cat: "Move-in", item: "Spanish phone number", notes: "Movistar / Orange / Vodafone / O2. €10-20/mo for pay-as-you-go.", status: "todo" },
];

const ROOMS = [
  { id: "lounge", label: "Lounge / living", notes: "" },
  { id: "kitchen", label: "Kitchen", notes: "" },
  { id: "master", label: "Master bedroom", notes: "" },
  { id: "bed2", label: "Bedroom 2", notes: "" },
  { id: "bed3", label: "Bedroom 3", notes: "" },
  { id: "bath1", label: "Bathroom 1 (main)", notes: "" },
  { id: "bath2", label: "Bathroom 2 (ensuite)", notes: "" },
  { id: "terrace", label: "Terrace / outdoor", notes: "" },
  { id: "garden", label: "Garden / pool area", notes: "" },
  { id: "cinema", label: "Cinema / theatre room", notes: "" },
  { id: "office", label: "Office / study", notes: "" },
  { id: "garage", label: "Garage", notes: "" },
];

const STATUS_COLORS: Record<Status, string> = {
  todo: "bg-gray-200 text-gray-700",
  doing: "bg-yellow-200 text-yellow-900",
  done: "bg-green-200 text-green-900",
  blocked: "bg-red-200 text-red-900",
};

const STATUS_LABELS: Record<Status, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
  blocked: "Blocked",
};

export default function HousePlanner() {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [rooms, setRooms] = useState(ROOMS);
  const [activeTab, setActiveTab] = useState<"checklist" | "rooms" | "floor" | "contacts">("checklist");

  const setStatus = (id: string, status: Status) => {
    setItems(items.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  const setNotes = (id: string, notes: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, notes } : it)));
  };

  const setRoomNotes = (id: string, notes: string) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, notes } : r)));
  };

  const counts = {
    todo: items.filter((i) => i.status === "todo").length,
    doing: items.filter((i) => i.status === "doing").length,
    done: items.filter((i) => i.status === "done").length,
    blocked: items.filter((i) => i.status === "blocked").length,
  };
  const pct = Math.round(((items.length - counts.todo) / items.length) * 100);

  return (
    <div className="space-y-8">
      {/* Progress */}
      <section className="rounded-xl border bg-surface p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Spain house move-in progress</h2>
          <span className="text-accent font-bold text-xl">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="bg-accent h-3 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-3 text-xs flex-wrap">
          <span className="px-2 py-1 rounded bg-gray-200">{counts.todo} to do</span>
          <span className="px-2 py-1 rounded bg-yellow-200">{counts.doing} in progress</span>
          <span className="px-2 py-1 rounded bg-green-200">{counts.done} done</span>
          <span className="px-2 py-1 rounded bg-red-200">{counts.blocked} blocked</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: "checklist" as const, label: "✅ Pre-move checklist" },
          { id: "rooms" as const, label: "🏠 Rooms & decisions" },
          { id: "floor" as const, label: "📐 Floor plan" },
          { id: "contacts" as const, label: "👥 Contacts" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Checklist */}
      {activeTab === "checklist" && (
        <section>
          <p className="text-sm text-muted mb-4">
            Click a status badge to cycle through (todo → doing → done → blocked). Edit notes inline.
          </p>
          {(["Purchase", "Utilities", "Insurance", "Move-in"] as const).map((cat) => {
            const catItems = items.filter((i) => i.cat === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{cat}</h3>
                <div className="space-y-2">
                  {catItems.map((it) => (
                    <div key={it.id} className="rounded-xl border bg-surface p-3 flex flex-col md:flex-row md:items-start gap-3">
                      <button
                        onClick={() => {
                          const order: Status[] = ["todo", "doing", "done", "blocked"];
                          const next = order[(order.indexOf(it.status) + 1) % order.length];
                          setStatus(it.id, next);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[it.status]}`}
                      >
                        {STATUS_LABELS[it.status]}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{it.item}</div>
                        <textarea
                          value={it.notes}
                          onChange={(e) => setNotes(it.id, e.target.value)}
                          rows={2}
                          className="w-full mt-1 text-sm text-muted bg-transparent border-0 focus:outline-none focus:bg-background rounded p-1"
                          placeholder="Notes..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Rooms */}
      {activeTab === "rooms" && (
        <section>
          <p className="text-sm text-muted mb-4">
            Room-by-room decisions: layout, furniture, purpose. Edit notes inline.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((r) => (
              <div key={r.id} className="rounded-xl border bg-surface p-4">
                <h3 className="font-semibold mb-2">{r.label}</h3>
                <textarea
                  value={r.notes}
                  onChange={(e) => setRoomNotes(r.id, e.target.value)}
                  rows={3}
                  className="w-full text-sm bg-transparent border rounded p-2 focus:outline-none focus:border-accent"
                  placeholder={`What's this room for? Key decisions, layout, furniture...`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floor plan */}
      {activeTab === "floor" && (
        <section>
          <p className="text-sm text-muted mb-4">
            Floor plan upload area. Drag a sketch, photo of plans, or screenshot into the box below.
            Future: parse + render interactively.
          </p>
          <div className="rounded-xl border-2 border-dashed bg-surface p-12 text-center">
            <p className="text-muted mb-2">📐 Drop a floor plan image here</p>
            <p className="text-xs text-muted">
              Or paste a URL, or describe the layout in text. Will be saved locally for now; cloud
              sync coming once backend is wired.
            </p>
            <input type="file" accept="image/*" className="mt-4 text-sm" />
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Quick text description</h3>
            <textarea
              rows={6}
              className="w-full rounded-lg border bg-surface p-3 text-sm focus:outline-none focus:border-accent"
              placeholder="E.g. 3-bed single storey. Master with ensuite on south side. Open-plan kitchen/lounge facing pool. Separate cinema room on north side with no windows..."
            />
          </div>
        </section>
      )}

      {/* Contacts */}
      {activeTab === "contacts" && (
        <section>
          <p className="text-sm text-muted mb-4">
            Builder, notary, estate agent, lawyer, insurance broker, internet installer, cleaner, gardener.
            Add as we go.
          </p>
          <div className="rounded-xl border bg-surface p-6 text-center">
            <p className="text-muted mb-3">No contacts saved yet.</p>
            <p className="text-xs text-muted">
              Tell me the names + roles of anyone involved (builder, agent, etc.) and I&apos;ll add them
              here with phone, email, language, notes.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}