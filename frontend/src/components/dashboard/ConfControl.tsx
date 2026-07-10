"use client";

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}

// Confidence-threshold slider, styled to match the Metric cards. Filters
// detections client-side (see applyThreshold) — instant, no re-inference.
export default function ConfControl({
  value,
  min = 0.25,
  max = 0.95,
  step = 0.01,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-[0.6px] text-muted">
        Conf. threshold
      </div>
      <div className="mt-1.5 font-mono text-2xl font-bold leading-tight">
        {value.toFixed(2)}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5 w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}
