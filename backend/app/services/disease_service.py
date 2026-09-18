import base64
import json
import os
import re
import time
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Ensure .env from backend root is loaded
backend_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=backend_env_path)

from ..models.disease import DiseaseDetectionResponse


class VisionAPIError(Exception):
    """Base exception for vision API failures."""
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class VisionAPIConfigurationError(VisionAPIError):
    """Raised when GEMINI_API_KEY is not configured."""
    def __init__(
        self,
        message: str = (
            "Gemini API key is not configured. Please set GEMINI_API_KEY "
            "in backend/.env to enable visual disease detection."
        ),
    ):
        super().__init__(message, status_code=503)


class VisionAPIAuthError(VisionAPIError):
    """Raised when the Gemini API returns an authentication error (invalid key)."""
    def __init__(self, message: str = "Gemini API authentication failed. Please verify GEMINI_API_KEY in backend/.env."):
        super().__init__(message, status_code=401)


class VisionAPIRateLimitError(VisionAPIError):
    """Raised when the Gemini API is rate limited."""
    def __init__(self, message: str = "Gemini API rate limit exceeded. Please wait a moment and retry."):
        super().__init__(message, status_code=429)


def build_pathologist_system_prompt(expected_crop: Optional[str] = None) -> str:
    """
    Builds an expert plant pathology prompt incorporating expected host crop context,
    conservative diagnosis rules, diagnostic reasoning, and strict JSON formatting.
    When expected_crop is not provided or empty, Pure Visual Diagnosis Mode is activated,
    skipping crop-symptom consistency checks.
    """
    crop_str = expected_crop.strip() if expected_crop and isinstance(expected_crop, str) else ""
    if crop_str and crop_str.lower() not in ("none", "null", "undefined", "false"):
        crop_context = (
            f"EXPECTED HOST CROP: The farmer reports this crop is '{crop_str}'. "
            "Perform a crop-symptom consistency check: cross-reference all visible symptoms, blights, "
            f"blasts, or physiological disorders specifically recognized in South Asian agronomy for {crop_str}."
        )
    else:
        crop_context = (
            "EXPECTED HOST CROP: None provided (Pure Visual Diagnosis Mode). "
            "Skip the crop-symptom consistency check. Attempt diagnosis based purely on visible foliar "
            "symptoms, lesion morphology, color gradients, and pathogen signs without requiring prior crop context. "
            "Infer the host crop type directly from leaf shape, venation, and margins if visible, or diagnose the foliar pathology objectively."
        )

    return f"""You are an expert senior plant pathologist and agronomist specializing in crop pathology across South Asian agriculture (particularly the Bengal delta, Bangladesh, and eastern India).

{crop_context}

DIAGNOSTIC PROTOCOL & RULES:
1. CONSERVATIVE DIAGNOSIS SAFEGUARD:
   Agronomic disease diagnoses trigger expensive chemical or bio-fungicide treatments.
   If the image is blurry, out-of-focus, dimly lit, obstructed, captured from too far, or if foliar symptoms are ambiguous, atypical, or uncharacteristic:
   - You MUST NOT guess a specific disease taxon.
   - Set "disease_name" to: "Uncertain — Recommend Manual Inspection"
   - In "confidence_note" and "diagnostic_reasoning", explain clearly what visual limitations or symptom ambiguities prevent a conclusive diagnosis and advise the farmer to inspect leaf undersides or seek local extension officer confirmation.
2. CAUSAL DIAGNOSTIC REASONING:
   In the "diagnostic_reasoning" field, explicitly explain WHY you reached your diagnosis by citing the concrete visible foliar markers observed:
   - Lesion geometry (spindle-shaped, circular spots, expanding marginal stripes, irregular patches)
   - Color transitions (ashy gray necrotic centers, yellow chlorotic halos, reddish-brown water-soaked borders)
   - Pathogen signs (velvety sporulation, bacterial exudate crusting, mycelial webbing)
   - Affected plant anatomy (leaf lamina, midrib, sheath collar, apical tips)
3. HEALTHY PLANTS:
   If the foliage exhibits pristine chlorophyll density, uniform laminar turgor, and no pathogenic lesions, designate "disease_name" as: "Healthy Plant Foliage - No Pathogen Detected".

Return valid, raw JSON ONLY with the exact following schema:
{{
  "disease_name": string,
  "diagnostic_reasoning": string,
  "confidence_note": string,
  "severity_percentage": float,
  "severity_class": "Mild" | "Moderate" | "Severe" | "Critical",
  "affected_area_description": string
}}

Severity Class Scale:
- Mild: 0.0% to 15.0% leaf area affected (scattered initial lesions, structural integrity intact).
- Moderate: 15.1% to 40.0% leaf area affected (active infection centers, localized chlorosis).
- Severe: 40.1% to 75.0% leaf area affected (extensive necrotic coalescing, structural wilt).
- Critical: >75.0% damage (complete foliar collapse, vascular breakdown, imminent crop loss).

Output valid, parseable raw JSON only. Do not wrap in conversational preamble or markdown code fences."""


