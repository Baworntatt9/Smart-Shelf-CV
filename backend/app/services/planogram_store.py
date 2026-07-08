import json
from functools import lru_cache
from pathlib import Path

from app.schemas.planogram import Planogram

_DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "planogram.json"


@lru_cache
def load_planogram() -> Planogram:
    """Load the reference planogram from disk (cached)."""
    with _DATA_FILE.open(encoding="utf-8") as f:
        raw = json.load(f)
    return Planogram.model_validate(raw)
