"""Grid mapping + planogram matching.

Skeleton for **AI Eng 2**. `map_to_grid` turns raw detection boxes into
(row, col) slots; `compare_with_planogram` labels each slot correct /
misplaced / missing and computes the compliance summary.
"""

from __future__ import annotations

from app.schemas.detection import Detection, DetectionResult
from app.schemas.planogram import Planogram
from app.schemas.shelf import ShelfAnalysis, SlotResult, SlotStatus


def _box_center(det: Detection) -> tuple[float, float]:
    return (det.box.x1 + det.box.x2) / 2, (det.box.y1 + det.box.y2) / 2


def map_to_grid(
    result: DetectionResult, rows: int, cols: int
) -> dict[tuple[int, int], Detection]:
    """Assign each detection to a grid cell by its box center.

    Naive uniform-grid mapping — good enough for the demo. AI Eng 2 can
    refine (e.g. cluster by row from y, sort by x) once real boxes exist.
    On collision, keep the highest-confidence detection.
    """
    grid: dict[tuple[int, int], Detection] = {}
    if result.width <= 0 or result.height <= 0:
        return grid
    for det in result.detections:
        cx, cy = _box_center(det)
        col = min(int(cx / result.width * cols), cols - 1)
        row = min(int(cy / result.height * rows), rows - 1)
        key = (row, col)
        if key not in grid or det.confidence > grid[key].confidence:
            grid[key] = det
    return grid


def compare_with_planogram(
    result: DetectionResult, planogram: Planogram, conf_threshold: float
) -> ShelfAnalysis:
    """Compare mapped detections against expected layout."""
    grid = map_to_grid(result, planogram.rows, planogram.cols)

    slots: list[SlotResult] = []
    correct = missing = misplaced = 0

    for slot in planogram.slots:
        det = grid.get((slot.row, slot.col))
        if det is None or det.confidence < conf_threshold:
            status = SlotStatus.MISSING
            missing += 1
            slots.append(
                SlotResult(
                    row=slot.row, col=slot.col, expected=slot.expected, status=status
                )
            )
            continue

        if det.label == slot.expected:
            status = SlotStatus.CORRECT
            correct += 1
        else:
            status = SlotStatus.MISPLACED
            misplaced += 1
        slots.append(
            SlotResult(
                row=slot.row,
                col=slot.col,
                expected=slot.expected,
                detected=det.label,
                confidence=det.confidence,
                status=status,
            )
        )

    total = len(planogram.slots)
    detected = sum(1 for s in slots if s.detected is not None)
    compliance = round(correct / total * 100) if total else 0

    return ShelfAnalysis(
        filename=result.filename,
        total=total,
        detected=detected,
        correct=correct,
        missing=missing,
        misplaced=misplaced,
        compliance_pct=compliance,
        slots=slots,
        detections=result.detections,
    )
