from fastapi import APIRouter

from app.api.routes import planogram, shelf

api_router = APIRouter()
api_router.include_router(shelf.router)
api_router.include_router(planogram.router)
