# Smart Shelf CV — Frontend (Next.js 16 + Tailwind v4)

Upload page for the planogram-compliance demo. Sends a shelf image to the
FastAPI backend and shows the compliance summary.

## Structure

```
frontend/
  next.config.ts           # /api/* → FastAPI proxy (rewrites)
  postcss.config.mjs       # Tailwind v4 via @tailwindcss/postcss
  src/
    app/
      layout.tsx
      page.tsx             # upload page
      globals.css          # Tailwind + design tokens (@theme)
    components/
      UploadDropzone.tsx   # drag-drop / click file picker
    lib/
      api.ts               # fetch wrapper → /api/analyze-shelf
      types.ts             # mirrors backend schemas
```

## Run

```bash
npm install
cp .env.local.example .env.local     # optional; defaults to localhost:8000
npm run dev
```

Open http://localhost:3000. Start the backend first (`uvicorn app.main:app
--reload` in `../backend`) — `/api/*` is proxied there via `next.config.ts`.

## Notes

- Tailwind v4 is CSS-first: no `tailwind.config.js`; tokens live in
  `globals.css` under `@theme`.
- Colors mirror the Claude Design dashboard in `../design`.
