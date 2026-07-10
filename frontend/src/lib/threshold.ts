import type { ShelfAnalysis } from "./types";

// Re-derive the analysis at a UI-chosen confidence threshold. The backend
// returns detections down to its floor (0.25); raising the threshold here
// simply drops low-confidence detections to "missing" and recomputes the
// compliance summary — no re-inference, no round-trip.
export function applyThreshold(a: ShelfAnalysis, conf: number): ShelfAnalysis {
  let correct = 0;
  let misplaced = 0;
  let missing = 0;
  let detected = 0;

  const slots = a.slots.map((s) => {
    const present = s.detected != null && (s.confidence ?? 0) >= conf;
    if (!present) {
      missing += 1;
      return { ...s, status: "missing" as const };
    }
    detected += 1;
    if (s.detected === s.expected) {
      correct += 1;
      return { ...s, status: "correct" as const };
    }
    misplaced += 1;
    return { ...s, status: "misplaced" as const };
  });

  const compliance_pct = a.total ? Math.round((correct / a.total) * 100) : 0;

  return { ...a, slots, detected, correct, missing, misplaced, compliance_pct };
}
