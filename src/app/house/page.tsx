import Link from "next/link";
import HousePlanner from "./HousePlanner";

export default function HousePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-6xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">🏠 House planner</h1>
      <p className="text-lg text-muted mb-12 max-w-3xl">
        Ownership essentials, room-by-room decisions, while-away management. State is
        saved locally in your browser for now.
      </p>

      <HousePlanner />
    </main>
  );
}