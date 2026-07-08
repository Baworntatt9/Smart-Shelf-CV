import type { SlotStatus } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";

export default function GridCell({
  status,
  code,
}: {
  status?: SlotStatus;
  code?: string;
}) {
  if (!status) {
    return <div className="aspect-square animate-pulse rounded-lg bg-border/40" />;
  }
  const s = STATUS_STYLE[status];
  return (
    <div
      className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border ${s.ring}`}
    >
      <span className="font-mono text-[11px] font-semibold text-[#d5dce6]">
        {code}
      </span>
      <span className={`text-xs font-bold leading-none ${s.tone}`}>
        {s.icon}
      </span>
    </div>
  );
}
