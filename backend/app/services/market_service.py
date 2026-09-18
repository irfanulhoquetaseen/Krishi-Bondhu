import json
import statistics
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Tuple, List

from ..models.market import (
    PriceCheckRequest,
    PriceCheckResponse,
    HistoricalPricePoint,
    SellingWindowRecommendation,
)


class MarketService:
    _data_cache: Dict[str, Any] = {}

    @classmethod
    def _load_historical_dataset(cls) -> Dict[str, Any]:
        """Loads and caches the 30-day mock historical wholesale price dataset."""
        if cls._data_cache:
            return cls._data_cache

        data_path = Path(__file__).resolve().parent.parent / "data" / "historical_prices.json"
        if data_path.exists():
            with open(data_path, "r", encoding="utf-8") as f:
                cls._data_cache = json.load(f)
        else:
            cls._data_cache = {"crops": {}}
        return cls._data_cache

    @classmethod
    def match_crop(cls, input_crop: str) -> Tuple[str, Dict[str, Any]]:
        """
        Fuzzy matches user input crop against historical price datasets.
        Defaults to Aman Rice if unmatched.
        """
        dataset = cls._load_historical_dataset().get("crops", {})
        query = (input_crop or "").lower().strip()

        # 1. Direct key match
        if query in dataset:
            return query, dataset[query]

        # 2. Match aliases
        for crop_key, crop_meta in dataset.items():
            aliases = [a.lower() for a in crop_meta.get("aliases", [])]
            aliases.append(crop_meta.get("display_name", "").lower())
            for alias in aliases:
                if alias in query or query in alias:
                    return crop_key, crop_meta

        # 3. Substring tokens match
        tokens = query.replace("(", " ").replace(")", " ").split()
        for token in tokens:
            if len(token) < 3:
                continue
            for crop_key, crop_meta in dataset.items():
                aliases = [a.lower() for a in crop_meta.get("aliases", [])]
                if any(token in a for a in aliases):
                    return crop_key, crop_meta

        # Fallback to aman_rice if not found
        default_key = "aman_rice"
        return default_key, dataset.get(default_key, {
            "display_name": "Aman Rice (BRRI dhan49)",
            "unit": "BDT/kg",
            "historical_30_days": [
                {"day": i, "date_offset_days": - (30 - i), "price_per_kg": 32.0 + (i * 0.15), "min_price": 31.0 + (i * 0.15), "max_price": 33.0 + (i * 0.15)}
                for i in range(1, 31)
            ]
        })

    @classmethod
    def evaluate_price(cls, request: PriceCheckRequest) -> PriceCheckResponse:
        """
        Conducts Z-score anomaly detection, price volatility analysis,
        and optimal 7-day selling window formulation.
        """
        crop_key, crop_data = cls.match_crop(request.crop_type)
        display_name = crop_data.get("display_name", request.crop_type)
        raw_series: List[Dict[str, Any]] = crop_data.get("historical_30_days", [])

        # Anchor dates relative to today's date
        now = datetime.now()
        chart_points: List[HistoricalPricePoint] = []
        prices: List[float] = []

        for item in raw_series:
            day_num = item.get("day", len(chart_points) + 1)
            offset = item.get("date_offset_days", day_num - len(raw_series))
            point_date = (now + timedelta(days=offset)).strftime("%Y-%m-%d")
            price_val = float(item.get("price_per_kg", 30.0))
            min_val = float(item.get("min_price", price_val * 0.96))
            max_val = float(item.get("max_price", price_val * 1.04))

            prices.append(price_val)
            chart_points.append(
                HistoricalPricePoint(
                    date=point_date,
                    day_number=day_num,
                    price_per_kg=round(price_val, 2),
                    min_price=round(min_val, 2),
                    max_price=round(max_val, 2),
                    offered_price=round(request.offered_price_per_kg, 2),
                )
            )

        if not prices:
            prices = [32.0] * 30

        # Statistical Calculations
        historical_mean = statistics.mean(prices)
        historical_stdev = statistics.stdev(prices) if len(prices) > 1 else 1.0
        if historical_stdev == 0:
            historical_stdev = 0.5

        offered = float(request.offered_price_per_kg)
        volume = float(request.harvested_volume_kg)

        # Z-score computation
        z_score = (offered - historical_mean) / historical_stdev
        price_deviation_percent = ((offered - historical_mean) / historical_mean) * 100.0

        # Volatility Score: Normalized Coefficient of Variation (sigma / mu)
        coeff_of_variation = historical_stdev / historical_mean
        volatility_score = round(min(max(coeff_of_variation, 0.01), 1.0), 3)

        # Anomaly Detection Logic (Predatory Pricing)
        # Flag if offered_price deviates significantly below the historical mean
        # Criterion: Z <= -1.5 OR price deviation <= -16%
        is_predatory = bool(z_score <= -1.5 or price_deviation_percent <= -16.0)

        # Status categorization
        if is_predatory:
            if z_score <= -2.5 or price_deviation_percent <= -25.0:
                anomaly_status = "Critical Predatory Pricing (Exploitative Broker Offer)"
            else:
                anomaly_status = "Predatory Pricing Detected (Significant Downward Anomaly)"
        elif z_score < -0.8:
            anomaly_status = "Sub-Wholesale Marginal Offer"
        elif abs(z_score) <= 1.0:
            anomaly_status = "Fair Regional Wholesale Benchmark"
        else:
            anomaly_status = "Premium / High Wholesale Price"

        # Financial values
        offered_total_val = round(offered * volume, 2)
        fair_market_total_val = round(historical_mean * volume, 2)
        financial_loss = round(max(0.0, fair_market_total_val - offered_total_val), 2)

        # Analyze short-term historical trend (last 7 days vs previous 7 days)
        last_7_days = prices[-7:]
        prev_7_days = prices[-14:-7] if len(prices) >= 14 else prices[:7]
        avg_last_7 = statistics.mean(last_7_days)
        avg_prev_7 = statistics.mean(prev_7_days)
        trend_diff = avg_last_7 - avg_prev_7

        if trend_diff > 0.4:
            trend_direction = "Bullish / Upward Momentum (+৳{:.1f}/kg gain)".format(trend_diff)
        elif trend_diff < -0.4:
            trend_direction = "Softening / Increased Depot Arrivals (-৳{:.1f}/kg)".format(abs(trend_diff))
        else:
            trend_direction = "Stable Regional Wholesale Plateau"

        # Calculate optimal 7-day selling window recommendation
        rec_expected_min = round(max(historical_mean * 0.98, prices[-1] * 0.99), 1)
        rec_expected_max = round(max(historical_mean * 1.06, prices[-1] * 1.05), 1)
        expected_range_str = f"৳{rec_expected_min:.1f} - ৳{rec_expected_max:.1f} / kg"

        if is_predatory:
            optimal_window = "Days 3 to 6 (Target: Upcoming Regional Haat)"
            action_advice = (
                f"REJECT or renegotiate current offer of ৳{offered:.1f}/kg. "
                f"The offer is {abs(price_deviation_percent):.1f}% below fair wholesale value (Z={z_score:.2f}). "
                f"Holding harvest for 3 to 5 days and pooling at regional DAE collection centers "
                f"can recover an estimated ৳{financial_loss:,.0f} in lost margins."
            )
            est_gain = financial_loss
        elif z_score > 0.8:
            optimal_window = "Immediate (Days 1 to 2)"
            action_advice = (
                f"Accept offered price of ৳{offered:.1f}/kg. "
                f"Current offer provides a +{price_deviation_percent:.1f}% premium over 30-day wholesale baseline. "
                f"Lock in purchase contract before potential harvest influx softs depot prices."
            )
            est_gain = round((offered - historical_mean) * volume, 2)
        else:
            optimal_window = "Days 2 to 5 (Peak Wholesale Trading Window)"
            action_advice = (
                f"Offered price (৳{offered:.1f}/kg) is consistent with the 30-day regional wholesale mean (৳{historical_mean:.1f}/kg). "
                f"Proceed with transaction or stagger sales over the next 4 days."
            )
            est_gain = 0.0

        selling_window_rec = SellingWindowRecommendation(
            optimal_window=optimal_window,
            trend_direction=trend_direction,
            expected_price_range=expected_range_str,
            action_advice=action_advice,
            estimated_additional_earnings_bdt=est_gain,
        )

        return PriceCheckResponse(
            is_predatory_price=is_predatory,
            price_deviation_percent=round(price_deviation_percent, 2),
            volatility_score=volatility_score,
            recommended_selling_window=selling_window_rec,
            historical_price_chart_data=chart_points,
            crop_type=crop_key,
            crop_display_name=display_name,
            harvested_volume_kg=round(volume, 2),
            offered_price_per_kg=round(offered, 2),
            historical_mean_price_per_kg=round(historical_mean, 2),
            historical_std_dev=round(historical_stdev, 2),
            z_score=round(z_score, 2),
            anomaly_status=anomaly_status,
            offered_total_value_bdt=offered_total_val,
            fair_market_total_value_bdt=fair_market_total_val,
            estimated_financial_loss_bdt=financial_loss,
        )
