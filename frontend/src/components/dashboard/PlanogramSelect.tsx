"use client";

import type { PlanogramInfo } from "@/lib/types";

interface Props {
  options: PlanogramInfo[];
  value: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}

// Reference-planogram picker. Switching it changes which layout the
// uploaded shelf is scored against (re-runs analysis on the next upload).
export default function PlanogramSelect({
  options,
  value,
  disabled,
  onChange,
}: Props) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.6px] text-muted">
        Planogram
      </span>
      <select
        value={value}
        disabled={disabled || options.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-[#2a3442] bg-panel px-2.5 py-1.5 font-mono text-[11.5px] text-fg outline-none transition hover:border-accent/60 focus:border-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.rows}×{p.slots}
          </option>
        ))}
      </select>
    </label>
  );
}
