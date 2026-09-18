from .health import router as health_router
from .advisory import router as advisory_router
from .voice_intake import router as voice_router
from .disease import router as disease_router
from .treatment import router as treatment_router
from .market import router as market_router
from .report import router as report_router

__all__ = [
    "health_router",
    "advisory_router",
    "voice_router",
    "disease_router",
    "treatment_router",
    "market_router",
    "report_router",
]


