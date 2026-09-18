import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_treatment_plan_clear_weather():
    """
    Verifies treatment plan generation under optimal clear weather conditions.
    """
    payload = {
        "symptom_profile": {
            "crop_type": "Aman Rice",
            "planting_date_estimate": "20 days ago (Active Tillering)",
            "damage_description": "Brown spindle lesions with necrotic centers on leaf blades and yellowing tips",
            "geographic_union": "Godagari, Rajshahi",
            "language_detected": "bn"
        },
        "vision_output": {
            "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
            "confidence_note": "High confidence (94%). Spindle lesions with gray centers observed.",
            "severity_percentage": 34.5,
            "severity_class": "Moderate",
            "affected_area_description": "Adaxial leaf blade surfaces and collar tissue compromised."
        },
        "location": {
            "district_name": "Rajshahi",
            "latitude": 24.3636,
            "longitude": 88.6241
        },
        "force_rain_scenario": False
    }

    response = client.post("/api/treatment-plan", json=payload)
    assert response.status_code == 200, f"Error {response.status_code}: {response.text}"
    data = response.json()

    # Verify all required schema keys from prompt specifications
    assert "root_cause_explanation" in data and len(data["root_cause_explanation"]) > 20
    assert "organic_treatment_steps" in data and isinstance(data["organic_treatment_steps"], list)
    assert len(data["organic_treatment_steps"]) >= 2

    assert "chemical_treatment" in data
    chem = data["chemical_treatment"]
    assert "name" in chem and len(chem["name"]) > 0
    assert "dosage" in chem and len(chem["dosage"]) > 0
    assert "pre_harvest_interval" in chem and len(chem["pre_harvest_interval"]) > 0

    assert "safety_precautions" in data and isinstance(data["safety_precautions"], list)
    assert len(data["safety_precautions"]) >= 2

    assert "spray_schedule_advice" in data and len(data["spray_schedule_advice"]) > 0

    # Weather checks: Clear weather should not forbid spraying
    assert data.get("rain_within_6h") is False
    assert data.get("spray_warning_active") is False
    assert "Optimal Spray Window" in data["spray_schedule_advice"] or "morning" in data["spray_schedule_advice"].lower()

    print("[PASS] test_treatment_plan_clear_weather passed successfully!")

def test_treatment_plan_rain_warning_enforced():
    """
    CRITICAL RULE: If weather forecast shows rain within 6 hours,
    the advice must explicitly warn against spraying now.
    """
    payload = {
        "symptom_profile": {
            "crop_type": "Aman Rice",
            "damage_description": "Foliar blast lesions spreading across tillers",
            "geographic_union": "Rajshahi",
            "language_detected": "bn"
        },
        "vision_output": {
            "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
            "confidence_note": "Pathology match confirmed",
            "severity_percentage": 42.0,
            "severity_class": "Severe",
            "affected_area_description": "Upper canopy blades showing coalescing blast spots"
        },
        "location": {
            "district_name": "Rajshahi"
        },
        "force_rain_scenario": True  # Force rain within 6h
    }

    response = client.post("/api/treatment-plan", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify rain flags
    assert data.get("rain_within_6h") is True
    assert data.get("spray_warning_active") is True

    # Check explicit spray prohibition in spray_schedule_advice
    advice = data.get("spray_schedule_advice", "")
    assert "DO NOT SPRAY NOW" in advice or "do not spray" in advice.lower(), (
        f"Expected explicit warning against spraying in advice, got: {advice}"
    )

    print("[PASS] test_treatment_plan_rain_warning_enforced passed successfully!")

def test_treatment_plan_v1_alias():
    payload = {
        "district_name": "Rangpur",
        "force_rain_scenario": False
    }
    response = client.post("/api/v1/treatment-plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "chemical_treatment" in data
    assert "root_cause_explanation" in data
    print("[PASS] test_treatment_plan_v1_alias passed successfully!")

def test_weather_service_direct():
    from app.services.weather_service import WeatherService
    # Test rain scenario
    rain_report = WeatherService.fetch_weather(district_name="Rajshahi", force_rain_scenario=True)
    assert rain_report.rain_expected_6h is True
    assert rain_report.rainfall_mm > 0.0

    # Test clear scenario
    dry_report = WeatherService.fetch_weather(district_name="Jessore", force_rain_scenario=False)
    assert dry_report.rain_expected_6h is False
    assert dry_report.rainfall_mm == 0.0
    print("[PASS] test_weather_service_direct passed successfully!")


if __name__ == "__main__":
    test_weather_service_direct()
    test_treatment_plan_clear_weather()
    test_treatment_plan_rain_warning_enforced()
    test_treatment_plan_v1_alias()
    print("All treatment plan tests passed!")
