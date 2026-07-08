from fastapi import APIRouter

from app.schemas.planogram import Planogram
from app.services.planogram_store import load_planogram

router = APIRouter(tags=["planogram"])


@router.get("/get-planogram", response_model=Planogram)
def get_planogram() -> Planogram:
    """Return the reference planogram the shelf is compared against."""
    return load_planogram()
