"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// A shared-state hook for a single JSON document.
//
// Strategy:
//  1. On mount: read from `/api/state/<kind>`.
//     - If server has data → use it (server is source of truth).
//     - If not → fall back to localStorage and push it up (so the first
//       device on the site seeds the shared state).
//     - If neither → start with `initial` and treat as version 0.
//  2. On every change to `data` (debounced): POST with the current version.
//     - 200 → version++, continue.
//     - 409 → set conflict state; UI surfaces a prompt.
//  3. Keep a localStorage mirror so the page works offline / paints instantly
//     before the API response comes back.
//
// Race / concurrency:
//  - The hook tracks the version it last successfully wrote or read.
//  - Two simultaneous writers → whoever loses gets a 409 + current state.
//  - The user-facing conflict prompt is opt-in: a `conflict` state is set
//    and the consumer renders it however they want.

type ApiOk<T> = {
  ok: true;
  version: number | null;
  data: T | null;
  updatedAt: number | null;
};
type ApiSaveOk = {
  ok: true;
  version: number;
  updatedAt: number;
};
type ApiSaveConflict<T> = {
  ok: false;
  conflict: true;
  version: number;
  data: T;
  updatedAt: number;
};
type ApiErr = { ok: false; error?: string };

export type Conflict<T> = {
  // The server's current state when our write was rejected.
  theirs: T;
  version: number;
  // Timestamp (server epoch ms).
  updatedAt: number;
};

export type SharedState<T> = {
  data: T;
  // Bumped on every successful local save OR after a hydration from server.
  // The next save attempt uses this version; a 409 means we fell behind.
  version: number | null;
  loading: boolean;
  // Non-null when the last save was rejected as a conflict.
  conflict: Conflict<T> | null;
  // Replace data without triggering a save. Use after resolving a conflict.
  setLocal: (next: T | ((prev: T) => T)) => void;
  // Force-resolve a conflict. `keepMine` overwrites the server with our data;
  // `keepTheirs` discards our local edits and adopts theirs (caller should
  // also pass the merged version through setLocal if they did manual merge).
  resolveConflict: (how: "keepMine" | "keepTheirs" | "merged", merged?: T) => Promise<void>;
};

export function useSharedState<T>(
  kind: "house" | "cinema",
  initial: T
): SharedState<T> {
  const [data, setData] = useState<T>(initial);
  const [version, setVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState<Conflict<T> | null>(null);

  // Mirror in localStorage for fast cold-loads + offline cache.
  const localKey = `spain.${kind}.cache`;

  // Save debounce + last-write tracking.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);
  const pendingData = useRef<T | null>(null);

  // Track whether a change came from a local user edit vs. a hydration/resolve.
  // We only save on user edits.
  const dirty = useRef(false);

  // Initial hydration.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. Seed from localStorage (instant, no network).
      let hadLocal = false;
      try {
        const cached = window.localStorage.getItem(localKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { data: T; version: number | null };
          if (!cancelled) {
            setData(parsed.data);
            setVersion(parsed.version);
            hadLocal = true;
          }
        }
      } catch {}

      // 2. Read from server (authoritative).
      try {
        const res = await fetch(`/api/state/${kind}`, { cache: "no-store" });
        const body = (await res.json()) as ApiOk<T> | ApiErr;
        if (cancelled) return;

        if (res.ok && body.ok) {
          if (body.data !== null) {
            // Server has data — adopt it (this overrides localStorage).
            setData(body.data);
            setVersion(body.version ?? 0);
            try {
              window.localStorage.setItem(
                localKey,
                JSON.stringify({ data: body.data, version: body.version ?? 0 })
              );
            } catch {}
          } else if (!hadLocal) {
            // Neither has any data yet — push our initial up so other devices
            // have something to seed from.
            dirty.current = true;
            // Trigger a save by toggling state via a microtask.
            queueMicrotask(() => {
              saveRef.current?.(initial, 0);
            });
          }
        }
      } catch {
        // Network blip — work from cache. User can still edit; we'll retry on
        // every save.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  // Save function — exposed via ref so the initial-push can call it without
  // waiting for it to stabilise.
  const save = useCallback(
    async (toSave: T, atVersion: number | null) => {
      if (inflight.current) {
        // Queue the latest — coalesce saves.
        pendingData.current = toSave;
        return;
      }
      inflight.current = true;
      try {
        // Try a few times with the latest pending data, so a simultaneous
        // burst doesn't lose the most recent edit.
        for (let attempt = 0; attempt < 5; attempt++) {
          const body = {
            data: pendingData.current ?? toSave,
            version: atVersion,
          };
          try {
            const res = await fetch(`/api/state/${kind}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const j = (await res.json()) as ApiSaveOk | ApiSaveConflict<T> | ApiErr;

            if (res.ok && "version" in j && (j as ApiSaveOk).ok) {
              const ok = j as ApiSaveOk;
              setVersion(ok.version);
              try {
                window.localStorage.setItem(
                  localKey,
                  JSON.stringify({ data: body.data, version: ok.version })
                );
              } catch {}
              pendingData.current = null;
              // If another edit came in while we were saving, retry once.
              if (typeof window !== "undefined" && (window as any).__spainPending) {
                (window as any).__spainPending = false;
                continue;
              }
              return;
            }
            if (res.status === 409 && "conflict" in j && j.conflict) {
              const c = j as ApiSaveConflict<T>;
              setConflict({
                theirs: c.data,
                version: c.version,
                updatedAt: c.updatedAt,
              });
              // Update local to reflect current server state so we don't keep
              // trying to push stale data on the next keystroke.
              setData(c.data);
              setVersion(c.version);
              pendingData.current = null;
              return;
            }
            // Any other error — abort retry loop, keep local edit in memory.
            return;
          } catch {
            return;
          }
        }
      } finally {
        inflight.current = false;
      }
    },
    [kind, localKey]
  );

  // Keep a ref to the latest save so the initial-push can call it.
  const saveRef = useRef(save);
  saveRef.current = save;

  // Debounced save on data change.
  useEffect(() => {
    // Skip the very first run after mount; the hydration handles that.
    if (!dirty.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    pendingData.current = data;
    saveTimer.current = setTimeout(() => {
      save(data, version);
    }, 400); // 400ms after last keystroke is fine for human editing pace.
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, version, save]);

  const setLocal = useCallback((next: T | ((prev: T) => T)) => {
    dirty.current = true;
    setData((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next
    );
  }, []);

  const resolveConflict = useCallback(
    async (how: "keepMine" | "keepTheirs" | "merged", merged?: T) => {
      setConflict(null);
      const finalData: T =
        how === "keepTheirs"
          ? conflict?.theirs ?? data
          : how === "merged"
          ? merged ?? data
          : data;
      if (how === "keepTheirs") {
        dirty.current = false; // don't trigger another save
        setData(finalData);
        setVersion(conflict?.version ?? version);
        try {
          window.localStorage.setItem(
            localKey,
            JSON.stringify({ data: finalData, version: conflict?.version ?? 0 })
          );
        } catch {}
        return;
      }
      // keepMine or merged → push as a fresh write with the conflict's version.
      dirty.current = true;
      setData(finalData);
      // The version the server has right now is the conflict's version.
      // Force a save now (not debounced).
      if (saveTimer.current) clearTimeout(saveTimer.current);
      pendingData.current = finalData;
      await save(finalData, conflict?.version ?? version);
    },
    [conflict, data, version, save, localKey]
  );

  return { data, version, loading, conflict, setLocal, resolveConflict };
}
