"""Curated demo scenes for the zero-upload showcase.

Each scene pairs a bundled shelf photo with the planogram to score it
against, so a visitor can preview a normal / missing / misplaced result by
picking a button instead of uploading their own image.
"""

from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException

_SAMPLE_DIR = Path(__file__).resolve().parent.parent / "data" / "samples"


@dataclass(frozen=True)
class DemoScene:
    id: str
    label: str  # shown on the picker button
    planogram_id: str
    image: str  # filename under data/samples/


_SCENES: list[DemoScene] = [
    DemoScene("normal", "ปกติ", "cooler-mini", "cooler_mini.jpg"),
    DemoScene("miss1", "สินค้าขาด 1", "cooler-mini", "cooler_mini_miss1.png"),
    DemoScene(
        "misplace1", "วางผิด 1", "cooler-mini", "cooler_mini_misplace1.jpg"
    ),
]

_BY_ID = {s.id: s for s in _SCENES}


def list_scenes() -> list[DemoScene]:
    return _SCENES


def get_scene(scene_id: str) -> DemoScene:
    scene = _BY_ID.get(scene_id)
    if scene is None:
        raise HTTPException(status_code=404, detail=f"demo scene not found: {scene_id}")
    return scene


def scene_image_path(scene_id: str) -> Path:
    path = _SAMPLE_DIR / get_scene(scene_id).image
    if not path.is_file():
        raise HTTPException(status_code=404, detail=f"sample missing: {path.name}")
    return path
