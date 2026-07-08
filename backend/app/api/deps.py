from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def read_image_upload(file: UploadFile) -> tuple[bytes, str]:
    """Validate an uploaded image and return (bytes, filename)."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported type '{file.content_type}'. Use JPEG/PNG/WebP.",
        )
    data = await file.read()
    max_bytes = get_settings().max_upload_bytes
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {get_settings().max_upload_mb} MB limit.",
        )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file."
        )
    return data, file.filename or "upload.jpg"
