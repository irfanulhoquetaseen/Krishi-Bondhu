from .advisory import (
    SoilMetrics,
    WeatherContext,
    AdvisoryRequest,
    ActionItem,
    AdvisoryResponse,
    HealthResponse,
)
from .voice import (
    FarmerQueryExtraction,
    VoiceIntakeResponse,
    ManualTextIntakeRequest,
)

from .disease import DiseaseDetectionResponse
from .treatment import (
    ChemicalTreatment,
    LocationInput,
    TreatmentPlanRequest,
    TreatmentPlanResponse,
)

__all__ = [
    "SoilMetrics",
    "WeatherContext",
    "AdvisoryRequest",
    "ActionItem",
    "AdvisoryResponse",
    "HealthResponse",
    "FarmerQueryExtraction",
    "VoiceIntakeResponse",
    "ManualTextIntakeRequest",
    "DiseaseDetectionResponse",
    "ChemicalTreatment",
    "LocationInput",
    "TreatmentPlanRequest",
    "TreatmentPlanResponse",
    "ReportGenerationRequest",
    "ReportGenerationResponse",
]
from .report import ReportGenerationRequest, ReportGenerationResponse
