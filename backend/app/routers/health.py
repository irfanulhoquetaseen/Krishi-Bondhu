from fastapi import APIRouter
from datetime import datetime, timezone
from ..models.advisory import HealthResponse

router = APIRouter(tags=["Health & System Telemetry"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Core system health diagnostic endpoint for Krishi Bondhu.
    """
    return HealthResponse(
        status="ok",
        app="Krishi Bondhu Agro-Advisory API",
        version="0.1.0-mvp",
        timestamp=datetime.now(timezone.utc),
        active_services=[
            "soil_telemetry",
            "microclimate_diagnostic",
            "crop_advisory_pipeline",
        ],
    )
