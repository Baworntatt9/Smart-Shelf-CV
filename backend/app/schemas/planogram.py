from pydantic import BaseModel, Field

from app.schemas.detection import BoundingBox


class PlanogramSlot(BaseModel):
    row: int = Field(..., ge=0)
    col: int = Field(..., ge=0)
    expected: str = Field(..., description="Expected product label at this slot")
    # Expected pixel position (in the reference image). Detections are
    # matched to slots by position, not by index, so removing one item
    # only fails its own slot instead of shifting the whole row.
    box: BoundingBox


class Planogram(BaseModel):
    """Expected shelf layout: a rows x cols grid of products."""

    id: str
    name: str
    rows: int
    cols: int
    slots: list[PlanogramSlot]
    # Bundled example shelf photo (filename under app/data/samples/), served
    # as the zero-upload demo so visitors see a populated dashboard on arrival.
    sample: str | None = None


class PlanogramInfo(BaseModel):
    """Lightweight planogram summary for the selector list."""

    id: str
    name: str
    rows: int
    cols: int
    slots: int
