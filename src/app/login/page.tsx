"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Wrong password");
      setPw("");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">🇪🇸 spain.benjob.me</h1>
        <p className="text-sm text-muted text-center mb-6">Private — password required</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-lg border bg-surface focus:border-accent outline-none text-center"
        />
        {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full mt-3 px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
        >
          Enter
        </button>
      </form>
    </main>
  );
}