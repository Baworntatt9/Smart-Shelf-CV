from pydantic import BaseModel, Field


class PlanogramSlot(BaseModel):
    row: int = Field(..., ge=0)
    col: int = Field(..., ge=0)
    expected: str = Field(..., description="Expected product label at this slot")


class Planogram(BaseModel):
    """Expected shelf layout: a rows x cols grid of products."""

    name: str
    rows: int
    cols: int
    slots: list[PlanogramSlot]
