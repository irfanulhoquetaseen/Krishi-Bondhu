from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from backend root directory
backend_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=backend_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from .routers.health import router as health_router
from .routers.advisory import router as advisory_router
from .routers.voice_intake import router as voice_router
from .routers.disease import router as disease_router
from .routers.treatment import router as treatment_router
from .routers.market import router as market_router
from .routers.report import router as report_router
from .models.advisory import HealthResponse

app = FastAPI(
    title="Krishi Bondhu Agro-Advisory API",
    description="Precision AI Agricultural Advisory & Soil Telemetry Platform",
    version="0.1.0-mvp",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(voice_router, prefix="/api")
app.include_router(voice_router, prefix="/api/v1")
app.include_router(disease_router, prefix="/api")
app.include_router(disease_router, prefix="/api/v1")
app.include_router(treatment_router, prefix="/api")
app.include_router(treatment_router, prefix="/api/v1")
app.include_router(market_router, prefix="/api")
app.include_router(market_router, prefix="/api/v1")
app.include_router(report_router, prefix="/api")
app.include_router(report_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(advisory_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "Krishi Bondhu (কৃষি বন্ধু)",
        "tagline": "AI-Powered Agro-Advisory Engine for Precision Farming",
        "version": "0.1.0-mvp",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "api_health": "/api/v1/health",
            "voice_intake": "/api/voice-intake",
            "text_intake": "/api/text-intake",
            "disease_detection": "/api/disease-detection",
            "treatment_plan": "/api/treatment-plan",
            "price_check": "/api/price-check",
            "generate_report": "/api/generate-report",
            "advisory_crops": "/api/v1/advisory/crops",
            "advisory_evaluate": "/api/v1/advisory/evaluate",
        },
        "status": "operational",
    }

@app.get("/health", response_model=HealthResponse, tags=["Root"])
async def root_health():
    """Direct root health check endpoint"""
    return HealthResponse(
        status="ok",
        app="Krishi Bondhu Agro-Advisory API",
        version="0.1.0-mvp",
        timestamp=datetime.now(timezone.utc),
        active_services=[
            "soil_telemetry",
            "microclimate_diagnostic",
            "crop_advisory_pipeline",
            "foliar_disease_detection",
            "multimodal_treatment_reasoning",
        ],
    )

