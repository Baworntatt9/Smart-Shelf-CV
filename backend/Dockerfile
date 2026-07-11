# syntax=docker/dockerfile:1

# ---- Base ---------------------------------------------------------------
# slim keeps the image small; ultralytics/opencv need a couple of native
# libs that the slim image drops, installed below.
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# libGL + glib: opencv (pulled in by ultralytics) links against them.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Dependencies -------------------------------------------------------
# Copy only requirements first so the pip layer is cached across code edits.
COPY requirements.txt ./
# Install CPU-only torch/vision FIRST from PyTorch's CPU index. Without this
# the default PyPI index pulls the CUDA build (+~6GB of nvidia-* wheels) that
# is dead weight on a CPU-only image. Pinning them here means the later
# ultralytics install sees the requirement satisfied and won't re-pull CUDA.
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision
RUN pip install -r requirements.txt

# ---- App ----------------------------------------------------------------
COPY app ./app
COPY models ./models

# Run as non-root.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Prod defaults; override at deploy time. DEBUG off, CORS locked to the
# frontend origin the platform assigns.
ENV DEBUG=false \
    CORS_ORIGINS="http://localhost:3000" \
    MODEL_WEIGHTS="models/best.pt"

# Container-level healthcheck hits the app's /health route on $PORT.
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import os,urllib.request,sys; p=os.environ.get('PORT','8000'); sys.exit(0 if urllib.request.urlopen(f'http://localhost:{p}/health').status==200 else 1)"

# Honour $PORT (Render/Cloud Run inject it); default 8000 for local/compose.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
