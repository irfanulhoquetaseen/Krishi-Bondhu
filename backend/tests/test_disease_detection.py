import io
import json
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from PIL import Image
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

from app.main import app

client = TestClient(app)

SAMPLE_JPEG = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00"
    b"\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19"
    b"\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342"
    b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01"
    b"\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
    b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)


def _make_mock_gemini_response(payload_dict: dict, status_code: int = 200, text_override: str = None):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    if text_override:
        mock_resp.text = text_override
    else:
        mock_resp.text = json.dumps(payload_dict)
    mock_resp.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": json.dumps(payload_dict)}]
                }
            }
        ]
    }
    return mock_resp


def test_disease_detection_missing_api_key_returns_503():
    """
    Verifies that when GEMINI_API_KEY is not configured in .env or environment,
    the endpoint returns HTTP 503 Service Unavailable with a clear message.
    """
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "GOOGLE_API_KEY": ""}):
        response = client.post(
            "/api/disease-detection",
            files={"file": ("foliar_sample.jpg", SAMPLE_JPEG, "image/jpeg")},
        )
        assert response.status_code == 503, f"Expected 503, got {response.status_code}: {response.text}"
        detail = response.json().get("detail", "")
        assert "Gemini API key is not configured" in detail
        print("[PASS] test_disease_detection_missing_api_key_returns_503 passed")


def test_disease_detection_auth_error_returns_401():
    """
    Verifies that when an invalid Gemini API key is provided,
    the endpoint returns HTTP 401 Unauthorized with descriptive guidance.
    """
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyFakeInvalidKeyForTesting123456"}):
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.text = '{"error": {"code": 400, "message": "API_KEY_INVALID", "status": "INVALID_ARGUMENT"}}'

        with patch("httpx.Client.post", return_value=mock_resp):
            response = client.post(
                "/api/disease-detection",
                files={"file": ("foliar_sample.jpg", SAMPLE_JPEG, "image/jpeg")},
            )
            assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
            detail = response.json().get("detail", "")
            assert "invalid" in detail.lower()
            print("[PASS] test_disease_detection_auth_error_returns_401 passed")


def test_disease_detection_rate_limit_returns_429():
    """
    Verifies that when Gemini Vision API returns rate limit 429,
    the endpoint propagates HTTP 429 to the frontend.
    """
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyValidLookingMockKey12345678"}):
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.text = '{"error": {"code": 429, "message": "RESOURCE_EXHAUSTED"}}'

        with patch("httpx.Client.post", return_value=mock_resp):
            response = client.post(
                "/api/disease-detection",
                files={"file": ("foliar_sample.jpg", SAMPLE_JPEG, "image/jpeg")},
            )
            assert response.status_code == 429, f"Expected 429, got {response.status_code}: {response.text}"
            detail = response.json().get("detail", "")
            assert "rate limit" in detail.lower()
            print("[PASS] test_disease_detection_rate_limit_returns_429 passed")


def test_disease_detection_successful_with_crop_context_and_reasoning():
    """
    Verifies that a live Gemini Vision call processes crop context (Task 1),
    receives base64 image data, and returns disease name, diagnostic reasoning,
    confidence note, and severity rating.
    """
    vision_mock_dict = {
        "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
        "diagnostic_reasoning": "Classic diamond-to-spindle elliptical foliar lesions observed with necrotic ashy-gray centers and distinct reddish-brown borders along adaxial leaf veins.",
        "confidence_note": "High diagnostic confidence (94%) based on typical blast conidial lesions.",
        "severity_percentage": 34.5,
        "severity_class": "Moderate",
        "affected_area_description": "Multiple spindle lesions across vegetative tillers and collar tissue.",
    }

    mock_resp = _make_mock_gemini_response(vision_mock_dict)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyMockValidTestKey1234567890"}):
        with patch("httpx.Client.post", return_value=mock_resp) as mock_post:
            response = client.post(
                "/api/disease-detection",
                files={"file": ("rice_leaf_sample.jpg", SAMPLE_JPEG, "image/jpeg")},
                data={"expected_crop": "Aman Rice (BRRI dhan49)"},
            )

            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()

            # Verify Gemini API was called with image payload and crop context
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args.kwargs
            json_payload = call_kwargs["json"]
            prompt_text = json_payload["contents"][0]["parts"][0]["text"]
            assert "Aman Rice" in prompt_text
            assert "inline_data" in json_payload["contents"][0]["parts"][1]

            # Verify parsed output
            assert data["disease_name"] == "Rice Leaf Blast (Magnaporthe oryzae)"
            assert "spindle" in data["diagnostic_reasoning"].lower()
            assert data["severity_class"] == "Moderate"
            assert data["severity_percentage"] == 34.5
            assert data["source"] == "krishi-bondhu-vision-ai"
            print("[PASS] test_disease_detection_successful_with_crop_context_and_reasoning passed")


