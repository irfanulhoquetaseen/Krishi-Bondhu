from fastapi import APIRouter, HTTPException, status
from ..models.advisory import AdvisoryRequest, AdvisoryResponse
from ..services.advisory_service import AdvisoryService

router = APIRouter(prefix="/advisory", tags=["Agro Advisory"])

@router.post("/evaluate", response_model=AdvisoryResponse)
async def evaluate_field_advisory(request: AdvisoryRequest):
    """
    Evaluates field telemetry and returns agronomic guidance recommendations.
    """
    try:
        advisory = AdvisoryService.generate_advisory(request)
        return advisory
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Advisory calculation failed: {str(exc)}",
        )

@router.get("/crops", response_model=dict)
async def list_supported_crops():
    """
    Returns supported agricultural commodities and growth stages.
    """
    return {
        "supported_crops": [
            {"id": "rice_aman", "name": "Aman Rice", "stages": ["Seedbed", "Tillering", "Panicle Initiation", "Flowering", "Maturity"]},
            {"id": "rice_boro", "name": "Boro Rice", "stages": ["Transplanting", "Tillering", "Booting", "Ripening"]},
            {"id": "jute", "name": "Jute", "stages": ["Germination", "Vegetative Growth", "Fiber Maturation"]},
            {"id": "potato", "name": "Potato", "stages": ["Sprouting", "Vegetative", "Tuber Initiation", "Bulking"]},
            {"id": "mustard", "name": "Mustard", "stages": ["Seedling", "Rosette", "Flowering", "Pod Filling"]},
        ],
        "active_regions": ["Rajshahi", "Rangpur", "Jessore", "Mymensingh", "Barisal", "Sylhet", "Chattogram"],
    }
