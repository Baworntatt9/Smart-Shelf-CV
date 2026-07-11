# Smart Shelf CV — Backend (FastAPI)

Planogram-compliance API. Upload a shelf image → detect products → compare
against the reference planogram.

## Structure

```
backend/
  Dockerfile               # python:3.12-slim, CPU-only torch, non-root
  app/
    main.py                # create_app(), CORS, /health
    core/config.py         # settings (.env via pydantic-settings)
    api/
      router.py            # aggregates routers under /api
      deps.py              # upload validation
      routes/
        shelf.py           # upload / analyze / demo endpoints
        planogram.py       # GET /planograms, /get-planogram
    schemas/               # pydantic models (detection, planogram, shelf)
    services/
      detector.py          # model inference — YoloDetector (mock fallback)
      matcher.py           # grid mapping + planogram compare
      planogram_store.py   # loads data/planograms/*.json
      demo.py              # curated zero-upload demo scenes
    data/
      planograms/          # reference layouts (cooler-mini.json)
      samples/             # bundled shelf photos for the demo scenes
  models/best.pt           # trained YOLO weights
  tests/test_smoke.py
```

## Run (local)

```bash
python -m venv .venv
./.venv/Scripts/activate        # Windows;  source .venv/bin/activate on *nix
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Run (Docker)

```bash
docker build -t smart-shelf-backend .
docker run -p 8000:8000 -e CORS_ORIGINS="http://localhost:3000" smart-shelf-backend
```

Or bring up the full stack from the repo root: `docker compose up`.

## Endpoints (`/api` prefix)

| Method | Path                  | Purpose                                  |
|--------|-----------------------|------------------------------------------|
| POST   | `/upload-shelf-image` | raw detections for an uploaded image     |
| POST   | `/analyze-shelf`      | full pipeline → compliance summary       |
| GET    | `/planograms`         | list reference planograms (for selector) |
| GET    | `/get-planogram`      | one reference planogram (`?id=`)         |
| GET    | `/demo-scenes`        | pickable demo scenes                     |
| GET    | `/demo-analysis`      | analyse a demo scene (`?scene=`)         |
| GET    | `/sample-image`       | a demo scene's photo (`?scene=`)         |

## Model

`services/detector.py` runs `YoloDetector` (ultralytics) against the weights
at `MODEL_WEIGHTS` (default `models/best.pt`). If the weights are missing or
ultralytics is unavailable it falls back to `MockDetector` so the API still
boots — routes are unchanged either way.

## Demo scenes

`services/demo.py` defines curated scenes (normal / 1 missing / 1 misplaced),
each a bundled photo in `data/samples/` scored against the cooler-mini
planogram. Lets the frontend show a populated dashboard without an upload.

## Test

```bash
pytest -q
```
