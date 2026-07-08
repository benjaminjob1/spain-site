import Link from "next/link";
export default function SpainWidePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-4xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">🗺️ Day trips &amp; wider Spain</h1>
      <p className="text-lg text-muted mb-8">
        Los Alcázares is well placed for trips. Quick ones for the weekend,
        longer ones for school holidays.
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Close (under 1.5 hr)</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Cartagena — Roman theatre, port, naval history</li>
            <li>Murcia — cathedral, old town, river</li>
            <li>Caravaca de la Cruz — religious town, castles</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Half-day / full-day</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Alicante — castle, beach, old town</li>
            <li>Granada — Alhambra (book ahead)</li>
            <li>Córdoba — Mezquita</li>
            <li>Sevilla — Alcázar, cathedral, plaza</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Weekend+</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Madrid — 4 hr drive or AVE from Murcia</li>
            <li>Barcelona — 6 hr or AVE via Valencia</li>
            <li>Valencia — 2.5 hr, city of arts &amp; paella</li>
            <li>Málaga / Costa del Sol — 4 hr</li>
          </ul>
        </div>
      </section>
    </main>
  );
}