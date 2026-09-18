import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_predatory_pricing_detection():
    """
    Test predatory pricing detection when middleman significantly underbids.
    Historical Aman Rice wholesale price is ~34.5 BDT/kg.
    Offered price of 22.0 BDT/kg is >35% below mean (severe Z-score outlier).
    """
    payload = {
        "crop_type": "Aman Rice",
        "harvested_volume_kg": 1500.0,
        "offered_price_per_kg": 22.0,
    }

    response = client.post("/api/price-check", json=payload)
    assert response.status_code == 200, f"Failed: {response.text}"
    data = response.json()

    # Verify prompt required return structure:
    # { is_predatory_price: bool, price_deviation_percent, volatility_score,
    #   recommended_selling_window, historical_price_chart_data }
    assert "is_predatory_price" in data
    assert "price_deviation_percent" in data
    assert "volatility_score" in data
    assert "recommended_selling_window" in data
    assert "historical_price_chart_data" in data

    # Predatory verification
    assert data["is_predatory_price"] is True
    assert data["price_deviation_percent"] < -20.0
    assert data["z_score"] <= -1.5
    assert data["volatility_score"] > 0.0

    # Selling window recommendation verification
    selling_window = data["recommended_selling_window"]
    if isinstance(selling_window, dict):
        assert "optimal_window" in selling_window
        assert "action_advice" in selling_window
    elif isinstance(selling_window, str):
        assert len(selling_window) > 0

    # Chart points verification
    chart_data = data["historical_price_chart_data"]
    assert len(chart_data) == 30
    assert "price_per_kg" in chart_data[0]
    assert "date" in chart_data[0]
    assert "offered_price" in chart_data[0]
    assert chart_data[0]["offered_price"] == 22.0

    print("[PASS] test_predatory_pricing_detection passed successfully!")


def test_fair_market_pricing():
    """
    Test normal wholesale pricing within standard deviation of historical mean.
    Aman rice ~35 BDT/kg should NOT be flagged as predatory.
    """
    payload = {
        "crop_type": "Aman Rice",
        "harvested_volume_kg": 2000.0,
        "offered_price_per_kg": 35.0,
    }

    response = client.post("/api/price-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_predatory_price"] is False
    assert abs(data["price_deviation_percent"]) < 10.0
    print("[PASS] test_fair_market_pricing passed successfully!")


def test_premium_pricing():
    """
    Test above-market premium wholesale offer.
    """
    payload = {
        "crop_type": "Potato (Diamant Variety)",
        "harvested_volume_kg": 800.0,
        "offered_price_per_kg": 40.0,
    }

    response = client.post("/api/price-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_predatory_price"] is False
    assert data["price_deviation_percent"] > 0
    print("[PASS] test_premium_pricing passed successfully!")


def test_v1_endpoint_alias():
    """
    Test that /api/v1/price-check works as an alias to /api/price-check.
    """
    payload = {
        "crop_type": "Wheat",
        "harvested_volume_kg": 500.0,
        "offered_price_per_kg": 39.5,
    }

    response = client.post("/api/v1/price-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop_type"] == "wheat"
    print("[PASS] test_v1_endpoint_alias passed successfully!")


def test_validation_constraints():
    """
    Test validation errors on non-positive volume or price.
    """
    invalid_volume = {
        "crop_type": "Onion",
        "harvested_volume_kg": -10.0,
        "offered_price_per_kg": 50.0,
    }
    res = client.post("/api/price-check", json=invalid_volume)
    assert res.status_code == 422

    invalid_price = {
        "crop_type": "Onion",
        "harvested_volume_kg": 100.0,
        "offered_price_per_kg": 0.0,
    }
    res2 = client.post("/api/price-check", json=invalid_price)
    assert res2.status_code == 422
    print("[PASS] test_validation_constraints passed successfully!")


def test_all_crop_catalog():
    """
    Test that all supported crops in the mock dataset evaluate without error.
    """
    crops = ["aman_rice", "potato", "tomato", "onion", "green_chilli", "wheat"]
    for crop in crops:
        payload = {
            "crop_type": crop,
            "harvested_volume_kg": 100.0,
            "offered_price_per_kg": 30.0,
        }
        res = client.post("/api/price-check", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data["historical_price_chart_data"]) == 30

    print("[PASS] test_all_crop_catalog passed successfully for all crops!")


if __name__ == "__main__":
    test_predatory_pricing_detection()
    test_fair_market_pricing()
    test_premium_pricing()
    test_v1_endpoint_alias()
    test_validation_constraints()
    test_all_crop_catalog()
    print("\nAll Price Check tests completed successfully!")
