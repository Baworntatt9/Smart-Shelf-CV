from fastapi import APIRouter, Depends, Form, UploadFile

from app.api.deps import read_image_upload
from app.core.config import Settings, get_settings
from app.schemas.detection import DetectionResult
from app.schemas.shelf import ShelfAnalysis
from app.services.detector import Detector, get_detector
from app.services.matcher import compare_with_planogram
from app.services.planogram_store import load_planogram

router = APIRouter(tags=["shelf"])


@router.post("/upload-shelf-image", response_model=DetectionResult)
async def upload_shelf_image(
    file: UploadFile,
    detector: Detector = Depends(get_detector),
) -> DetectionResult:
    """Upload a shelf image → return raw detections (no planogram compare)."""
    data, filename = await read_image_upload(file)
    return detector.predict(data, filename)


@router.post("/analyze-shelf", response_model=ShelfAnalysis)
async def analyze_shelf(
    file: UploadFile,
    planogram_id: str | None = Form(default=None),
    detector: Detector = Depends(get_detector),
    settings: Settings = Depends(get_settings),
) -> ShelfAnalysis:
    """Full pipeline: upload → detect → map to grid → compare with planogram.

    `planogram_id` picks which reference to compare against (default when
    omitted).
    """
    data, filename = await read_image_upload(file)
    result = detector.predict(data, filename)
    planogram = load_planogram(planogram_id)
    return compare_with_planogram(result, planogram, settings.conf_threshold)
