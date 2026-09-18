from pydantic import BaseModel, Field
from typing import Literal, Optional

class DiseaseDetectionResponse(BaseModel):
    """
    Structured diagnosis response from the plant pathologist vision model.
    """
    disease_name: str = Field(
        ...,
        description="Identified botanical disease name (e.g. 'Rice Leaf Blast (Magnaporthe oryzae)') or 'Uncertain — Recommend Manual Inspection'"
    )
    confidence_note: str = Field(
        ...,
        description="Pathologist diagnostic confidence evaluation and key visual markers observed"
    )
    diagnostic_reasoning: Optional[str] = Field(
        default=None,
        description="Detailed visual reasoning explaining why this specific disease was identified based on visible symptoms (lesions, halos, sporulation, margins)"
    )
    severity_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Estimated percentage of foliar/plant tissue affected by the pathogen (0-100%)"
    )
    severity_class: Literal["Mild", "Moderate", "Severe", "Critical"] = Field(
        ...,
        description="Categorical damage severity rating"
    )
    affected_area_description: str = Field(
        ...,
        description="Clinical description of the leaf blade, midrib, sheath, or stem regions affected"
    )
    processing_time_ms: float = Field(
        default=0.0,
        description="Total diagnostic inference latency in milliseconds"
    )
    source: str = Field(
        default="krishi-bondhu-vision-ai",
        description="Inference provider information"
    )