class DiseaseService:
    _REQUEST_COUNT: int = 0

    @classmethod
    def _log_raw_response(cls, provider: str, raw_text: str) -> None:
        """
        Logs the raw unparsed API text response to the backend console so developers can
        manually inspect and verify the model's actual output.
        """
        cls._REQUEST_COUNT += 1
        print("\n" + "=" * 70)
        print(f"[DiseaseService] LIVE VISION API RAW RESPONSE (Request #{cls._REQUEST_COUNT} via {provider}):")
        print("-" * 70)
        print(raw_text)
        print("=" * 70 + "\n", flush=True)

    @classmethod
    def analyze_crop_image(
        cls,
        image_bytes: bytes,
        filename: str,
        content_type: str = "image/jpeg",
        expected_crop: Optional[str] = None,
    ) -> DiseaseDetectionResponse:
        """
        Sends crop foliage image directly to the Gemini Vision API.
        Makes a verified API call using base64-encoded image input.
        Raises structured VisionAPIError if calls fail or keys are unconfigured.
        """
        start_time = time.time()
        gemini_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()

        has_gemini = bool(gemini_key and not gemini_key.startswith("your_") and len(gemini_key) > 10)

        if not has_gemini:
            raise VisionAPIConfigurationError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY "
                "in backend/.env to enable visual disease detection."
            )

        crop_str = expected_crop.strip() if expected_crop and isinstance(expected_crop, str) else ""
        normalized_crop = crop_str if crop_str and crop_str.lower() not in ("none", "null", "undefined", "false") else None

        system_prompt = build_pathologist_system_prompt(normalized_crop)

        try:
            import httpx

            base64_image = base64.b64encode(image_bytes).decode("utf-8")
            gemini_url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
            )

            prompt_text = (
                system_prompt
                + f"\n\nSpecimen filename: {filename}. "
                + (
                    f"Reported host crop: {normalized_crop}. Perform crop-symptom consistency check. "
                    if normalized_crop
                    else "Host crop not specified (pure visual mode): Skip crop-symptom consistency check. "
                )
                + "Diagnose foliar symptoms, explain visible markers in diagnostic_reasoning, estimate damage percentage, and output raw JSON."
            )

            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt_text},
                            {
                                "inline_data": {
                                    "mime_type": content_type or "image/jpeg",
                                    "data": base64_image,
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "response_mime_type": "application/json",
                },
            }

            with httpx.Client(timeout=35.0) as http_client:
                res = http_client.post(gemini_url, json=payload)
                if res.status_code == 400 and ("API_KEY_INVALID" in res.text or "INVALID_ARGUMENT" in res.text):
                    raise VisionAPIAuthError("Gemini API key is invalid. Please verify GEMINI_API_KEY in backend/.env.")
                if res.status_code == 429:
                    raise VisionAPIRateLimitError("Gemini Vision API rate limit reached. Please try again shortly.")
                if res.status_code != 200:
                    raise VisionAPIError(
                        f"Gemini Vision API returned status {res.status_code}: {res.text}",
                        status_code=res.status_code,
                    )

                data = res.json()
                candidate_text = (
                    data["candidates"][0]["content"]["parts"][0]["text"].strip()
                )

                cls._log_raw_response(provider="Krishi Bondhu Vision AI", raw_text=candidate_text)

                parsed = cls._parse_pathologist_json(candidate_text)
                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                return DiseaseDetectionResponse(
                    disease_name=parsed["disease_name"],
                    confidence_note=parsed["confidence_note"],
                    diagnostic_reasoning=parsed.get("diagnostic_reasoning"),
                    severity_percentage=float(parsed["severity_percentage"]),
                    severity_class=parsed["severity_class"],
                    affected_area_description=parsed["affected_area_description"],
                    processing_time_ms=elapsed_ms,
                    source="krishi-bondhu-vision-ai",
                )

        except VisionAPIError:
            raise
        except Exception as exc:
            raise VisionAPIError(
                f"Gemini Vision API inference failed: {str(exc)}",
                status_code=502,
            )

    @staticmethod
    def _parse_pathologist_json(raw_text: str) -> Dict[str, Any]:
        """
        Parses and validates JSON output from Vision LLMs, safely extracting
        diagnostic reasoning, disease name, and severity metrics.
        """
        clean_text = raw_text.strip()
        json_match = re.search(r"\{.*\}", clean_text, re.DOTALL)
        if json_match:
            clean_text = json_match.group(0)

        data = json.loads(clean_text)

        # Validate severity class
        severity_class = data.get("severity_class", "Moderate")
        if severity_class not in ["Mild", "Moderate", "Severe", "Critical"]:
            sev_pct = float(data.get("severity_percentage", 30.0))
            if sev_pct <= 15:
                severity_class = "Mild"
            elif sev_pct <= 40:
                severity_class = "Moderate"
            elif sev_pct <= 75:
                severity_class = "Severe"
            else:
                severity_class = "Critical"

        disease_name = data.get("disease_name", "Uncertain — Recommend Manual Inspection")
        diag_reasoning = data.get(
            "diagnostic_reasoning",
            data.get("confidence_note", "Visual diagnosis derived from foliar pathology symptoms.")
        )

        return {
            "disease_name": disease_name,
            "diagnostic_reasoning": diag_reasoning,
            "confidence_note": data.get("confidence_note", "Visual diagnosis completed by plant pathology model."),
            "severity_percentage": float(data.get("severity_percentage", 25.0)),
            "severity_class": severity_class,
            "affected_area_description": data.get(
                "affected_area_description", "Foliar leaf lamina and margin showing symptom progression."
            ),
        }
