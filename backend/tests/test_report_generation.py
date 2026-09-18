import base64
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.services.audio_service import AudioAdvisoryService

client = TestClient(app)


def test_audio_service_text_cleansing_and_wav_conversion():
    """
    Verifies that AudioAdvisoryService cleans raw text, strips markdown,
    converts English terms/units to Bengali script, builds advisory prompts,
    and converts raw PCM to valid RIFF WAV containers.
    """
    raw_text = (
        "**আসসালামু আলাইকুম কৃষক ভাই**। আপনার Aman Rice ফসলে 12 kg সার দিন ও Blast রোগ হলে "
        "0.75 gm/l spray করুন! PHI সময় মেনে চলুন."
    )
    clean = AudioAdvisoryService.clean_bengali_tts_text(raw_text)

    # Markdown stripped
    assert "**" not in clean
    assert "*" not in clean

    # English terms converted
    assert "Aman Rice" not in clean
    assert "আমন ধান" in clean
    assert "কেজি" in clean
    assert "গ্রাম" in clean
    assert "লিটার" in clean
    assert "স্প্রে" in clean
    assert "ব্লাস্ট" in clean

    # Bengali numbers
    assert "১২" in clean
    assert "০.৭৫" in clean

    # Bengali Dari punctuation enforced
    assert clean.endswith("।")
    assert not clean.endswith(".")

    # Instructional TTS prompt construction
    prompt = AudioAdvisoryService.build_tts_prompt(clean)
    assert "clear, calm, natural spoken Bengali" in prompt
    assert clean in prompt

    # PCM to standard RIFF WAV conversion
    fake_pcm = b"\x00\x00\x05\x00\x0a\x00" * 100
    wav_bytes = AudioAdvisoryService.pcm_to_wav(fake_pcm, sample_rate=24000)
    assert wav_bytes.startswith(b"RIFF")
    assert b"WAVE" in wav_bytes[:16]

    print("[PASS] test_audio_service_text_cleansing_and_wav_conversion passed successfully!")


