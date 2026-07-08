# Smart Shelf CV — Backend (FastAPI)

Planogram-compliance API. Upload a shelf image → detect products → compare
against the reference planogram.

## Structure

```
backend/
  app/
    main.py                # create_app(), CORS, /health
    core/config.py         # settings (.env via pydantic-settings)
    api/
      router.py            # aggregates routers under /api
      deps.py              # upload validation
      routes/
        shelf.py           # POST /upload-shelf-image, /analyze-shelf
        planogram.py       # GET  /get-planogram
    schemas/               # pydantic models (detection, planogram, shelf)
    services/
      detector.py          # AI Eng 1 — model inference (MockDetector stub)
      matcher.py           # AI Eng 2 — grid mapping + planogram compare
      planogram_store.py   # loads data/planogram.json
    data/planogram.json    # reference 3x6 layout
  tests/test_smoke.py
```

## Run

```bash
python -m venv .venv
./.venv/Scripts/activate        # Windows;  source .venv/bin/activate on *nix
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Endpoints (`/api` prefix)

| Method | Path                  | Purpose                                  |
|--------|-----------------------|------------------------------------------|
| POST   | `/upload-shelf-image` | raw detections for an uploaded image     |
| POST   | `/analyze-shelf`      | full pipeline → compliance summary       |
| GET    | `/get-planogram`      | reference planogram                      |

## Wiring the real model (Day 2-3)

`services/detector.py` ships `MockDetector` (fixed boxes so the API runs
today). Implement `YoloDetector` with `ultralytics`, load weights from
`MODEL_WEIGHTS`, and return `DetectionResult` — routes stay unchanged.

## Test

```bash
pytest -q
```
