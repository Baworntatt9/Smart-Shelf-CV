import json
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException

from app.schemas.planogram import Planogram, PlanogramInfo

_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "planograms"

# The planogram served when a request names none.
DEFAULT_PLANOGRAM_ID = "cooler-mini"


@lru_cache
def _all() -> dict[str, Planogram]:
    """Load every planogram JSON in the data dir, keyed by id (cached)."""
    store: dict[str, Planogram] = {}
    for path in sorted(_DATA_DIR.glob("*.json")):
        with path.open(encoding="utf-8") as f:
            plan = Planogram.model_validate(json.load(f))
        store[plan.id] = plan
    return store


def list_planograms() -> list[PlanogramInfo]:
    """Summaries of all available planograms, for the selector."""
    return [
        PlanogramInfo(
            id=p.id, name=p.name, rows=p.rows, cols=p.cols, slots=len(p.slots)
        )
        for p in _all().values()
    ]


def load_planogram(planogram_id: str | None = None) -> Planogram:
    """Load one planogram by id, or the default when id is None."""
    store = _all()
    pid = planogram_id or DEFAULT_PLANOGRAM_ID
    plan = store.get(pid)
    if plan is None:
        raise HTTPException(status_code=404, detail=f"planogram not found: {pid}")
    return plan
