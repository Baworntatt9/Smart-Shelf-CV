"""Grid mapping + planogram matching.

`map_to_grid` turns raw detection boxes into (row, col) slots by
clustering on the box y-centers into rows, then ordering each row left
to right — used when *building* a planogram from a reference image.

`compare_with_planogram` scores a shelf against a reference. It matches
each planogram slot to the detection that best overlaps its expected
pixel box (position-based, greedy by IoU), not by column index. So
removing or swapping one item only fails that item's slot instead of
shifting every slot after it.
"""

from __future__ import annotations

from app.schemas.detection import Detection, DetectionResult
from app.schemas.planogram import Planogram
from app.schemas.shelf import ShelfAnalysis, SlotResult, SlotStatus

# Minimum IoU for a detection to count as filling a slot.
_MATCH_IOU = 0.3


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
    between rows. Used when authoring a planogram from a reference image.
    """
    grid: dict[tuple[int, int], Detection] = {}
    if result.width <= 0 or result.height <= 0:
        return grid
    for r, band in enumerate(_cluster_rows(result.detections, rows)):
        row_sorted = sorted(band, key=lambda d: _box_center(d)[0])
        for c, det in enumerate(row_sorted):
            grid[(r, c)] = det
    return grid


def _iou(a: Detection, b_box) -> float:
    """Intersection-over-union between a detection box and a slot box."""
    ix1 = max(a.box.x1, b_box.x1)
    iy1 = max(a.box.y1, b_box.y1)
    ix2 = min(a.box.x2, b_box.x2)
    iy2 = min(a.box.y2, b_box.y2)
    iw = max(0.0, ix2 - ix1)
    ih = max(0.0, iy2 - iy1)
    inter = iw * ih
    if inter <= 0:
        return 0.0
    area_a = (a.box.x2 - a.box.x1) * (a.box.y2 - a.box.y1)
    area_b = (b_box.x2 - b_box.x1) * (b_box.y2 - b_box.y1)
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0


def _match_slots_to_detections(
    planogram: Planogram, dets: list[Detection]
) -> dict[int, Detection]:
    """Greedily pair each slot with the best-overlapping detection.

    Returns {slot_index: detection}. Pairs are assigned highest-IoU
    first so each detection fills at most one slot.
    """
    pairs = []
    for si, slot in enumerate(planogram.slots):
        for det in dets:
            iou = _iou(det, slot.box)
            if iou >= _MATCH_IOU:
                pairs.append((iou, si, det))
    pairs.sort(key=lambda p: p[0], reverse=True)

    matched: dict[int, Detection] = {}
    used_dets: set[int] = set()
    for _iou_val, si, det in pairs:
        if si in matched or id(det) in used_dets:
            continue
        matched[si] = det
        used_dets.add(id(det))
    return matched


def compare_with_planogram(
    result: DetectionResult, planogram: Planogram, conf_threshold: float
) -> ShelfAnalysis:
    """Compare detections against the expected layout, by position."""
    matched = _match_slots_to_detections(planogram, result.detections)

    slots: list[SlotResult] = []
    correct = missing = misplaced = 0

    for si, slot in enumerate(planogram.slots):
        det = matched.get(si)
        if det is None or det.confidence < conf_threshold:
            missing += 1
            slots.append(
                SlotResult(
                    row=slot.row,
                    col=slot.col,
                    expected=slot.expected,
                    status=SlotStatus.MISSING,
                )
            )
            continue

        if det.label == slot.expected:
            status = SlotStatus.CORRECT
            correct += 1
        else:
            status = SlotStatus.MISPLACED
            misplaced += 1
        # Tag the box so the frontend can colour it by compliance.
        det.status = status.value
        det.expected = slot.expected
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
