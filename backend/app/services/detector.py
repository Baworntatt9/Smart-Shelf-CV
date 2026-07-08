"""Object detection service.

Skeleton for **AI Eng 1**. Swap `MockDetector` for a real YOLOv8 wrapper
(`ultralytics`) once weights are trained (Day 2-3). Keep the `predict`
signature stable so the API/route layer does not change.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.schemas.detection import BoundingBox, Detection, DetectionResult


class Detector(ABC):
    @abstractmethod
    def predict(self, image_bytes: bytes, filename: str) -> DetectionResult:
        """Run inference on raw image bytes and return raw detections."""
        raise NotImplementedError


class MockDetector(Detector):
    """Deterministic placeholder so the API runs before the model exists.

    Returns a fixed 3x6 grid of `cola` boxes over a 1280x800 canvas.
    Replace with real inference in `YoloDetector`.
    """

    ROWS, COLS = 3, 6
    W, H = 1280, 800

    def predict(self, image_bytes: bytes, filename: str) -> DetectionResult:
        cell_w = self.W / self.COLS
        cell_h = self.H / self.ROWS
        detections: list[Detection] = []
        for r in range(self.ROWS):
            for c in range(self.COLS):
                x1 = c * cell_w + cell_w * 0.2
                y1 = r * cell_h + cell_h * 0.2
                x2 = c * cell_w + cell_w * 0.8
                y2 = r * cell_h + cell_h * 0.8
                detections.append(
                    Detection(
                        label="cola",
                        confidence=0.9,
                        box=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                    )
                )
        return DetectionResult(
            filename=filename, width=self.W, height=self.H, detections=detections
        )


# TODO(AI Eng 1): implement with ultralytics
# class YoloDetector(Detector):
#     def __init__(self, weights: str, conf: float):
#         from ultralytics import YOLO
#         self.model = YOLO(weights)
#         self.conf = conf
#
#     def predict(self, image_bytes, filename):
#         ...


_detector: Detector | None = None


def get_detector() -> Detector:
    """FastAPI dependency — single shared detector instance."""
    global _detector
    if _detector is None:
        _detector = MockDetector()
    return _detector
