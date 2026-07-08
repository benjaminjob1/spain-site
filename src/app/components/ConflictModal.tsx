"use client";

import { type ReactNode } from "react";

type ConflictProps<T> = {
  // Human label for what's being edited (e.g. "house checklist", "cinema settings").
  title: string;
  theirs: T;
  mine: T;
  // Returns a short diff string for a single field. Used in the side-by-side
  // summary (just shows that the field differs, not a full JSON diff). For a
  // quick visual aid; the real merge happens on the user's screen.
  diffHint?: (theirs: T, mine: T) => string[];
  onResolve: (how: "keepMine" | "keepTheirs" | "merged", merged?: T) => void;
  onCancel: () => void;
};

// Generic modal — concrete UI is up to the consumer.
// This default implementation shows three buttons + a side-by-side JSON dump.
export default function ConflictModal<T>({
  title,
  theirs,
  mine,
  diffHint,
  onResolve,
  onCancel,
}: ConflictProps<T>): ReactNode {
  const hints = diffHint ? diffHint(theirs, mine) : ["conflict"];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">{title}: new changes detected</h2>
        <p className="text-sm text-muted mb-4">
          Someone else (or you, in another tab) saved this state after you started
          editing. Choose which version to keep:
        </p>

        <ul className="text-xs text-muted mb-4 list-disc pl-5">
          {hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
          <div>
            <h3 className="font-semibold mb-1">Their version (server)</h3>
            <pre className="bg-background border rounded-lg p-2 max-h-48 overflow-auto">
              {JSON.stringify(theirs, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Your version (local)</h3>
            <pre className="bg-background border rounded-lg p-2 max-h-48 overflow-auto">
              {JSON.stringify(mine, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-background"
          >
            Cancel
          </button>
          <button
            onClick={() => onResolve("keepTheirs")}
            className="px-4 py-2 rounded-lg border text-sm hover:border-accent"
          >
            Use server version
          </button>
          <button
            onClick={() => onResolve("keepMine")}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-hover"
          >
            Overwrite with mine
          </button>
        </div>
      </div>
    </div>
  );
}
