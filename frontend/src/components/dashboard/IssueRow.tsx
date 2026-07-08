import type { SlotResult } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";

export default function IssueRow({ slot }: { slot: SlotResult }) {
  const isMissing = slot.status === "missing";
  const s = STATUS_STYLE[slot.status];
  return (
    <div className="flex items-center gap-2.5 rounded-[9px] border border-border bg-[#10151d] px-2.5 py-2">
      <div
        className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg text-sm font-bold ${s.tone} bg-current/10`}
      >
        <span className={s.tone}>{s.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-fg">
          {isMissing
            ? `สินค้าขาด · ${slot.expected}`
            : `ผิดตำแหน่ง · ${slot.expected}`}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {isMissing
            ? `ควรมี ${slot.expected} แต่ตรวจไม่พบ`
            : `คาดว่า ${slot.expected} แต่พบ ${slot.detected}`}
        </div>
      </div>
      <div className="whitespace-nowrap text-right font-mono text-[11.5px] text-muted">
        R{slot.row + 1}·C{slot.col + 1}
      </div>
    </div>
  );
}
