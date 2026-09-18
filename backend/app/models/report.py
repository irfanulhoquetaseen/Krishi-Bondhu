from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .voice import FarmerQueryExtraction
from .disease import DiseaseDetectionResponse
from .treatment import TreatmentPlanResponse
from .market import PriceCheckResponse


class ReportGenerationRequest(BaseModel):
    """
    Consolidated multimodal input for the Digital Crop Passport & Audio Advisory.
    Fuses Voice Intake (Task 1), Disease Detection (Task 2), Treatment Plan (Task 3),
    and Price Check (Task 4).
    """
    voice_intake: Optional[FarmerQueryExtraction] = Field(
        default=None,
        description="Structured agronomic parameters extracted from farmer voice intake"
    )
    disease_detection: Optional[DiseaseDetectionResponse] = Field(
        default=None,
        description="Pathology diagnosis result from foliar computer vision model"
    )
    treatment_plan: Optional[TreatmentPlanResponse] = Field(
        default=None,
        description="Authoritative multimodal agronomic treatment plan"
    )
    price_analysis: Optional[PriceCheckResponse] = Field(
        default=None,
        description="Market price anomaly check and 7-day selling window recommendation"
    )
    crop_image_base64: Optional[str] = Field(
        default=None,
        description="Uploaded crop leaf image in base64 format (with or without data:image prefix)"
    )
    farmer_name: Optional[str] = Field(
        default="মো: রফিকুল ইসলাম (Md. Rafiqul Islam)",
        description="Registered farmer name"
    )
    farmer_phone: Optional[str] = Field(
        default="+880 1712-345678",
        description="Farmer contact phone number"
    )
    district_name: Optional[str] = Field(
        default="Godagari, Rajshahi",
        description="Administrative district or Upazila"
    )
    plot_id: Optional[str] = Field(
        default="KB-PLOT-RAJ-04",
        description="Agricultural plot or field station identifier"
    )


class ReportGenerationResponse(BaseModel):
    """
    Consolidated digital crop passport & audio advisory response.
    """
    passport_id: str = Field(
        ...,
        description="Unique digital crop passport identifier (e.g. KB-PASSPORT-2026-9842)"
    )
    created_at: str = Field(
        ...,
        description="ISO timestamp of passport generation"
    )
    crop_type: str = Field(
        ...,
        description="Crop variety name"
    )
    farmer_name: str = Field(
        ...,
        description="Farmer name"
    )
    district_name: str = Field(
        ...,
        description="District or field location"
    )
    risk_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Overall composite agronomic risk score (0-100)"
    )
    risk_level: str = Field(
        ...,
        description="Categorical risk tier: Low, Moderate, High, Critical"
    )
    bengali_audio_summary: str = Field(
        ...,
        description="Conversational Bengali summary of critical treatment steps and market advice"
    )
    audio_base64: str = Field(
        ...,
        description="Base64 encoded WAV audio stream generated via Gemini native TTS"
    )
    audio_format: str = Field(
        default="audio/wav",
        description="MIME format of audio stream"
    )
    audio_error: Optional[str] = Field(
        default=None,
        description="Diagnostic error message if TTS synthesis failed"
    )
    pdf_base64: str = Field(
        ...,
        description="Base64 encoded printable PDF Field Health Card document"
    )
    pdf_filename: str = Field(
        ...,
        description="Standard filename for saving the Field Health Card PDF"
    )
    summary_highlights: List[str] = Field(
        default_factory=list,
        description="Key diagnostic and treatment highlights"
    )
    whatsapp_share_text: str = Field(
        ...,
        description="Pre-formatted WhatsApp share message with advisory details and link"
    )
    source: str = Field(
        default="krishi-bondhu-passport-engine",
        description="Originating engine and pipeline version"
    )
    processing_time_ms: float = Field(
        default=0.0,
        description="Total synthesis latency in milliseconds"
    )
