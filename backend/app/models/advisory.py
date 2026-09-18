from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SoilMetrics(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH level")
    nitrogen_ppm: float = Field(..., ge=0.0, description="Nitrogen content (mg/kg)")
    phosphorus_ppm: float = Field(..., ge=0.0, description="Phosphorus content (mg/kg)")
    potassium_ppm: float = Field(..., ge=0.0, description="Potassium content (mg/kg)")
    moisture_percentage: float = Field(..., ge=0.0, le=100.0, description="Soil moisture level percentage")
    organic_matter_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)

class WeatherContext(BaseModel):
    temperature_c: float = Field(..., description="Current ambient temperature in Celsius")
    humidity_percentage: float = Field(..., ge=0.0, le=100.0, description="Relative humidity")
    rainfall_mm: float = Field(default=0.0, ge=0.0, description="Recent 24h precipitation")
    forecast_condition: Optional[str] = Field(default=None, description="e.g. Humid, Clear, Pre-Monsoon Showers")

class AdvisoryRequest(BaseModel):
    farmer_id: Optional[str] = Field(default="demo-farmer-01")
    region: str = Field(..., description="Agricultural division / district (e.g. Rajshahi, Rangpur, Jessore)")
    crop_type: str = Field(..., description="Crop name (e.g. Aman Rice, Boro Rice, Jute, Potato, Mustard)")
    growth_stage: str = Field(..., description="Stage of crop lifecycle (e.g. Tillering, Flowering, Tuber Formation)")
    soil_metrics: Optional[SoilMetrics] = None
    weather: Optional[WeatherContext] = None
    symptoms_observed: Optional[List[str]] = Field(default_factory=list)
    query_notes: Optional[str] = None

class ActionItem(BaseModel):
    category: str = Field(..., description="Nutrient, Water, Disease, Pest, or Harvest")
    instruction: str
    urgency: str = Field(..., description="High, Medium, or Low")
    dosage_or_rate: Optional[str] = None

class AdvisoryResponse(BaseModel):
    advisory_id: str
    timestamp: datetime
    crop_type: str
    region: str
    risk_level: str = Field(..., description="Low, Moderate, High, Severe")
    summary: str
    action_items: List[ActionItem]
    telemetry_snapshot: Dict[str, Any]
    next_check_in_days: int

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    timestamp: datetime
    active_services: List[str]
