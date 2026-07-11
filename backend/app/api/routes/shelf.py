from fastapi import APIRouter, Depends, Form, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.api.deps import read_image_upload
from app.core.config import Settings, get_settings
from app.schemas.detection import DetectionResult
from app.schemas.shelf import ShelfAnalysis
from app.services.demo import get_scene, list_scenes, scene_image_path
from app.services.detector import Detector, get_detector
from app.services.matcher import compare_with_planogram
from app.services.planogram_store import load_planogram

router = APIRouter(tags=["shelf"])


class DemoSceneInfo(BaseModel):
    """A pickable demo scene for the zero-upload showcase."""

    id: str
    label: str


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


@router.get("/demo-scenes", response_model=list[DemoSceneInfo])
def demo_scenes() -> list[DemoSceneInfo]:
    """List the pickable demo scenes (normal / missing / misplaced)."""
    return [DemoSceneInfo(id=s.id, label=s.label) for s in list_scenes()]


@router.get("/demo-analysis", response_model=ShelfAnalysis)
def demo_analysis(
    scene: str,
    detector: Detector = Depends(get_detector),
    settings: Settings = Depends(get_settings),
) -> ShelfAnalysis:
    """Zero-upload demo: analyse a chosen scene's bundled image.

    Lets a visitor preview a result without uploading. Pair the preview
    with GET /sample-image?scene=<id>.
    """
    s = get_scene(scene)
    data = scene_image_path(scene).read_bytes()
    result = detector.predict(data, s.image)
    planogram = load_planogram(s.planogram_id)
    return compare_with_planogram(result, planogram, settings.conf_threshold)


@router.get("/sample-image")
def sample_image(scene: str) -> FileResponse:
    """Serve a demo scene's bundled photo, for the viewer preview.

    media_type inferred from the file extension (scenes mix jpg/png).
    """
    return FileResponse(scene_image_path(scene))
