from fastapi import APIRouter

from app.schemas.planogram import Planogram, PlanogramInfo
from app.services.planogram_store import list_planograms, load_planogram

router = APIRouter(tags=["planogram"])


@router.get("/planograms", response_model=list[PlanogramInfo])
def get_planograms() -> list[PlanogramInfo]:
    """List every available reference planogram for the selector."""
    return list_planograms()


@router.get("/get-planogram", response_model=Planogram)
def get_planogram(id: str | None = None) -> Planogram:
    """Return one reference planogram (the default when id is omitted)."""
    return load_planogram(id)
