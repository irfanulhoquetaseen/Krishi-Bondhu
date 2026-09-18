from pydantic import BaseModel, Field
from typing import Optional

class FarmerQueryExtraction(BaseModel):
    """
    Structured agronomic parameters extracted from farmer speech or text.
    """
    crop_type: str = Field(
        ...,
        description="Identified crop variety (e.g. Aman Rice, Boro Rice, Potato, Jute, Mustard)"
    )
    planting_date_estimate: Optional[str] = Field(
        default=None,
        description="Estimated planting, sowing, or transplanting timeline (e.g. '20 days ago', 'early Bhadra')"
    )
    damage_description: str = Field(
        ...,
        description="Clinical or vernacular description of leaf spots, fungal blast, pest infestation, or wilting"
    )
    geographic_union: Optional[str] = Field(
        default=None,
        description="Union, Upazila, or District identified from speech (e.g. Godagari, Rajshahi)"
    )
    language_detected: str = Field(
        ...,
        description="Detected spoken language: 'bn' (Bengali) or 'en' (English)"
    )

class VoiceIntakeResponse(BaseModel):
    """
    Consolidated response containing raw transcript and structured extraction.
    """
    success: bool = True
    audio_filename: Optional[str] = None
    raw_transcript: str
    extracted_data: FarmerQueryExtraction
    processing_time_ms: float
    source: str = Field(
        default="krishi-bondhu-voice-ai",
        description="Inference source indicator"
    )
    message: Optional[str] = None

class ManualTextIntakeRequest(BaseModel):
    """
    Fallback request for manual typed/pasted query text.
    """
    query_text: str = Field(..., min_length=3, description="Vernacular Bangla or English query")
    farmer_id: Optional[str] = Field(default="demo-farmer")
