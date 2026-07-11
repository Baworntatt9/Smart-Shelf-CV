import type { DemoScene, PlanogramInfo, ShelfAnalysis } from "./types";

// Requests go to /api/* and are proxied to FastAPI via next.config.ts rewrites.
const API_BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function listPlanograms(): Promise<PlanogramInfo[]> {
  const res = await fetch(`${API_BASE}/planograms`);
  return handle<PlanogramInfo[]>(res);
}

export async function analyzeShelf(
  file: File,
  planogramId?: string
): Promise<ShelfAnalysis> {
  const form = new FormData();
  form.append("file", file);
  if (planogramId) form.append("planogram_id", planogramId);
  const res = await fetch(`${API_BASE}/analyze-shelf`, {
    method: "POST",
    body: form,
  });
  return handle<ShelfAnalysis>(res);
}

// Zero-upload demo scenes (normal / missing / misplaced), picked by button.
export async function listDemoScenes(): Promise<DemoScene[]> {
  const res = await fetch(`${API_BASE}/demo-scenes`);
  return handle<DemoScene[]>(res);
}

// Analyse a chosen demo scene's bundled image.
export async function demoAnalysis(sceneId: string): Promise<ShelfAnalysis> {
  const res = await fetch(
    `${API_BASE}/demo-analysis?scene=${encodeURIComponent(sceneId)}`
  );
  return handle<ShelfAnalysis>(res);
}

// URL of the scene's photo — use as the viewer preview.
export function sampleImageUrl(sceneId: string): string {
  return `${API_BASE}/sample-image?scene=${encodeURIComponent(sceneId)}`;
}
