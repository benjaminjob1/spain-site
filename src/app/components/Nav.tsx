"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/los-alcazares", label: "Los Alcázares" },
  { href: "/spain-wide", label: "Spain" },
  { href: "/house", label: "House" },
  { href: "/cinema", label: "Cinema" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  // Show on every page except the login page. Login has its own centered card.
  if (pathname === "/login") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // Even if the call fails, the cookie might still be cleared server-side
      // (or already cleared). Force a redirect regardless.
    }
    // Hard reload so the proxy runs again with the cleared cookie and sends
    // us to /login.
    window.location.href = "/login";
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2 sm:gap-4">
        <Link
          href="/"
          className="font-bold text-lg mr-2 sm:mr-4 flex items-center gap-1.5 shrink-0"
        >
          <span aria-hidden>🇪🇸</span>
          <span className="hidden sm:inline">spain.benjob.me</span>
          <span className="sm:hidden">spain</span>
        </Link>
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {LINKS.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                isActive(l.href)
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="ml-2 shrink-0 px-3 py-1.5 rounded-md text-sm border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          title="Log out (clears the password cookie)"
        >
          {loggingOut ? "…" : "Log out"}
        </button>
      </div>
    </nav>
  );
}
