"""Grid mapping + planogram matching.

`map_to_grid` turns raw detection boxes into (row, col) slots by
clustering on the box y-centers into rows, then ordering each row left
to right. This handles real shelves where rows hold different item
counts and widths (no fixed uniform lattice). `compare_with_planogram`
labels each slot correct / misplaced / missing and computes compliance.
"""

from __future__ import annotations

from app.schemas.detection import Detection, DetectionResult
from app.schemas.planogram import Planogram
from app.schemas.shelf import ShelfAnalysis, SlotResult, SlotStatus


def _box_center(det: Detection) -> tuple[float, float]:
    return (det.box.x1 + det.box.x2) / 2, (det.box.y1 + det.box.y2) / 2


def _cluster_rows(
    dets: list[Detection], rows: int
) -> list[list[Detection]]:
    """Split detections into `rows` bands by y-center.

    Sort by vertical center, then cut at the `rows - 1` largest vertical
    gaps between consecutive items. Robust to uneven row spacing and
    variable item counts per row.
    """
    if not dets:
        return []
    ordered = sorted(dets, key=lambda d: _box_center(d)[1])
    if rows <= 1 or len(ordered) <= rows:
        return [ordered]

    cys = [_box_center(d)[1] for d in ordered]
    # index i marks the boundary *before* ordered[i]; rank by gap size.
    boundaries = sorted(
        range(1, len(ordered)),
        key=lambda i: cys[i] - cys[i - 1],
        reverse=True,
    )[: rows - 1]
    cuts = sorted(boundaries)

    bands: list[list[Detection]] = []
    prev = 0
    for cut in [*cuts, len(ordered)]:
        bands.append(ordered[prev:cut])
        prev = cut
    return bands


def map_to_grid(
    result: DetectionResult, rows: int
) -> dict[tuple[int, int], Detection]:
    """Assign each detection to a (row, col) slot.

    Rows come from y-clustering (top to bottom); within a row, columns
    are the left-to-right order of the boxes. Column counts may differ
    between rows.
    """
    grid: dict[tuple[int, int], Detection] = {}
    if result.width <= 0 or result.height <= 0:
        return grid
    for r, band in enumerate(_cluster_rows(result.detections, rows)):
        row_sorted = sorted(band, key=lambda d: _box_center(d)[0])
        for c, det in enumerate(row_sorted):
            grid[(r, c)] = det
    return grid


def compare_with_planogram(
    result: DetectionResult, planogram: Planogram, conf_threshold: float
) -> ShelfAnalysis:
    """Compare mapped detections against expected layout."""
    grid = map_to_grid(result, planogram.rows)

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
