import uuid
from datetime import datetime, timezone
from typing import List
from ..models.advisory import AdvisoryRequest, AdvisoryResponse, ActionItem

class AdvisoryService:
    """
    Core business logic and algorithmic evaluation layer for Krishi Bondhu.
    Ready for AI/ML inference, RAG, and agricultural decision trees in subsequent phases.
    """

    @staticmethod
    def generate_advisory(request: AdvisoryRequest) -> AdvisoryResponse:
        request_id = f"KB-{uuid.uuid4().hex[:8].upper()}"
        
        # Rule-based advisory fallback placeholder for the foundation phase
        actions: List[ActionItem] = []
        
        moisture = request.soil_metrics.moisture_percentage if request.soil_metrics else 42.0
        ph = request.soil_metrics.ph if request.soil_metrics else 6.5
        
        # Moisture check
        if moisture < 35.0:
            actions.append(
                ActionItem(
                    category="Water",
                    instruction=f"Immediate controlled irrigation advised for {request.crop_type}. Soil moisture below optimal threshold (current: {moisture:.1f}%).",
                    urgency="High",
                    dosage_or_rate="25-30 mm depth in early morning hours",
                )
            )
        else:
            actions.append(
                ActionItem(
                    category="Water",
                    instruction=f"Moisture levels nominal at {moisture:.1f}%. Hold irrigation for next 48 hours.",
                    urgency="Low",
                    dosage_or_rate="Monitoring only",
                )
            )
            
        # pH / Soil Health Check
        if ph < 6.0:
            actions.append(
                ActionItem(
                    category="Nutrient",
                    instruction="Mild soil acidity detected. Plan dolomitic limestone dressing post-tillering.",
                    urgency="Medium",
                    dosage_or_rate="150 kg/acre split application",
                )
            )
        else:
            actions.append(
                ActionItem(
                    category="Nutrient",
                    instruction="Maintain standard nitrogen-potassium balanced top dressing for vegetative vigour.",
                    urgency="Medium",
                    dosage_or_rate="Standard extension protocol",
                )
            )

        # Baseline response
        return AdvisoryResponse(
            advisory_id=request_id,
            timestamp=datetime.now(timezone.utc),
            crop_type=request.crop_type,
            region=request.region,
            risk_level="Moderate" if moisture < 35.0 else "Low",
            summary=f"Synthesized agronomic evaluation for {request.crop_type} in {request.region} across current soil and microclimatic metrics.",
            action_items=actions,
            telemetry_snapshot={
                "soil_moisture_pct": moisture,
                "soil_ph": ph,
                "growth_stage": request.growth_stage,
                "telemetry_status": "synced",
            },
            next_check_in_days=3,
        )