def test_disease_detection_successful_without_crop_context():
    """
    Verifies that when no crop context is provided (e.g. user skipped voice intake
    and directly uploaded an image), the vision model operates in Pure Visual Mode,
    skips the crop-symptom consistency check, and diagnoses purely based on visual symptoms.
    """
    vision_mock_dict = {
        "disease_name": "Potato Late Blight (Phytophthora infestans)",
        "diagnostic_reasoning": "Observed water-soaked dark irregular necrotic lesions on foliar tissue with pale green chlorotic halos, characteristic of Phytophthora infestans in Solanaceae.",
        "confidence_note": "Identified purely from visual lesion morphology and foliage characteristics without prior host crop specification.",
        "severity_percentage": 28.0,
        "severity_class": "Moderate",
        "affected_area_description": "Lower and middle canopy leaves showing irregular spreading blights.",
    }

    mock_resp = _make_mock_gemini_response(vision_mock_dict)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyMockValidTestKey1234567890"}):
        with patch("httpx.Client.post", return_value=mock_resp) as mock_post:
            response = client.post(
                "/api/disease-detection",
                files={"file": ("leaf_sample.jpg", SAMPLE_JPEG, "image/jpeg")},
                # No expected_crop field provided in request
            )

            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()

            # Verify prompt instructed the model to skip crop-symptom consistency check
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args.kwargs
            json_payload = call_kwargs["json"]
            prompt_text = json_payload["contents"][0]["parts"][0]["text"]
            assert "Pure Visual Diagnosis Mode" in prompt_text
            assert "Skip the crop-symptom consistency check" in prompt_text
            assert "Host crop not specified (pure visual mode): Skip crop-symptom consistency check" in prompt_text
            assert "Aman Rice" not in prompt_text

            assert data["disease_name"] == "Potato Late Blight (Phytophthora infestans)"
            assert data["severity_class"] == "Moderate"
            assert data["severity_percentage"] == 28.0
            print("[PASS] test_disease_detection_successful_without_crop_context passed")


def test_disease_detection_conservative_uncertainty():
    """
    Verifies that when image symptoms are ambiguous or blurry,
    the model conservatively returns 'Uncertain — Recommend Manual Inspection'.
    """
    uncertain_mock_dict = {
        "disease_name": "Uncertain — Recommend Manual Inspection",
        "diagnostic_reasoning": "Lesions are diffuse, non-distinct, and image illumination causes severe glare on the leaf cuticle, preventing definitive pathogen differentiation.",
        "confidence_note": "Low confidence (35%). Physical leaf specimen examination recommended before chemical intervention.",
        "severity_percentage": 10.0,
        "severity_class": "Mild",
        "affected_area_description": "Apical tips show slight abiotic yellowing.",
    }

    mock_resp = _make_mock_gemini_response(uncertain_mock_dict)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyMockValidTestKey1234567890"}):
        with patch("httpx.Client.post", return_value=mock_resp):
            response = client.post(
                "/api/disease-detection",
                files={"file": ("blurry_foliage.jpg", SAMPLE_JPEG, "image/jpeg")},
            )

            assert response.status_code == 200
            data = response.json()
            assert "Uncertain" in data["disease_name"]
            assert data["diagnostic_reasoning"] is not None
            print("[PASS] test_disease_detection_conservative_uncertainty passed")


