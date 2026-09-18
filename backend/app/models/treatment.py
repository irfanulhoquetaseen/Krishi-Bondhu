from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .voice import FarmerQueryExtraction
from .disease import DiseaseDetectionResponse

class ChemicalTreatment(BaseModel):
    name: str = Field(..., description="Active chemical compound or trade formulation (e.g. Tricyclazole 75 WP)")
    dosage: str = Field(..., description="Precise formulation dosage per liter of water and recommended application volume")
    pre_harvest_interval: str = Field(
        ...,
        description="Mandatory waiting period (PHI in days) between chemical spraying and safe crop harvest"
    )

class LocationInput(BaseModel):
    district_name: Optional[str] = Field(default=None, description="District or Upazila name in Bangladesh (e.g. Rajshahi, Rangpur, Jessore)")
    latitude: Optional[float] = Field(default=None, description="GPS latitude coordinate")
    longitude: Optional[float] = Field(default=None, description="GPS longitude coordinate")

class TreatmentPlanRequest(BaseModel):
    """
    Multimodal request fusing voice intake (Task 1), vision disease diagnosis (Task 2),
    and field location coordinates or district name.
    """
    symptom_profile: Optional[FarmerQueryExtraction] = Field(
        default=None,
        description="Structured agronomic parameters extracted from farmer voice intake"
    )
    vision_output: Optional[DiseaseDetectionResponse] = Field(
        default=None,
        description="Pathology diagnosis result from foliar computer vision model"
    )
    location: Optional[LocationInput] = Field(
        default=None,
        description="Agricultural geographic coordinates or administrative district"
    )
    # Direct top-level location helpers for convenience
    district_name: Optional[str] = Field(default=None, description="District name fallback")
    latitude: Optional[float] = Field(default=None, description="Latitude fallback")
    longitude: Optional[float] = Field(default=None, description="Longitude fallback")
    
    # Simulation / testing override
    force_rain_scenario: Optional[bool] = Field(
        default=None,
        description="Optional toggle to simulate imminent rainfall (<6h) for testing spray advisory warnings"
    )

class TreatmentPlanResponse(BaseModel):
    """
    Structured agronomic treatment plan conforming to the requested schema:
    { root_cause_explanation, organic_treatment_steps[], chemical_treatment:
    { name, dosage, pre_harvest_interval }, safety_precautions[], spray_schedule_advice }
    """
    root_cause_explanation: str = Field(
        ...,
        description="Agronomic and physiological explanation of pathogen infection, environmental drivers, and host vulnerability"
    )
    organic_treatment_steps: List[str] = Field(
        ...,
        description="Tiered biological, organic, and non-chemical cultural control practices"
    )
    chemical_treatment: ChemicalTreatment = Field(
        ...,
        description="Targeted chemical fungicide, bactericide, or pesticide protocol"
    )
    safety_precautions: List[str] = Field(
        ...,
        description="Essential safety warnings, PPE guidelines, and ecological protection measures"
    )
    spray_schedule_advice: str = Field(
        ...,
        description="Actionable spray timing window; explicitly warns against spraying if rain is forecast within 6 hours"
    )
    
    # Enriched diagnostic telemetry for UI presentation
    rain_within_6h: bool = Field(
        default=False,
        description="Indicates whether precipitation is forecast within the next 6-hour operational window"
    )
    spray_warning_active: bool = Field(
        default=False,
        description="True when spraying is prohibited due to rain forecast or adverse weather"
    )
    weather_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Real-time microclimate snapshot from OpenWeatherMap"
    )
    source: str = Field(
        default="krishi-bondhu-agro-ai",
        description="Reasoning engine inference provider"
    )
    processing_time_ms: float = Field(
        default=0.0,
        description="End-to-end reasoning engine latency in milliseconds"
    )
