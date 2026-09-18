import json
import os
import re
import time
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

from ..models.treatment import (
    TreatmentPlanRequest,
    TreatmentPlanResponse,
    ChemicalTreatment,
)
from .weather_service import WeatherService, WeatherReport

AGRONOMIST_SYSTEM_PROMPT = """You are an expert Senior Agronomist and Chief Plant Pathologist for Krishi Bondhu in Bangladesh.
You specialize in smallholder agriculture, crop physiology, phytopathology, and Integrated Pest Management (IPM) aligned with Bangladesh Rice Research Institute (BRRI) and Bangladesh Agricultural Research Institute (BARI) standards.

You are given:
1. Farmer Symptom Profile (from voice/text intake): crop type, symptoms described, planting date estimate, location.
2. Foliar Vision Pathology Diagnosis: pathogen identified, severity percentage and categorical class (Mild/Moderate/Severe/Critical), affected plant tissue.
3. Real-time Weather Telemetry & 6-Hour Precipitation Forecast: temperature, relative humidity, wind speed, forecast condition, and whether rain is expected within the next 6 hours.
4. Field Location: District / Union / GPS coordinates in Bangladesh.

Your task is to synthesize this multimodal intelligence and produce a precise, authoritative treatment plan as strict JSON ONLY with the following schema:
{
  "root_cause_explanation": "A deep agronomic and physiological explanation explaining the primary causal pathogen (fungus/bacteria/virus/pest), environmental catalyst (e.g. high humidity, cloudy skies, prolonged dew period, unbalanced nitrogen), and why the crop foliage is succumbing.",
  "organic_treatment_steps": [
    "Step 1: Specific non-chemical cultural practice or bio-agent (e.g. Trichoderma harzianum soil/foliar application, neem seed kernel extract, regulated water drainage, ash dusting, or balanced potash top-dressing).",
    "Step 2: Follow-up bio-control or canopy aeration measure.",
    "Step 3: Cultural hygiene measure (e.g. rogueing infected tillers, burning debris)."
  ],
  "chemical_treatment": {
    "name": "Targeted active ingredient and standard commercial formulation (e.g. Tricyclazole 75 WP, Copper Oxychloride 50 WP, Hexaconazole 5% SC, or Metalaxyl 8% + Mancozeb 64% WP)",
    "dosage": "Exact clinical dosage per liter of water and per decimal/bigha/acre (e.g. '0.75 g per liter of water; 100-120 liters of spray solution per acre')",
    "pre_harvest_interval": "Mandatory harvest safety waiting period (PHI in days, e.g. '21 days before crop harvesting for human consumption')"
  },
  "safety_precautions": [
    "Specific personal protective equipment (PPE: respirator/cloth mask, nitrile gloves, long sleeves, eye goggles).",
    "Environmental precautions: Avoid spraying near pond/dighi water channels to safeguard fisheries and aquaculture.",
    "Drift and wind precautions: Spray with wind at your back; never spray against wind or in gusts exceeding 15 km/h.",
    "Re-entry and container disposal: Keep cattle and goats away from treated field for 48 hours; puncture and bury empty pesticide containers away from drinking wells."
  ],
  "spray_schedule_advice": "Detailed timing window and spray instruction."
}

CRITICAL RULES:
1. RAIN PRECAUTION RULE: If rain is forecast within 6 hours (rain_expected_6h is true), you MUST explicitly start the spray_schedule_advice with:
   '⚠️ DO NOT SPRAY NOW: Rain is forecast within the next 6 hours. Chemical application must be suspended immediately as precipitation will wash off active ingredients into irrigation channels and destroy efficacy. Postpone chemical spraying until the canopy is dry after rainfall passes.'
   If rain is false, advise the farmer to spray during the optimal window (early morning between 6:30 AM - 8:30 AM before intense sun, or late afternoon 4:30 PM - 6:00 PM) when winds are calm and canopy leaves are free of heavy dew droplets.
2. Always return raw, valid JSON only. Do not wrap in conversational introductions or markdown outside the JSON block.
"""

