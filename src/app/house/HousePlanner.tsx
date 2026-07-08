"use client";

import { useEffect, useState } from "react";

type Status = "todo" | "doing" | "done" | "blocked";

type ChecklistItem = {
  id: string;
  cat: string;
  item: string;
  notes: string;
  status: Status;
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Purchase essentials
  { id: "c1", cat: "Purchase", item: "NIE number (foreigner ID)", notes: "Apply at Spanish consulate in UK, or in Spain at a police station with foreign office. Required for almost everything else.", status: "todo" },
  { id: "c2", cat: "Purchase", item: "Bank account (Spanish)", notes: "Bankinter / CaixaBank / Sabadell all have English-speaking staff. Bring NIE + passport + proof of address.", status: "todo" },
  { id: "c3", cat: "Purchase", item: "Notary appointment", notes: "Required to sign deeds (escritura). Notary fee ~0.5–1% of property value.", status: "todo" },
  { id: "c4", cat: "Purchase", item: "Land registry (Registro de la Propiedad)", notes: "Your notary usually files this within days of signing. Get a nota simple to confirm ownership is clean.", status: "todo" },
  { id: "c5", cat: "Purchase", item: "ITP (property transfer tax)", notes: "Murcia region: 8% for resale properties. Paid at signing or within 30 days.", status: "todo" },
  { id: "c6", cat: "Purchase", item: "Plusvalía (municipal tax)", notes: "Council tax on the land value increase. Town hall handles.", status: "todo" },
  // Utilities (you need these even as a holiday home owner)
  { id: "u1", cat: "Utilities", item: "Electricity contract", notes: "Iberdrola / Endesa / Naturgy. Need NIE + CUPS number (from previous owner or new install).", status: "todo" },
  { id: "u2", cat: "Utilities", item: "Water contract", notes: "Local town hall or Aguas de Murcia.", status: "todo" },
  { id: "u3", cat: "Utilities", item: "Internet / fibre install", notes: "Movistar / Orange / Vodafone. Check fibre availability for the address. Allow 1-4 weeks.", status: "todo" },
  { id: "u4", cat: "Utilities", item: "Gas (if applicable)", notes: "Most Spanish homes use bottled gas (butano) or electric. Check the kitchen setup.", status: "todo" },
  { id: "u5", cat: "Utilities", item: "Council tax (IBI)", notes: "Annual. Billed by town hall. ~€300-800/yr typical.", status: "todo" },
  { id: "u6", cat: "Utilities", item: "Basura (rubbish collection)", notes: "Annual fee on top of IBI.", status: "todo" },
  // Insurance
  { id: "i1", cat: "Insurance", item: "Home insurance (buildings + contents)", notes: "Required if mortgaged. Liberty Seguros / Mapfre / Linea Directa. €200-600/yr.", status: "todo" },
  { id: "i2", cat: "Insurance", item: "Travel insurance for visits", notes: "Annual multi-trip covers medical + cancellation for short stays. UK GHIC gives reciprocal healthcare for visits.", status: "todo" },
  // While away — holiday home specific
  { id: "w1", cat: "While away", item: "Keyholder / property manager", notes: "Local contact who can check on the house, take in deliveries, deal with emergencies. Often 3-4 visits/month included.", status: "todo" },
  { id: "w2", cat: "While away", item: "Alarm system + smart home", notes: "Monitored alarm (Securitas Direct / Prosegur). Smart locks + cameras + leak detectors viewable on phone.", status: "todo" },
  { id: "w3", cat: "While away", item: "Pool maintenance", notes: "Weekly service: chemical balance, cleaning, equipment check. ~€100-150/month in summer, less in winter.", status: "todo" },
  { id: "w4", cat: "While away", item: "Garden maintenance", notes: "Mowing, pruning, irrigation check. Especially important in summer heat.", status: "todo" },
  { id: "w5", cat: "While away", item: "Cleaning between visits", notes: "Pre-arrival clean + laundry change. Standard 3-4 bed holiday home clean ~€80-120.", status: "todo" },
  { id: "w6", cat: "While away", item: "Mail forwarding / collection", notes: "Bank statements, council letters, post. Keyholder can collect weekly.", status: "todo" },
  { id: "w7", cat: "While away", item: "Aircon / heating servicing", notes: "Annual service before summer (aircon) and winter (heating). Filters need cleaning.", status: "todo" },
  { id: "w8", cat: "While away", item: "Water leak detection + shut-off", notes: "Smart water sensors + automatic shutoff valve — holiday homes can flood unnoticed.", status: "todo" },
  // Furnishing & decorating
  { id: "f1", cat: "Furnishing", item: "Inventory what's already there", notes: "What's included in the sale — fitted kitchen, wardrobes, AC units, light fittings. Photograph everything for insurance.", status: "todo" },
  { id: "f2", cat: "Furnishing", item: "Bedroom furniture", notes: "Beds, mattresses, bedside tables, wardrobes (if not fitted), linen. Often UK or Scandinavian suppliers ship to Spain.", status: "todo" },
  { id: "f3", cat: "Furnishing", item: "Living room furniture", notes: "Sofas, coffee table, TV unit, side tables, lamps. Consider outdoor-proof fabrics for terrace pieces.", status: "todo" },
  { id: "f4", cat: "Furnishing", item: "Dining", notes: "Dining table + chairs (indoor and outdoor), bar stools if there's a kitchen island.", status: "todo" },
  { id: "f5", cat: "Furnishing", item: "Kitchenware & small appliances", notes: "Pots, pans, cutlery, glasses (incl. tumblers for terrace), kettle, toaster, coffee machine, blender. Some Spanish kitchens don't include white goods.", status: "todo" },
  { id: "f6", cat: "Furnishing", item: "Towels & bedding", notes: "Beach + bath towels, duvets/pillows suited to summer (lightweight) + winter (heavier). Quality sets last.", status: "todo" },
  { id: "f7", cat: "Furnishing", item: "TV + AV equipment", notes: "Smart TV for general viewing; cinema room has its own dedicated gear on /cinema.", status: "todo" },
  { id: "f8", cat: "Furnishing", item: "Outdoor furniture", notes: "Sun loungers, dining set, parasol, outdoor sofa / chairs. Hot summers mean you want shade + comfort.", status: "todo" },
  { id: "f9", cat: "Furnishing", item: "Decoration & soft furnishings", notes: "Cushions, throws, rugs, artwork, mirrors, plants, candles. Brings the place to life — often the difference between 'rental' and 'home'.", status: "todo" },
  { id: "f10", cat: "Furnishing", item: "Storage solutions", notes: "Under-bed boxes, hall tree, shoe rack, hall closet. Holiday homes often lack storage; bring more than you think.", status: "todo" },
  { id: "f11", cat: "Furnishing", item: "Cleaning kit + tools", notes: "Vacuum, mop, broom, dustpan, iron, ironing board, basic tool kit, step ladder. Don't rely on the keyholder providing these.", status: "todo" },
  { id: "f12", cat: "Furnishing", item: "Welcome pack", notes: "Tea, coffee, sugar, salt, pepper, oil, loo roll, hand soap, dish soap, bin bags. Means you arrive to a working kitchen/bathroom.", status: "todo" },
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
  // Start with defaults on both server and first client render to avoid a
  // hydration mismatch, then re-hydrate from localStorage after mount.
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [rooms, setRooms] = useState(ROOMS);
  const [activeTab, setActiveTab] = useState<"checklist" | "rooms" | "floor" | "contacts">("checklist");

  // Load saved state on first client render.
  useEffect(() => {
    try {
      const savedItems = window.localStorage.getItem("spain.house.items");
      if (savedItems) {
        const parsed = JSON.parse(savedItems) as ChecklistItem[];
        // Merge: keep any default items that were added since last save, but
        // restore the user's notes + status for items that still exist.
        setItems((current) =>
          current.map((c) => {
            const found = parsed.find((p) => p.id === c.id);
            return found ? { ...c, status: found.status, notes: found.notes } : c;
          })
        );
      }
      const savedRooms = window.localStorage.getItem("spain.house.rooms");
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms) as { id: string; notes: string }[];
        setRooms((current) =>
          current.map((r) => {
            const found = parsed.find((p) => p.id === r.id);
            return found ? { ...r, notes: found.notes } : r;
          })
        );
      }
    } catch {
      // Corrupted localStorage; ignore.
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      window.localStorage.setItem("spain.house.items", JSON.stringify(items));
    } catch {}
  }, [items]);
  useEffect(() => {
    try {
      window.localStorage.setItem("spain.house.rooms", JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

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
          <h2 className="font-semibold">Holiday home ownership progress</h2>
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
          { id: "checklist" as const, label: "✅ Checklist" },
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
          {(["Purchase", "Utilities", "Insurance", "While away", "Furnishing"] as const).map((cat) => {
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