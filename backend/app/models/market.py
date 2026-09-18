from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union


class PriceCheckRequest(BaseModel):
    """
    Input schema for farmer price check verification.
    """
    crop_type: str = Field(
        ...,
        description="Name or variety of crop (e.g., 'Aman Rice', 'Potato', 'Tomato', 'Onion', 'Green Chilli')"
    )
    harvested_volume_kg: float = Field(
        ...,
        gt=0,
        description="Total volume of harvested crop in kilograms (e.g., 1200.0 kg)"
    )
    offered_price_per_kg: float = Field(
        ...,
        gt=0,
        description="Wholesale price offered by local middleman / farias in BDT per kg"
    )


class HistoricalPricePoint(BaseModel):
    date: str = Field(..., description="Calendar date (YYYY-MM-DD) or day label")
    day_number: int = Field(..., description="Day index from 1 to 30")
    price_per_kg: float = Field(..., description="Wholesale benchmark price in BDT/kg")
    min_price: float = Field(..., description="Daily lowest wholesale transaction in BDT/kg")
    max_price: float = Field(..., description="Daily highest wholesale transaction in BDT/kg")
    offered_price: Optional[float] = Field(
        default=None,
        description="Farmer's offered price plotted for direct visual comparison"
    )


class SellingWindowRecommendation(BaseModel):
    optimal_window: str = Field(
        ...,
        description="Optimal 7-day selling time frame (e.g., 'Days 4 to 7 (Optimal: Upcoming Friday Haat)')"
    )
    trend_direction: str = Field(
        ...,
        description="Market momentum trajectory ('Bullish / Rising', 'Stable', 'Bearish / Softening')"
    )
    expected_price_range: str = Field(
        ...,
        description="Projected wholesale price range (e.g., '৳35.5 - ৳37.2 / kg')"
    )
    action_advice: str = Field(
        ...,
        description="Strategic advisory on whether to hold, pool, or sell immediately"
    )
    estimated_additional_earnings_bdt: float = Field(
        default=0.0,
        description="Estimated earnings gain if farmer waits for the optimal window rather than accepting predatory offer"
    )


class PriceCheckResponse(BaseModel):
    """
    Core schema adhering strictly to prompt requirements:
    { is_predatory_price: bool, price_deviation_percent, volatility_score,
      recommended_selling_window, historical_price_chart_data }
    """
    is_predatory_price: bool = Field(
        ...,
        description="True if offered price is abnormally lower than historical mean (Z <= -1.5 or severe downward deviation)"
    )
    price_deviation_percent: float = Field(
        ...,
        description="Percentage difference of offered price vs 30-day historical mean (e.g., -28.4% or +4.2%)"
    )
    volatility_score: float = Field(
        ...,
        description="Price volatility index (0.0 to 1.0) derived from 30-day coefficient of variation"
    )
    recommended_selling_window: Union[SellingWindowRecommendation, str] = Field(
        ...,
        description="Recommended 7-day selling schedule and market trajectory"
    )
    historical_price_chart_data: List[HistoricalPricePoint] = Field(
        ...,
        description="30-day daily wholesale price series for Recharts line chart visualization"
    )

    # Detailed financial & statistical telemetry
    crop_type: str = Field(..., description="Identified standard crop category")
    crop_display_name: str = Field(..., description="Full crop variety display title")
    harvested_volume_kg: float = Field(..., description="Batch weight in kg")
    offered_price_per_kg: float = Field(..., description="Farmer's offered unit price (BDT/kg)")
    historical_mean_price_per_kg: float = Field(..., description="30-day average wholesale benchmark price (BDT/kg)")
    historical_std_dev: float = Field(..., description="Standard deviation of 30-day wholesale prices")
    z_score: float = Field(..., description="Statistical Z-score of the offered price")
    anomaly_status: str = Field(..., description="Plain-language status classification")
    offered_total_value_bdt: float = Field(..., description="Gross revenue offered for the batch")
    fair_market_total_value_bdt: float = Field(..., description="Fair market value of the batch based on historical mean")
    estimated_financial_loss_bdt: float = Field(..., description="Revenue lost to middleman arbitrage if offered price is predatory")
