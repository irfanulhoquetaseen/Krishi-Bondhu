from fastapi import APIRouter, HTTPException, status
from ..models.treatment import TreatmentPlanRequest, TreatmentPlanResponse
from ..services.treatment_service import TreatmentService

router = APIRouter(tags=["Multimodal Agronomic Reasoning"])

@router.post(
    "/treatment-plan",
    response_model=TreatmentPlanResponse,
    summary="Generate Multimodal Agronomic Treatment Plan",
    description=(
        "Fuses symptom profile (Task 1), foliar disease vision output (Task 2), "
        "and real-time OpenWeatherMap microclimate data. Invokes Krishi Bondhu Agro AI with an agronomist persona "
        "to synthesize root cause, tiered organic & chemical treatment plans, safety precautions, "
        "and spray scheduling advice. Enforces mandatory warning if rain is forecast within 6 hours."
    ),
)
async def generate_treatment_plan(request: TreatmentPlanRequest):
    """
    Synthesizes farmer voice query extraction, vision pathology detection,
    and field microclimate forecast into an authoritative agronomic treatment plan.
    """
    try:
        plan = TreatmentService.generate_treatment_plan(request)
        return plan
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agronomic reasoning engine error: {str(exc)}",
        )