def test_disease_detection_avif_conversion():
    """
    Verifies that uploaded .avif images are converted server-side to JPEG
    and successfully analyzed.
    """
    img = Image.new("RGB", (64, 64), color="darkgreen")
    avif_buf = io.BytesIO()
    img.save(avif_buf, format="AVIF")
    avif_bytes = avif_buf.getvalue()

    vision_mock_dict = {
        "disease_name": "Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)",
        "diagnostic_reasoning": "Linear water-soaked necrotic stripes along leaf margins with wavy borders.",
        "confidence_note": "High diagnostic confidence (91%).",
        "severity_percentage": 52.0,
        "severity_class": "Severe",
        "affected_area_description": "Apical 40% of flag leaf margin.",
    }

    mock_resp = _make_mock_gemini_response(vision_mock_dict)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyMockValidTestKey1234567890"}):
        with patch("httpx.Client.post", return_value=mock_resp) as mock_post:
            response = client.post(
                "/api/disease-detection",
                files={"file": ("sample_foliar.avif", avif_bytes, "image/avif")},
            )

            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()
            assert data["disease_name"] == "Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)"

            # Ensure image sent to Gemini was converted to JPEG
            call_kwargs = mock_post.call_args.kwargs
            inline_part = call_kwargs["json"]["contents"][0]["parts"][1]["inline_data"]
            assert inline_part["mime_type"] == "image/jpeg"
            print("[PASS] test_disease_detection_avif_conversion passed")


def test_disease_detection_heic_conversion():
    """
    Verifies that uploaded .heic / .heif images from iPhone / mobile devices
    are accepted, converted to JPEG server-side using Pillow, and analyzed.
    """
    img = Image.new("RGB", (64, 64), color="olive")
    heif_buf = io.BytesIO()
    img.save(heif_buf, format="HEIF")
    heif_bytes = heif_buf.getvalue()

    vision_mock_dict = {
        "disease_name": "Rice Sheath Blight (Rhizoctonia solani)",
        "diagnostic_reasoning": "Elliptical greenish-gray banded lesions ascending from leaf sheath.",
        "confidence_note": "Definitive visual match (88%).",
        "severity_percentage": 22.0,
        "severity_class": "Moderate",
        "affected_area_description": "Basal leaf sheaths near water line.",
    }

    mock_resp = _make_mock_gemini_response(vision_mock_dict)

    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyMockValidTestKey1234567890"}):
        with patch("httpx.Client.post", return_value=mock_resp) as mock_post:
            response = client.post(
                "/api/disease-detection",
                files={"file": ("iphone_capture.heic", heif_bytes, "image/heic")},
            )

            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()
            assert data["disease_name"] == "Rice Sheath Blight (Rhizoctonia solani)"

            call_kwargs = mock_post.call_args.kwargs
            inline_part = call_kwargs["json"]["contents"][0]["parts"][1]["inline_data"]
            assert inline_part["mime_type"] == "image/jpeg"
            print("[PASS] test_disease_detection_heic_conversion passed")


def test_disease_detection_rejects_non_image():
    response = client.post(
        "/api/disease-detection",
        files={"file": ("malicious_script.exe", b"MZ\x90\x00\x03", "application/x-dosexec")},
    )
    assert response.status_code == 400
    print("[PASS] test_disease_detection_rejects_non_image passed")


def test_disease_detection_rejects_empty():
    response = client.post(
        "/api/disease-detection",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
    )
    assert response.status_code == 400
    print("[PASS] test_disease_detection_rejects_empty passed")


if __name__ == "__main__":
    test_disease_detection_missing_api_key_returns_503()
    test_disease_detection_auth_error_returns_401()
    test_disease_detection_rate_limit_returns_429()
    test_disease_detection_successful_with_crop_context_and_reasoning()
    test_disease_detection_successful_without_crop_context()
    test_disease_detection_conservative_uncertainty()
    test_disease_detection_avif_conversion()
    test_disease_detection_heic_conversion()
    test_disease_detection_rejects_non_image()
    test_disease_detection_rejects_empty()
    print("\nAll disease detection tests passed successfully!")
