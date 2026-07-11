import io

from fastapi.testclient import TestClient

from app.main import app
from app.services.planogram_store import load_planogram

client = TestClient(app)

# Expected shape comes from the default planogram, so these tests track
# whichever planogram the store serves instead of hard-coding a grid.
_DEFAULT = load_planogram()


def _png_bytes() -> bytes:
    # 1x1 PNG
    import base64

    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    )


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_get_planogram():
    r = client.get("/api/get-planogram")
    assert r.status_code == 200
    body = r.json()
    assert body["rows"] == _DEFAULT.rows and body["cols"] == _DEFAULT.cols
    assert len(body["slots"]) == len(_DEFAULT.slots)


def test_analyze_shelf():
    files = {"file": ("shelf.png", io.BytesIO(_png_bytes()), "image/png")}
    r = client.post("/api/analyze-shelf", files=files)
    assert r.status_code == 200
    body = r.json()
    assert len(body["slots"]) == len(_DEFAULT.slots)
    assert body["total"] == len(body["slots"])
    assert "compliance_pct" in body


def test_reject_non_image():
    files = {"file": ("x.txt", io.BytesIO(b"hello"), "text/plain")}
    r = client.post("/api/upload-shelf-image", files=files)
    assert r.status_code == 415
