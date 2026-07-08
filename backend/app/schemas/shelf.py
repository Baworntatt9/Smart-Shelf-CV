from enum import Enum

from pydantic import BaseModel

from app.schemas.detection import Detection


class SlotStatus(str, Enum):
    CORRECT = "correct"
    MISPLACED = "misplaced"
    MISSING = "missing"


class SlotResult(BaseModel):
    row: int
    col: int
    expected: str
    detected: str | None = None
    confidence: float | None = None
    status: SlotStatus


class ShelfAnalysis(BaseModel):
    """Full pipeline result: detections mapped to grid + compliance summary."""

    filename: str
    total: int
    detected: int
    correct: int
    missing: int
    misplaced: int
    compliance_pct: int
    slots: list[SlotResult]
    detections: list[Detection] = []
