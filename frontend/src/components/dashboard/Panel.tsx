interface Props {
  title: string;
  meta?: string;
  badge?: string;
  children: React.ReactNode;
}

export default function Panel({ title, meta, badge, children }: Props) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-[14.5px] font-semibold">{title}</div>
        {meta && (
          <div className="font-mono text-[11.5px] text-muted">{meta}</div>
        )}
        {badge && (
          <span className="rounded-full bg-bad/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-bad">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
