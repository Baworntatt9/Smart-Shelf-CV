# Smart Shelf CV — Frontend (Next.js 16 + Tailwind v4)

Dashboard for the planogram-compliance demo. Sends a shelf image to the
FastAPI backend and shows the compliance summary, detection overlay, and
per-slot planogram grid. First-time visitors can pick a demo scene instead
of uploading their own image.

## Structure

```
frontend/
  Dockerfile               # multi-stage Next standalone build, non-root
  next.config.ts           # /api/* → FastAPI proxy (rewrites); output "standalone"
  postcss.config.mjs       # Tailwind v4 via @tailwindcss/postcss
  src/
    app/
      layout.tsx
      page.tsx             # dashboard: scene picker / upload / results
      globals.css          # Tailwind + design tokens (@theme)
    components/
      ShelfViewer.tsx      # image preview + drag-drop upload + overlay
      dashboard/           # Header, Metric, Panel, GridCell, ConfControl,
                           #   PlanogramSelect, DetectionOverlay, Legend, …
    lib/
      api.ts               # fetch wrappers → /api/* (analyze, demo scenes)
      types.ts             # mirrors backend schemas
      threshold.ts         # client-side re-scoring at a chosen confidence
      status.ts            # slot-status helpers
```

## Run (local)

```bash
npm install
cp .env.local.example .env.local     # optional; defaults to localhost:8000
npm run dev
```

Open http://localhost:3000. Start the backend first (`uvicorn app.main:app
--reload` in `../backend`) — `/api/*` is proxied there via `next.config.ts`.

## Run (Docker)

Bring up the full stack from the repo root: `docker compose up`. The backend
URL is baked at build time (`next.config` rewrites), so set it via the
`BACKEND_URL` build arg per environment — see the root `docker-compose.yml`.

## Notes

- Demo scenes come from the backend (`/api/demo-scenes`); nothing is analysed
  until the visitor picks a scene or uploads an image.
- Tailwind v4 is CSS-first: no `tailwind.config.js`; tokens live in
  `globals.css` under `@theme`.
- Colors mirror the Claude Design dashboard in `../design`.
