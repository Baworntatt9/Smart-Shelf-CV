import type { ShelfAnalysis } from "./types";

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

export async function analyzeShelf(file: File): Promise<ShelfAnalysis> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze-shelf`, {
    method: "POST",
    body: form,
  });
  return handle<ShelfAnalysis>(res);
}
