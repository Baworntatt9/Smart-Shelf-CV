"""Object detection service.

`MockDetector` keeps the API runnable without weights; `YoloDetector`
wraps an ultralytics YOLO model. `get_detector` builds the real detector
from settings and falls back to the mock if weights are missing or
ultralytics is not installed. The `predict` signature is stable so the
route/matcher layers never change.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import Settings, get_settings
from app.schemas.detection import BoundingBox, Detection, DetectionResult

# backend/ root — weights paths in settings are relative to it.
_BACKEND_ROOT = Path(__file__).resolve().parents[2]

# Recall floor for inference. Boxes below this never reach the matcher;
# the matcher then applies `conf_threshold` to decide correct/missing.
# Keep it under the compliance threshold so low-confidence items still
# surface as "detected but below threshold" rather than vanishing.
_DETECT_CONF = 0.25


class Detector(ABC):
    @abstractmethod
    def predict(self, image_bytes: bytes, filename: str) -> DetectionResult:
        """Run inference on raw image bytes and return raw detections."""
        raise NotImplementedError


class MockDetector(Detector):
    """Deterministic placeholder so the API runs before the model exists.

    Returns a fixed 3x6 grid of `cola` boxes over a 1280x800 canvas.
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


class YoloDetector(Detector):
    """Ultralytics YOLO wrapper. Loads weights once, reused per request."""

    def __init__(self, weights: str, conf: float = _DETECT_CONF) -> None:
        from ultralytics import YOLO  # imported lazily so the mock path is dep-free

        path = Path(weights)
        if not path.is_absolute():
            path = _BACKEND_ROOT / path
        if not path.exists():
            raise FileNotFoundError(f"weights not found: {path}")

        self.model = YOLO(str(path))
        self.names: dict[int, str] = self.model.names
        self.conf = conf

    def predict(self, image_bytes: bytes, filename: str) -> DetectionResult:
        import numpy as np
        from PIL import Image
        import io

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.asarray(img)  # HxWx3, RGB
        h, w = arr.shape[:2]

        # max_det raised above the YOLO default (300) so dense retail
        # shelves aren't clipped mid-image.
        result = self.model.predict(
            arr, conf=self.conf, max_det=1000, verbose=False
        )[0]

        detections: list[Detection] = []
        for box in result.boxes:
            x1, y1, x2, y2 = (float(v) for v in box.xyxy[0])
            detections.append(
                Detection(
                    label=self.names[int(box.cls)],
                    confidence=float(box.conf),
                    box=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                )
            )
        return DetectionResult(
            filename=filename, width=w, height=h, detections=detections
        )


_detector: Detector | None = None


def get_detector() -> Detector:
    """FastAPI dependency — single shared detector instance.

    Tries the real YOLO model; falls back to the mock if weights are
    missing or ultralytics is unavailable, so the API always boots.
    """
    global _detector
    if _detector is None:
        settings: Settings = get_settings()
        try:
            _detector = YoloDetector(settings.model_weights)
        except Exception as exc:  # noqa: BLE001 — degrade gracefully
            print(f"[detector] YOLO unavailable ({exc}); using MockDetector")
            _detector = MockDetector()
    return _detector
