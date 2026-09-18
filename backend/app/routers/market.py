from fastapi import APIRouter, HTTPException, status
from ..models.market import PriceCheckRequest, PriceCheckResponse
from ..services.market_service import MarketService

router = APIRouter(tags=["Yield Risk & Market Price Anomaly Detection"])


@router.post(
    "/price-check",
    response_model=PriceCheckResponse,
    summary="Evaluate Crop Price Anomaly and Optimal Selling Window",
    description=(
        "Accepts crop type, harvested volume in kg, and offered price per kg from middlemen/brokers. "
        "Evaluates the price against 30-day historical wholesale benchmark prices using Z-score anomaly "
        "detection to flag predatory underbidding, measures price volatility, and formulates an optimal "
        "7-day selling window recommendation."
    ),
)
async def check_price_anomaly(request: PriceCheckRequest):
    """
    Evaluates farmer-offered crop price against 30-day regional wholesale dataset
    using statistical Z-score anomaly detection and returns market advisory.
    """
    try:
        result = MarketService.evaluate_price(request)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Market price anomaly detection error: {str(exc)}",
        )
