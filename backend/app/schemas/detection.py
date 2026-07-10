from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Axis-aligned box in pixel coordinates."""

    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """One detection from the model.

    `status`/`expected` are filled in by the matcher once the box is
    placed on the planogram grid (None on the raw-detection endpoint).
    """

    label: str = Field(..., description="Product class, e.g. 'cola'")
    confidence: float = Field(..., ge=0, le=1)
    box: BoundingBox
    status: str | None = None  # correct | misplaced (grid-relative)
    expected: str | None = None  # planogram label at this box's slot


class DetectionResult(BaseModel):
    """Raw model output for an uploaded image."""

    filename: str
    width: int
    height: int
    detections: list[Detection] = []
