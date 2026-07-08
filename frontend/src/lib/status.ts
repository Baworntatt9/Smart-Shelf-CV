import type { SlotStatus } from "./types";

// Shared color/icon mapping for a slot status, used by the planogram grid,
// issue rows, and legend.
export const STATUS_STYLE: Record<
  SlotStatus,
  { ring: string; icon: string; tone: string; swatch: string }
> = {
  correct: {
    ring: "border-ok/60 bg-ok/15",
    icon: "✓",
    tone: "text-ok",
    swatch: "bg-ok",
  },
  misplaced: {
    ring: "border-warn/60 bg-warn/15",
    icon: "⇄",
    tone: "text-warn",
    swatch: "bg-warn",
  },
  missing: {
    ring: "border-bad/60 bg-bad/15",
    icon: "✕",
    tone: "text-bad",
    swatch: "bg-bad",
  },
};