def test_generate_report_full_multimodal():
    """
    Verifies full end-to-end report generation fusing all 4 tasks:
    Voice Intake, Foliar Pathology Vision, Multimodal Treatment, and Market Price Anomaly,
    with Gemini native TTS returning synthesized speech.
    """
    # Create a small valid 1x1 png image base64
    tiny_png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    payload = {
        "voice_intake": {
            "crop_type": "Aman Rice",
            "planting_date_estimate": "25 days ago (Active Tillering)",
            "damage_description": "Brown spindle-shaped lesions on leaf blades with yellow margins",
            "geographic_union": "Godagari, Rajshahi",
            "language_detected": "bn",
        },
        "disease_detection": {
            "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
            "confidence_note": "Visual confirmation 94%. Spindle lesions with necrotic ash-gray centers.",
            "severity_percentage": 34.5,
            "severity_class": "Moderate",
            "affected_area_description": "Adaxial leaf surfaces and collar tissue compromised.",
            "processing_time_ms": 280.0,
            "source": "krishi-bondhu-vision-ai",
        },
        "treatment_plan": {
            "root_cause_explanation": "Fungal spore germination aggravated by prolonged high humidity (>85%) and nitrogen imbalance.",
            "organic_treatment_steps": [
                "Apply Trichoderma harzianum bio-fungicide formulation at 5g/L water in early morning.",
                "Drain excess standing water for 48 hours to aerate root-zone.",
                "Apply wood ash dusting (20 kg/acre) across the canopy.",
            ],
            "chemical_treatment": {
                "name": "Tricyclazole 75 WP",
                "dosage": "0.75 g / L water (approx 120 L / acre)",
                "pre_harvest_interval": "21 days mandatory (PHI)",
            },
            "safety_precautions": [
                "Wear personal protective mask and nitrile gloves.",
                "Avoid spraying within 10 meters of fish ponds.",
                "Always spray with wind at your back.",
            ],
            "spray_schedule_advice": "Optimal Spray Window: Apply between 6:30 AM - 8:30 AM before intense sun.",
            "rain_within_6h": False,
            "spray_warning_active": False,
        },
        "price_analysis": {
            "is_predatory_price": True,
            "price_deviation_percent": -27.9,
            "volatility_score": 0.32,
            "recommended_selling_window": {
                "optimal_window": "Days 4 to 7 (Upcoming Friday Haat)",
                "trend_direction": "Bullish / Rising",
                "expected_price_range": "৳34.5 - ৳36.8 / kg",
                "action_advice": "Hold grain; do not accept middleman offer below ৳32.0/kg.",
                "estimated_additional_earnings_bdt": 11400.0,
            },
            "historical_price_chart_data": [
                {"date": "2026-09-01", "day_number": 1, "price_per_kg": 33.5, "min_price": 32.0, "max_price": 35.0}
            ],
            "crop_type": "Aman Rice",
            "crop_display_name": "Aman Rice (BRRI dhan49)",
            "harvested_volume_kg": 1200.0,
            "offered_price_per_kg": 24.50,
            "historical_mean_price_per_kg": 34.00,
            "historical_std_dev": 2.15,
            "z_score": -4.42,
            "anomaly_status": "Severe Predatory Anomaly Detected",
            "offered_total_value_bdt": 29400.0,
            "fair_market_total_value_bdt": 40800.0,
            "estimated_financial_loss_bdt": 11400.0,
        },
        "crop_image_base64": f"data:image/png;base64,{tiny_png_b64}",
        "farmer_name": "মো: রফিকুল ইসলাম (Md. Rafiqul Islam)",
        "district_name": "Godagari, Rajshahi",
        "plot_id": "KB-PLOT-RAJ-04",
    }

    # Generate a valid simulated RIFF WAV header
    fake_wav_bytes = AudioAdvisoryService.pcm_to_wav(b"\x00\x00" * 400)
    fake_wav_b64 = base64.b64encode(fake_wav_bytes).decode("utf-8")

    with patch.object(AudioAdvisoryService, "synthesize_speech_base64", return_value=(fake_wav_b64, None)):
        res = client.post("/api/generate-report", json=payload)
        assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
        data = res.json()

        # 1. Passport identification
        assert "passport_id" in data
        assert data["passport_id"].startswith("KB-PASSPORT-")
        assert "created_at" in data

        # 2. Risk scoring
        assert "risk_score" in data
        assert 0.0 <= data["risk_score"] <= 100.0
        assert data["risk_level"] in ["Low", "Moderate", "High", "Critical"]

        # 3. Bengali audio briefing text
        assert "bengali_audio_summary" in data
        assert len(data["bengali_audio_summary"]) > 50
        assert any("\u0980" <= c <= "\u09ff" for c in data["bengali_audio_summary"])

        # 4. Audio base64 stream and no error
        assert "audio_base64" in data
        assert len(data["audio_base64"]) > 500
        assert data.get("audio_error") is None
        audio_bytes = base64.b64decode(data["audio_base64"])
        assert audio_bytes.startswith(b"RIFF"), "Output audio must be a valid WAV document"

        # 5. PDF base64 printable document
        assert "pdf_base64" in data
        assert len(data["pdf_base64"]) > 1000
        pdf_bytes = base64.b64decode(data["pdf_base64"])
        assert pdf_bytes.startswith(b"%PDF-"), "Generated file must be a valid PDF"
        assert "pdf_filename" in data
        assert data["pdf_filename"].endswith(".pdf")

        # 6. WhatsApp share text
        assert "whatsapp_share_text" in data
        assert data["passport_id"] in data["whatsapp_share_text"]
        assert "কৃষি বন্ধু" in data["whatsapp_share_text"]

        # 7. Test PDF download by passport_id
        pdf_download_res = client.get(f"/api/download-report-pdf/{data['passport_id']}")
        assert pdf_download_res.status_code == 200
        assert pdf_download_res.headers["content-type"] == "application/pdf"
        assert pdf_download_res.content.startswith(b"%PDF-")

    print("[PASS] test_generate_report_full_multimodal passed successfully!")


