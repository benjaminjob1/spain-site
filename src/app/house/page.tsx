import Link from "next/link";
export default function HousePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-4xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">🏠 House planner</h1>
      <p className="text-lg text-muted mb-8">
        Decisions, floor plan, room-by-room. To be expanded.
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Pre-move checklist</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>NIE (foreign ID number)</li>
            <li>Bank account</li>
            <li>Healthcare registration</li>
            <li>School enrolment (if applicable)</li>
            <li>Internet installation (Movistar / Vodafone / Orange)</li>
            <li>Electricity contract (Iberdrola / Endesa)</li>
            <li>Water contract</li>
            <li>Home insurance</li>
            <li>Vehicle import / registration (if bringing a UK car)</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Floor plan</h2>
          <p className="text-muted">Upload sketch / photos when available.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-3">Rooms &amp; decisions</h2>
          <p className="text-muted">Room-by-room todo tracker (TBD).</p>
        </div>
      </section>
    </main>
  );
}