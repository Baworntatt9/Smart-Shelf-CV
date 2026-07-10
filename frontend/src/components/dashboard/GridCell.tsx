import type { SlotStatus } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";

// One cell in the planogram heatmap. Rows can be dense (20+ cols), so
// cells flex to share the row width and show status by color + icon;
// full detail (position, expected/detected) is in the hover title.
export default function GridCell({
  status,
  title,
}: {
  status?: SlotStatus;
  title?: string;
}) {
  if (!status) {
    return <div className="h-7 flex-1 animate-pulse rounded bg-border/40" />;
  }
  const s = STATUS_STYLE[status];
  return (
    <div
      title={title}
      className={`flex h-7 min-w-0 flex-1 items-center justify-center rounded border ${s.ring}`}
    >
      <span className={`text-[10px] font-bold leading-none ${s.tone}`}>
        {s.icon}
      </span>
    </div>
  );
}
