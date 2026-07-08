import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="mb-16">
        <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-3">
          🇪🇸 Spain
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Los Alcázares <span className="gradient-text">&amp; beyond</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed">
          Password required. Family + household only. Trips, decisions, layouts, and a home theatre that actually sounds right.
        </p>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <Link
          href="/los-alcazares"
          className="block p-6 rounded-2xl border bg-surface hover:border-accent transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">📍 Los Alcázares</h2>
          <p className="text-muted">
            Local guide: restaurants, beaches, shops, golf, the Mar Menor.
          </p>
        </Link>

        <Link
          href="/spain-wide"
          className="block p-6 rounded-2xl border bg-surface hover:border-accent transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">🗺️ Day trips &amp; wider Spain</h2>
          <p className="text-muted">
            Cartagena, Murcia, Alicante, Granada, Córdoba, Sevilla.
          </p>
        </Link>

        <Link
          href="/house"
          className="block p-6 rounded-2xl border bg-surface hover:border-accent transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">🏠 House planner</h2>
          <p className="text-muted">
            Ownership essentials, room-by-room decisions, while-away
            management.
          </p>
        </Link>

        <Link
          href="/cinema"
          className="block p-6 rounded-2xl border bg-surface hover:border-accent transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">🎬 Home cinema / theatre</h2>
          <p className="text-muted">
            Equipment checklist, room layout, speaker placement, acoustic
            treatment.
          </p>
        </Link>
      </section>

      {/* Status */}
      <section className="border-t pt-8 text-sm text-muted">
        <p>Private — for household use only.</p>
      </section>
    </main>
  );
}