import io

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


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
    assert body["rows"] == 3 and body["cols"] == 6
    assert len(body["slots"]) == 18


def test_analyze_shelf():
    files = {"file": ("shelf.png", io.BytesIO(_png_bytes()), "image/png")}
    r = client.post("/api/analyze-shelf", files=files)
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 18
    assert len(body["slots"]) == 18
    assert "compliance_pct" in body


def test_reject_non_image():
    files = {"file": ("x.txt", io.BytesIO(b"hello"), "text/plain")}
    r = client.post("/api/upload-shelf-image", files=files)
    assert r.status_code == 415
