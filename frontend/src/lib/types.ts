// Mirrors backend pydantic schemas (app/schemas).

export type SlotStatus = "correct" | "misplaced" | "missing";

export interface SlotResult {
  row: number;
  col: number;
  expected: string;
  detected?: string | null;
  confidence?: number | null;
  status: SlotStatus;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  label: string;
  confidence: number;
  box: BoundingBox;
  status?: SlotStatus | null; // set by the matcher: correct | misplaced
  expected?: string | null;
}

export interface DemoScene {
  id: string;
  label: string;
}

export interface PlanogramInfo {
  id: string;
  name: string;
  rows: number;
  cols: number;
  slots: number;
}

export interface ShelfAnalysis {
  filename: string;
  total: number;
  detected: number;
  correct: number;
  missing: number;
  misplaced: number;
  compliance_pct: number;
  slots: SlotResult[];
  detections: Detection[];
}
