# Smart-Shelf-CV

Retail **planogram-compliance** demo. Upload a shelf photo (or pick a bundled
demo scene) → a YOLO model detects products → each detection is matched to a
reference planogram slot → the dashboard shows compliance %, missing and
misplaced items, a detection overlay, and a per-slot grid.

- **Backend** — FastAPI + ultralytics YOLO (`backend/`)
- **Frontend** — Next.js 16 + Tailwind v4 dashboard (`frontend/`)

## Quickstart (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

The frontend proxies `/api/*` to the backend over the compose network.

## Quickstart (local)

Two terminals:

```bash
# backend
cd backend
python -m venv .venv && ./.venv/Scripts/activate   # source .venv/bin/activate on *nix
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — pick a demo scene or upload a shelf image.

## Deploy notes

- The frontend bakes the backend URL at build time (`next.config` rewrites),
  so set `BACKEND_URL` as a **build arg** per environment.
- Set backend `CORS_ORIGINS` to the deployed frontend origin.
- The backend image uses CPU-only torch (`Dockerfile`) to stay ~2.5 GB.

## More

- `backend/README.md` — API structure, endpoints, model wiring
- `frontend/README.md` — dashboard structure, demo scenes
- `smart_shelf_cv_workflow.md` — build workflow / task split