def test_generate_report_tts_missing_key_error_handling():
    """
    Verifies that when GEMINI_API_KEY is missing or invalid for TTS,
    the endpoint does NOT crash or return HTTP 500. Instead it returns HTTP 200
    with audio_base64='' and audio_error populated with a clear diagnostic message.
    """
    payload = {
        "farmer_name": "আব্দুল করিম (Abdul Karim)",
        "district_name": "Rangpur",
    }
    with patch.object(AudioAdvisoryService, "get_gemini_api_key", return_value=None):
        res = client.post("/api/generate-report", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["audio_base64"] == ""
        assert data["audio_error"] is not None
        assert "Gemini API key is not configured" in data["audio_error"]
        # PDF and Bengali text are still fully generated
        assert len(data["bengali_audio_summary"]) > 20
        assert len(data["pdf_base64"]) > 100

    print("[PASS] test_generate_report_tts_missing_key_error_handling passed successfully!")


def test_generate_report_rain_spray_warning():
    """
    Verifies that when rain is forecast within 6 hours, the advisory summary
    and PDF reflect the critical rain suspension warning.
    """
    payload = {
        "voice_intake": {
            "crop_type": "Potato (Diamant Variety)",
            "damage_description": "Water-soaked dark lesions on leaves",
            "language_detected": "bn",
        },
        "treatment_plan": {
            "root_cause_explanation": "Late blight pathogen infection Phytophthora infestans.",
            "organic_treatment_steps": ["Remove infected foliar debris", "Ensure field aeration"],
            "chemical_treatment": {
                "name": "Mancozeb 80 WP",
                "dosage": "2 g / L water",
                "pre_harvest_interval": "14 days",
            },
            "safety_precautions": ["Wear protective gear"],
            "spray_schedule_advice": "⚠️ DO NOT SPRAY NOW: Rain is forecast within the next 6 hours.",
            "rain_within_6h": True,
            "spray_warning_active": True,
        },
    }

    res = client.post("/api/generate-report", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Audio summary should warn about rain or postponing spray
    summary = data["bengali_audio_summary"]
    assert "বৃষ্টি" in summary or "স্প্রে" in summary, "Rain spray warning expected in Bengali advisory"

    # Higher risk score due to rain preventing immediate treatment
    assert data["risk_score"] > 20.0

    print("[PASS] test_generate_report_rain_spray_warning passed successfully!")


def test_v1_alias_and_direct_download():
    """
    Verifies /api/v1/generate-report alias and direct POST /api/download-report-pdf.
    """
    payload = {
        "farmer_name": "আব্দুল করিম (Abdul Karim)",
        "district_name": "Rangpur",
    }
    # Test v1 alias
    v1_res = client.post("/api/v1/generate-report", json=payload)
    assert v1_res.status_code == 200
    v1_data = v1_res.json()
    assert v1_data["farmer_name"] == "আব্দুল করিম (Abdul Karim)"

    # Test direct PDF download
    direct_res = client.post("/api/download-report-pdf", json=payload)
    assert direct_res.status_code == 200
    assert direct_res.headers["content-type"] == "application/pdf"
    assert direct_res.content.startswith(b"%PDF-")

    print("[PASS] test_v1_alias_and_direct_download passed successfully!")


if __name__ == "__main__":
    test_audio_service_text_cleansing_and_wav_conversion()
    test_generate_report_full_multimodal()
    test_generate_report_tts_missing_key_error_handling()
    test_generate_report_rain_spray_warning()
    test_v1_alias_and_direct_download()
    print("All report generation & Gemini native TTS tests passed successfully!")
