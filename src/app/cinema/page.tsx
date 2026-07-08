import Link from "next/link";
export default function CinemaPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-4xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">🎬 Home cinema / theatre</h1>
      <p className="text-lg text-muted mb-8">
        Build a real home theatre — not just a TV in a dark room. Room layout,
        speaker placement, equipment choices, acoustic treatment.
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Equipment checklist</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Projector (4K, ~3000+ lumens for daytime use)</li>
            <li>Screen (fixed frame or ALR)</li>
            <li>AV receiver (Denon / Yamaha / Marantz, 9-channel for Atmos)</li>
            <li>Speakers: LCR + surrounds + height + sub(s)</li>
            <li>Subwoofer(s) — dual subs preferred for smooth bass</li>
            <li>Acoustic panels (first reflection points, rear wall)</li>
            <li>Bass traps (corners)</li>
            <li>Blackout curtains / dark wall paint</li>
            <li>Seating (theatrical rows)</li>
            <li>Source: 4K Blu-ray / Apple TV 4K / Nvidia Shield</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Layout rules of thumb</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Screen width ≈ 0.5–0.6× viewing distance</li>
            <li>Main listening position ≈ ⅔ of room length (away from rear wall)</li>
            <li>LCR speakers at ear height, toe-in toward MLP</li>
            <li>Subwoofer crawl to find best position</li>
            <li>Side surrounds 90–110° from MLP, height surrounds slightly above</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">To add (interactive tools)</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>Seat-to-screen distance calculator</li>
            <li>Speaker placement diagram (top-down)</li>
            <li>Acoustic panel coverage calculator</li>
            <li>Budget tracker with cost ranges (€)</li>
          </ul>
        </div>
      </section>
    </main>
  );
}