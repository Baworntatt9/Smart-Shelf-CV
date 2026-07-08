interface Props {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  mono?: boolean;
  accentValue?: boolean;
}

export default function Metric({
  label,
  value,
  suffix,
  hint,
  mono,
  accentValue,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-[0.6px] text-muted">
        {label}
      </div>
      <div
        className={`mt-1.5 text-[27px] font-bold leading-tight ${
          mono ? "font-mono text-2xl" : "font-display"
        } ${accentValue && value !== "—" ? "text-ok" : ""}`}
      >
        {value}
        {suffix && (
          <span className="text-[15px] font-medium text-muted">{suffix}</span>
        )}
      </div>
      {hint && <div className="mt-1 text-[11.5px] text-muted">{hint}</div>}
    </div>
  );
}
