import Link from "next/link";
export default function LosAlcazaresPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-4xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">📍 Los Alcázares</h1>
      <p className="text-lg text-muted mb-8">
        Small town on the Mar Menor, Murcia region. Famous for calm warm
        saltwater lagoon, sailing, golf, and being a quieter alternative to the
        busier Costa Blanca resorts.
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Beaches</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Playa de Los Alcázares — main town beach, calm water</li>
            <li>Playa de Las Salinas — salt lake views</li>
            <li>Playa del Carmolí — quieter, west end</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Restaurants</h2>
          <p className="text-muted">To fill in once we&apos;ve been a few times.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Golf nearby</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>La Serena Golf</li>
            <li>Roda Golf &amp; Beach Resort</li>
            <li>Mar Menor Golf Resort</li>
            <li>Lo Romero Golf (a bit further)</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Practical</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Murcia-Corvera airport: ~30 min</li>
            <li>Alicante airport: ~1 hr</li>
            <li>Cartagena: ~25 min</li>
            <li>Murcia city: ~45 min</li>
          </ul>
        </div>
      </section>
    </main>
  );
}