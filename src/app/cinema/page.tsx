import Link from "next/link";
import CinemaPlanner from "./CinemaPlanner";

export default function CinemaPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-20 max-w-6xl mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-accent mb-6 inline-block"
      >
        ← back
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">🎬 Home cinema / theatre</h1>
      <p className="text-lg text-muted mb-12 max-w-3xl">
        Interactive planner: distance calculator, speaker layout, equipment budget. Adjust the room
        and screen size — distances and recommendations update live.
      </p>

      <CinemaPlanner />
    </main>
  );
}