class TreatmentService:
    @staticmethod
    def get_api_key() -> Optional[str]:
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    @classmethod
    def generate_treatment_plan(cls, request: TreatmentPlanRequest) -> TreatmentPlanResponse:
        """
        Fuses Task 1 (symptom profile), Task 2 (vision output), and OpenWeatherMap
        weather telemetry to generate an agronomist-grade treatment plan via Gemini API
        (or high-fidelity agronomic heuristic fallback).
        """
        start_time = time.time()

        # 1. Resolve location
        district = request.district_name
        lat = request.latitude
        lon = request.longitude
        if request.location:
            district = district or request.location.district_name
            lat = lat if lat is not None else request.location.latitude
            lon = lon if lon is not None else request.location.longitude

        if not district and request.symptom_profile and request.symptom_profile.geographic_union:
            district = request.symptom_profile.geographic_union

        # 2. Fetch real-time weather & 6h forecast
        weather_report = WeatherService.fetch_weather(
            district_name=district,
            latitude=lat,
            longitude=lon,
            force_rain_scenario=request.force_rain_scenario,
        )

        rain_in_6h = weather_report.rain_expected_6h

        # 3. Call Gemini API if API key is set
        gemini_key = cls.get_api_key()

        if gemini_key and not gemini_key.startswith("your_"):
            try:
                response = cls._call_gemini_agronomist(
                    api_key=gemini_key,
                    request=request,
                    weather=weather_report,
                )
                processing_time_ms = round((time.time() - start_time) * 1000, 1)

                # Programmatic validation: Ensure rain warning is present if rain is expected in 6h
                response = cls._enforce_rain_spray_warning(response, rain_in_6h, weather_report.location_name)
                response.processing_time_ms = processing_time_ms
                response.weather_context = weather_report.to_dict()
                response.rain_within_6h = rain_in_6h
                response.spray_warning_active = rain_in_6h
                response.source = f"Krishi Bondhu Agro AI + {weather_report.source_attribution}"
                return response
            except Exception as e:
                print(f"[TreatmentService] Gemini API call failed: {str(e)}. Using agronomic knowledge fallback.")

        # 4. Fallback agronomic reasoning engine
        fallback_plan = cls._generate_agronomic_fallback(request, weather_report)
        processing_time_ms = round((time.time() - start_time) * 1000, 1)

        fallback_plan = cls._enforce_rain_spray_warning(fallback_plan, rain_in_6h, weather_report.location_name)
        fallback_plan.processing_time_ms = processing_time_ms
        fallback_plan.weather_context = weather_report.to_dict()
        fallback_plan.rain_within_6h = rain_in_6h
        fallback_plan.spray_warning_active = rain_in_6h
        fallback_plan.source = f"Krishi Bondhu Agro AI (Protocol Engine) + {weather_report.source_attribution}"
        return fallback_plan

    @classmethod
    def _call_gemini_agronomist(
        cls,
        api_key: str,
        request: TreatmentPlanRequest,
        weather: WeatherReport,
    ) -> TreatmentPlanResponse:
        """
        Executes Gemini API prompt with agronomist persona.
        """
        import httpx

        model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        gemini_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key.strip()}"
        )

        user_prompt_dict = {
            "farmer_symptom_profile": (
                request.symptom_profile.model_dump()
                if request.symptom_profile
                else {"crop_type": "Aman Rice", "damage_description": "Leaf lesions and tip yellowing"}
            ),
            "foliar_vision_diagnosis": (
                request.vision_output.model_dump()
                if request.vision_output
                else {
                    "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
                    "severity_class": "Moderate",
                    "severity_percentage": 32.0,
                    "affected_area_description": "Spindle-shaped lesions along leaf blade",
                }
            ),
            "field_weather_telemetry": {
                "location": weather.location_name,
                "temperature_c": weather.temperature_c,
                "humidity_percentage": weather.humidity_percentage,
                "wind_speed_kmh": weather.wind_speed_kmh,
                "rain_expected_6h": weather.rain_expected_6h,
                "forecast_condition": weather.forecast_condition,
                "rain_forecast_details": weather.rain_forecast_details,
            },
        }

        full_prompt = (
            AGRONOMIST_SYSTEM_PROMPT
            + "\n\nSynthesize the treatment plan for this agricultural query:\n"
            + json.dumps(user_prompt_dict, indent=2)
        )

        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        }

        with httpx.Client(timeout=30.0) as http_client:
            res = http_client.post(gemini_url, json=payload)
            res.raise_for_status()
            data = res.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            clean_json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            parsed = json.loads(clean_json_match.group(0) if clean_json_match else raw_text)

        # Parse ChemicalTreatment
        chem_data = parsed.get("chemical_treatment", {})
        chem_obj = ChemicalTreatment(
            name=chem_data.get("name", "Tricyclazole 75 WP"),
            dosage=chem_data.get("dosage", "0.75 g / L water"),
            pre_harvest_interval=chem_data.get("pre_harvest_interval", "21 days"),
            application_instructions=chem_data.get("application_instructions"),
        )

        return TreatmentPlanResponse(
            root_cause_explanation=parsed.get("root_cause_explanation", "Pathogen infection confirmed."),
            organic_treatment_steps=parsed.get("organic_treatment_steps", []),
            chemical_treatment=chem_obj,
            safety_precautions=parsed.get("safety_precautions", []),
            spray_schedule_advice=parsed.get("spray_schedule_advice", ""),
            rain_within_6h=weather.rain_expected_6h,
            spray_warning_active=weather.rain_expected_6h,
            source=f"Krishi Bondhu Agro AI + {weather.source_attribution}",
        )

    @classmethod
    def _enforce_rain_spray_warning(
        cls, plan: TreatmentPlanResponse, rain_in_6h: bool, location_name: str
    ) -> TreatmentPlanResponse:
        """
        Programmatic safety guard: Guarantees that if rain is forecast within 6 hours,
        the spray_schedule_advice explicitly contains a clear warning against spraying now.
        """
        if rain_in_6h:
            plan.spray_warning_active = True
            warning_prefix = (
                f"⚠️ DO NOT SPRAY NOW: Rain is forecast within the next 6 hours in {location_name}. "
                "Chemical spraying must be suspended immediately because rainfall will wash off active "
                "fungicide/insecticide residues into runoff water, destroying efficacy and risking environmental leaching. "
                "Postpone foliar spraying until precipitation passes and leaves are completely dry. "
            )
            # Check if advice already starts with a rain warning; if not, prepend it
            advice_lower = plan.spray_schedule_advice.lower()
            if "do not spray" not in advice_lower and "warn against spraying" not in advice_lower:
                plan.spray_schedule_advice = warning_prefix + plan.spray_schedule_advice
            elif not plan.spray_schedule_advice.startswith("⚠️"):
                plan.spray_schedule_advice = "⚠️ " + plan.spray_schedule_advice
        else:
            plan.spray_warning_active = False
            if not plan.spray_schedule_advice or len(plan.spray_schedule_advice.strip()) < 10:
                plan.spray_schedule_advice = (
                    f"Optimal Spray Window Active for {location_name}: No precipitation forecast for the next 6-12 hours. "
                    "Apply foliar spray during early morning (6:30 AM - 8:30 AM) or late afternoon (4:30 PM - 6:00 PM) "
                    "when canopy leaves are dry and wind speeds are gentle (<10 km/h)."
                )

        return plan

    @classmethod
    def _generate_agronomic_fallback(
        cls, request: TreatmentPlanRequest, weather: WeatherReport
    ) -> TreatmentPlanResponse:
        """
        High-fidelity knowledge-based agronomic reasoning fallback conforming to BRRI and BARI extension protocols.
        """
        disease_name = "Rice Leaf Blast (Magnaporthe oryzae)"
        severity_class = "Moderate"
        severity_pct = 34.0
        affected_area = "Adaxial leaf blades and collar regions"

        if request.vision_output:
            disease_name = request.vision_output.disease_name
            severity_class = request.vision_output.severity_class
            severity_pct = request.vision_output.severity_percentage
            affected_area = request.vision_output.affected_area_description
        elif request.symptom_profile and request.symptom_profile.damage_description:
            desc = request.symptom_profile.damage_description.lower()
            if "blight" in desc or "জীবাণু" in desc or "বাদামী" in desc:
                disease_name = "Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)"
                severity_class = "Moderate"
            elif "potato" in desc or "আলু" in desc or "লেট ব্লাইট" in desc:
                disease_name = "Potato Late Blight (Phytophthora infestans)"
                severity_class = "Severe"

        d_lower = disease_name.lower()

        # Tailored agronomic recommendations based on identified pathology
        if "blast" in d_lower:
            root_cause = (
                f"Foliar infection by pyricularia fungus Magnaporthe oryzae (Rice Blast) exhibiting {severity_pct:.1f}% "
                f"tissue damage ({severity_class}). The pathogen was triggered by elevated ambient humidity "
                f"({weather.humidity_percentage:.1f}%) and nighttime temperatures of 22-26°C. Excessive vegetative nitrogen "
                "weakened the leaf epidermal cells, allowing fungal appressoria to pierce the cuticular wax layer."
            )
            organic_steps = [
                "Apply biocontrol formulation of Trichoderma harzianum (5g per liter of water) across the vegetative canopy.",
                "Drain standing water from the paddy plot for 48-72 hours to break high-humidity microclimate at ground level.",
                "Dust finely sieved wood ash (15-20 kg/bigha) early in the morning while leaves have slight moisture to alter foliar pH.",
                "Supplement with Muriate of Potash (MOP) at 5 kg/bigha to thicken plant cell walls and impart structural resistance.",
            ]
            chemical = ChemicalTreatment(
                name="Tricyclazole 75 WP (Trooper / Beam)",
                dosage="0.75 g per liter of water (approx 120-150 g/acre diluted in 160-200 L water)",
                pre_harvest_interval="21 days before grain harvest (Mandatory BRRI PHI)",
            )
            precautions = [
                "Always wear protective cloth mask, nitrile gloves, and eye glasses during mixing and knapsack spraying.",
                "Strictly avoid spraying adjacent to ponds, canals, or aquaculture fisheries to prevent aquatic organism toxicity.",
                "Never spray against wind direction; maintain a distance of at least 2 meters from spray drift.",
                "Withhold grazing livestock (cows, goats) from field bunds for a minimum of 48 hours post-application.",
            ]

        elif "bacterial" in d_lower or "blight" in d_lower:
            root_cause = (
                f"Vascular infection by Xanthomonas oryzae pv. oryzae (Bacterial Leaf Blight) causing {severity_pct:.1f}% "
                f"foliar compromise ({severity_class}). Pathogen entered via hydathodes and wind-induced leaf micro-tears. "
                f"Persistent ambient warmth ({weather.temperature_c:.1f}°C) and high humidity ({weather.humidity_percentage:.1f}%) "
                "facilitated rapid xylem colonization and yellow-white wavy necrotic blighting along leaf margins."
            )
            organic_steps = [
                "Immediately suspend all urea / nitrogen top-dressing to prevent succulent tissue growth.",
                "Apply fresh cow dung slurry extract (20 kg fresh dung stirred in 200 L water, strained through muslin) as an antagonistic bacterial wash.",
                "Drain standing irrigation water and maintain intermittent saturated soil rather than flooded ponding.",
                "Apply potassium top-dressing (MOP @ 6 kg/bigha) to enhance vascular lignification.",
            ]
            chemical = ChemicalTreatment(
                name="Copper Oxychloride 50 WP (Cupravit) + Streptomycin Sulfate (Plantomycin)",
                dosage="Copper Oxychloride @ 2.5 g/L + Streptocycline @ 0.1 g/L water (fine canopy coverage)",
                pre_harvest_interval="14 days before harvest (Strict PHI)",
            )
            precautions = [
                "Do not mix bactericide with acidic foliar fertilizers or organophosphates.",
                "Wear full face coverage and wash hands and eyes with soap and clean water immediately after application.",
                "Ensure no chemical wash-off enters community drinking ponds or domestic duck runs.",
                "Puncture and safely bury chemical sachets at least 15 meters away from water tubewells.",
            ]

        elif "sheath" in d_lower:
            root_cause = (
                f"Basal fungal blight caused by Rhizoctonia solani (Rice Sheath Blight) with {severity_pct:.1f}% severity. "
                "Sclerotial resting bodies floating on irrigation water colonized the lower leaf sheaths. Dense canopy planting "
                f"and high relative humidity ({weather.humidity_percentage:.1f}%) created a moist canopy micro-greenhouse."
            )
            organic_steps = [
                "Manually thin out excessively dense tillers to improve sunlight penetration and air movement through basal stems.",
                "Skim floating sclerotia off standing irrigation water before drainage.",
                "Spray bio-fungicide Pseudomonas fluorescens (10 g/L) directly directed at the lower stem collars.",
                "Incorporate neem cake meal (25 kg/bigha) into soil during the next inter-cultivation split.",
            ]
            chemical = ChemicalTreatment(
                name="Validamycin 3% L (Sheathmar / Valida) or Hexaconazole 5% SC (Contaf)",
                dosage="Validamycin 3L @ 2.0 ml/L or Hexaconazole 5% SC @ 1.0 ml/L directed strictly at basal tillers",
                pre_harvest_interval="15 days before harvest",
            )
            precautions = [
                "Calibrate knapsack nozzle downward to target basal leaf sheaths; avoid wasteful high-angle spraying.",
                "Wear waterproof rubber boots and long rubber gloves when navigating wet field bunds.",
                "Keep domestic ducks away from treated plots for 72 hours.",
                "Never wash pesticide sprayers in irrigation ponds or ditches used for domestic washing.",
            ]

        elif "potato" in d_lower or "phytophthora" in d_lower:
            root_cause = (
                f"Oomycete infection by Phytophthora infestans (Potato Late Blight) causing {severity_pct:.1f}% foliar collapse. "
                f"Cool nights accompanied by high ambient relative humidity ({weather.humidity_percentage:.1f}%) created free water film "
                "on leaflets, enabling rapid zoospore germination and destructive water-soaked lesions."
            )
            organic_steps = [
                "Inspect foliage twice daily; immediately rogue and incinerate any blighted vines in sealed bags away from the plot.",
                "High-earthing up of soil ridges to cover potato tubers with at least 10 cm of compact soil to prevent sporangial wash-down.",
                "Spray bio-extract of fermented garlic and neem oil (5 ml/L with mild soap emulsifier) as an initial foliar shield.",
                "Cease sprinkler or overhead irrigation immediately; shift to furrow irrigation only.",
            ]
            chemical = ChemicalTreatment(
                name="Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold / Krilaxyl)",
                dosage="2.0 g per liter of water (approx 400 g/acre diluted in 200 liters water)",
                pre_harvest_interval="14 days before tuber digging (Mandatory PHI)",
            )
            precautions = [
                "Apply spray thoroughly to both upper and lower leaf surfaces where sporulation mats emerge.",
                "Wear respiratory protection mask and protective goggles; avoid breathing aerosol mist.",
                "Do not spray if wind exceeds 12 km/h to prevent severe drift into neighboring tomato/vegetable plots.",
                "Empty containers must be triple-rinsed and disposed of according to national pesticide safety laws.",
            ]

        else:
            # Healthy or General foliar condition
            root_cause = (
                f"Crop foliage exhibits {severity_pct:.1f}% minor non-pathogenic symptom profile ({severity_class}). "
                f"Current microclimatic conditions ({weather.temperature_c:.1f}°C, {weather.humidity_percentage:.1f}% RH) "
                "are stable. Minor tip necrosis is attributed to abiotic moisture fluctuations and localized nutrient uptake."
            )
            organic_steps = [
                "Maintain regular soil moisture between 35% and 45% with balanced wetting and drying cycles.",
                "Apply vermicompost or well-decomposed farmyard manure (FYM @ 150 kg/bigha) to enhance beneficial rhizobacteria.",
                "Spray vermiwash or panchagavya (30 ml/L) as a natural vegetative growth booster.",
            ]
            chemical = ChemicalTreatment(
                name="Prophylactic Wettable Sulfur 80% WP (Kumulus / Thiovit)",
                dosage="2.0 g/L water (protective shield; zero acute chemical toxicity)",
                pre_harvest_interval="3 days (Minimal withholding period)",
            )
            precautions = [
                "Always observe basic hygiene: wash hands and face thoroughly after handling agricultural amendments.",
                "Store bio-fertilizers in cool dry shaded areas away from direct tropical sunlight.",
            ]

        # Spray schedule advice base
        if weather.rain_expected_6h:
            spray_advice = (
                f"⚠️ DO NOT SPRAY NOW: Rain is forecast within the next 6 hours in {weather.location_name}. "
                f"Forecast: {weather.forecast_condition} ({weather.rain_forecast_details}). "
                "Any chemical application now will be washed into field runoff, wasting money and contaminating local waters. "
                "Wait for rainfall to cease and spray only when leaf surfaces have dried."
            )
        else:
            spray_advice = (
                f"Optimal Spray Window Active for {weather.location_name}: Dry atmospheric conditions with zero rain forecast "
                f"for the next 6-12 hours. Wind speed is gentle ({weather.wind_speed_kmh:.1f} km/h). "
                "Apply treatment between 6:30 AM and 8:30 AM or late afternoon (4:30 PM - 6:00 PM) "
                "for maximum leaf uptake and minimal UV breakdown."
            )

        return TreatmentPlanResponse(
            root_cause_explanation=root_cause,
            organic_treatment_steps=organic_steps,
            chemical_treatment=chemical,
            safety_precautions=precautions,
            spray_schedule_advice=spray_advice,
        )
