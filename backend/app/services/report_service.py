import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from ..models.report import ReportGenerationRequest, ReportGenerationResponse
from .audio_service import AudioAdvisoryService
from .pdf_service import CropPassportPdfService


# In-memory cache for recent generated PDFs: passport_id -> (pdf_bytes, filename)
_PDF_CACHE: Dict[str, tuple[bytes, str]] = {}


class ReportService:
    """
    Coordinates multimodal synthesis for the Digital Crop Passport and Audio Advisory.
    Fuses Voice Intake (Task 1), Foliar Disease Vision (Task 2),
    Treatment Reasoning (Task 3), and Market Price Analysis (Task 4).
    """

    @classmethod
    def generate_report(cls, request: ReportGenerationRequest) -> ReportGenerationResponse:
        start_time = time.time()

        now_utc = datetime.now(timezone.utc)
        short_id = uuid.uuid4().hex[:6].upper()
        passport_id = f"KB-PASSPORT-{now_utc.year}-{short_id}"
        created_at_str = now_utc.strftime("%Y-%m-%d %H:%M UTC")

        # 1. Resolve Crop Type & Variety
        crop_type = "Aman Rice (BRRI dhan49)"
        if request.treatment_plan and getattr(request.treatment_plan, "crop_type", None):
            crop_type = request.treatment_plan.crop_type
        elif request.voice_intake and request.voice_intake.crop_type:
            crop_type = request.voice_intake.crop_type
        elif request.price_analysis and request.price_analysis.crop_display_name:
            crop_type = request.price_analysis.crop_display_name

        farmer_name = request.farmer_name or "মো: রফিকুল ইসলাম (Md. Rafiqul Islam)"
        district_name = request.district_name or "Godagari, Rajshahi"
        if request.voice_intake and request.voice_intake.geographic_union:
            district_name = request.voice_intake.geographic_union
        plot_id = request.plot_id or "KB-PLOT-RAJ-04"

        # 2. Resolve Disease & Foliar Parameters
        disease_name = "Rice Leaf Blast (Magnaporthe oryzae)"
        severity_class = "Moderate"
        severity_percentage = 34.5
        affected_area = "Adaxial leaf blades and collar regions exhibiting spindle lesions"

        if request.disease_detection:
            disease_name = request.disease_detection.disease_name
            severity_class = request.disease_detection.severity_class
            severity_percentage = request.disease_detection.severity_percentage
            affected_area = request.disease_detection.affected_area_description

        # 3. Resolve Treatment Plan Parameters
        organic_steps = [
            "Apply Trichoderma harzianum bio-fungicide formulation at 5g/L water in early morning.",
            "Temporarily drain standing water from field plots for 48 hours to aerate the root-zone.",
            "Apply wood ash dusting (20 kg/acre) across the canopy to deter sporulation.",
        ]
        chemical_name = "Tricyclazole 75 WP"
        chemical_dosage = "0.75 g/L water (approx 120 L/acre solution)"
        pre_harvest_interval = "21 Days mandatory (PHI)"
        safety_precautions = [
            "Wear personal protective mask and nitrile gloves during spraying.",
            "Maintain a 10-meter protective buffer from fish ponds or open water bodies.",
            "Spray with wind at your back; suspend application if wind exceeds 15 km/h.",
        ]
        rain_within_6h = False
        spray_schedule = (
            "Optimal Spray Window Active: No precipitation forecast for the next 12 hours. "
            "Apply foliar spray during early morning (6:30 AM - 8:30 AM) when dew has evaporated."
        )

        if request.treatment_plan:
            if request.treatment_plan.organic_treatment_steps:
                organic_steps = request.treatment_plan.organic_treatment_steps
            if request.treatment_plan.chemical_treatment:
                chemical_name = request.treatment_plan.chemical_treatment.name
                chemical_dosage = request.treatment_plan.chemical_treatment.dosage
                pre_harvest_interval = request.treatment_plan.chemical_treatment.pre_harvest_interval
            if request.treatment_plan.safety_precautions:
                safety_precautions = request.treatment_plan.safety_precautions
            rain_within_6h = request.treatment_plan.rain_within_6h
            spray_schedule = request.treatment_plan.spray_schedule_advice

        # 4. Resolve Market Price Parameters
        is_predatory_price = False
        offered_price = 24.50
        fair_price = 34.00
        price_dev = -27.9
        selling_window = "Days 4 to 7 (Optimal: Upcoming Friday Haat)"

        if request.price_analysis:
            is_predatory_price = request.price_analysis.is_predatory_price
            offered_price = request.price_analysis.offered_price_per_kg or offered_price
            fair_price = request.price_analysis.historical_mean_price_per_kg or fair_price
            price_dev = request.price_analysis.price_deviation_percent
            if isinstance(request.price_analysis.recommended_selling_window, str):
                selling_window = request.price_analysis.recommended_selling_window
            else:
                selling_window = request.price_analysis.recommended_selling_window.optimal_window

        # 5. Composite Agronomic Risk Calculation (0-100)
        risk_score, risk_level = cls._calculate_composite_risk(
            severity_percentage=severity_percentage,
            severity_class=severity_class,
            rain_within_6h=rain_within_6h,
            is_predatory_price=is_predatory_price,
        )

        # 6. Generate Conversational Bengali Advisory Summary
        bengali_summary = AudioAdvisoryService.generate_bengali_summary(
            crop_type=crop_type,
            disease_name=disease_name,
            severity_class=severity_class,
            severity_percentage=severity_percentage,
            organic_steps=organic_steps,
            chemical_name=chemical_name,
            chemical_dosage=chemical_dosage,
            rain_within_6h=rain_within_6h,
            spray_schedule_advice=spray_schedule,
            is_predatory_price=is_predatory_price,
            fair_price_per_kg=fair_price,
            offered_price_per_kg=offered_price,
            recommended_selling_window=selling_window,
        )

        # 7. Synthesize Spoken Bengali Speech (WAV Base64) via Gemini Native TTS
        audio_base64, audio_error = AudioAdvisoryService.synthesize_speech_base64(bengali_summary)

        # 8. Generate Printable Field Health Card PDF
        pdf_bytes = CropPassportPdfService.generate_health_card_pdf(
            passport_id=passport_id,
            crop_type=crop_type,
            farmer_name=farmer_name,
            district_name=district_name,
            plot_id=plot_id,
            risk_score=risk_score,
            risk_level=risk_level,
            disease_name=disease_name,
            severity_class=severity_class,
            severity_percentage=severity_percentage,
            affected_area_description=affected_area,
            organic_steps=organic_steps,
            chemical_name=chemical_name,
            chemical_dosage=chemical_dosage,
            pre_harvest_interval=pre_harvest_interval,
            safety_precautions=safety_precautions,
            spray_schedule_advice=spray_schedule,
            rain_within_6h=rain_within_6h,
            is_predatory_price=is_predatory_price,
            offered_price_per_kg=offered_price,
            fair_price_per_kg=fair_price,
            price_deviation_percent=price_dev,
            recommended_selling_window=selling_window,
            crop_image_base64=request.crop_image_base64,
            created_at_str=created_at_str,
        )

        import base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
        pdf_filename = f"Field_Health_Card_{passport_id}.pdf"

        # Cache for direct download endpoint
        _PDF_CACHE[passport_id] = (pdf_bytes, pdf_filename)

        # 9. Format WhatsApp Shareable Text
        whatsapp_share_text = cls._compose_whatsapp_text(
            passport_id=passport_id,
            crop_type=crop_type,
            disease_name=disease_name,
            severity_class=severity_class,
            severity_percentage=severity_percentage,
            chemical_name=chemical_name,
            chemical_dosage=chemical_dosage,
            rain_within_6h=rain_within_6h,
            is_predatory_price=is_predatory_price,
            offered_price=offered_price,
            fair_price=fair_price,
            selling_window=selling_window,
            district_name=district_name,
        )

        # 10. Summary Takeaway Highlights
        highlights = [
            f"Pathology: {disease_name} ({severity_class}, {severity_percentage:.1f}% foliar area)",
            f"Prescription: {chemical_name} @ {chemical_dosage} (PHI: {pre_harvest_interval})",
            (
                "Weather Alert: Rain expected in <6h — SUSPEND SPRAYING"
                if rain_within_6h
                else "Weather: Clear spray window active"
            ),
            (
                f"Market Alert: Predatory offer (৳{offered_price:.1f}/kg vs Fair ৳{fair_price:.1f}/kg). Recommend holding for {selling_window}"
                if is_predatory_price
                else f"Market: Offered price ৳{offered_price:.1f}/kg is aligned with wholesale index"
            ),
        ]

        processing_time = round((time.time() - start_time) * 1000, 1)

        return ReportGenerationResponse(
            passport_id=passport_id,
            created_at=now_utc.isoformat(),
            crop_type=crop_type,
            farmer_name=farmer_name,
            district_name=district_name,
            risk_score=risk_score,
            risk_level=risk_level,
            bengali_audio_summary=bengali_summary,
            audio_base64=audio_base64,
            audio_format="audio/wav",
            audio_error=audio_error,
            pdf_base64=pdf_base64,
            pdf_filename=pdf_filename,
            summary_highlights=highlights,
            whatsapp_share_text=whatsapp_share_text,
            source="krishi-bondhu-multimodal-pipeline v0.1.0",
            processing_time_ms=processing_time,
        )

    @staticmethod
    def get_cached_pdf(passport_id: str) -> Optional[tuple[bytes, str]]:
        return _PDF_CACHE.get(passport_id)

    @staticmethod
    def _calculate_composite_risk(
        severity_percentage: float,
        severity_class: str,
        rain_within_6h: bool,
        is_predatory_price: bool,
    ) -> tuple[float, str]:
        """
        Calculates a composite agronomic risk score between 0 and 100.
        Weights:
        - Foliar infection %: 40%
        - Pathology class weight: 30%
        - Imminent rain spray vulnerability: 15%
        - Market predatory loss factor: 15%
        """
        class_weights = {"Mild": 20.0, "Moderate": 50.0, "Severe": 80.0, "Critical": 100.0}
        c_val = class_weights.get(severity_class, 50.0)

        score = (severity_percentage * 0.40) + (c_val * 0.30)
        if rain_within_6h:
            score += 15.0
        if is_predatory_price:
            score += 15.0

        score = max(0.0, min(100.0, round(score, 1)))

        if score >= 75.0:
            level = "Critical"
        elif score >= 50.0:
            level = "High"
        elif score >= 25.0:
            level = "Moderate"
        else:
            level = "Low"

        return score, level

    @staticmethod
    def _compose_whatsapp_text(
        passport_id: str,
        crop_type: str,
        disease_name: str,
        severity_class: str,
        severity_percentage: float,
        chemical_name: str,
        chemical_dosage: str,
        rain_within_6h: bool,
        is_predatory_price: bool,
        offered_price: float,
        fair_price: float,
        selling_window: str,
        district_name: str,
    ) -> str:
        """
        Composes a rich, readable WhatsApp share message formatted with emoji and clear sections.
        """
        spray_warning = (
            "⚠️ *আবহাওয়া সতর্কতা:* আগামী ৬ ঘণ্টায় বৃষ্টি হতে পারে। এখন স্প্রে করবেন না! বৃষ্টি থামার পর স্প্রে করুন।"
            if rain_within_6h
            else "☀️ *স্প্রে সময়:* আবহাওয়া অনুকূল। সকাল ৬:৩০ - ৮:৩০ এর মধ্যে স্প্রে করুন।"
        )

        price_warning = (
            f"📉 *বাজার সতর্কতা:* ফড়িয়ার প্রস্তাব ৳{offered_price:.1f}/কেজি কম (ন্যায্যমূল্য ৳{fair_price:.1f}/কেজি)। {selling_window}-এ বিক্রি করুন।"
            if is_predatory_price
            else f"⚖️ *বাজার দর:* প্রস্তাবিত ৳{offered_price:.1f}/কেজি বাজারদরের সাথে সংগতিপূর্ণ।"
        )

        msg = (
            f"🌾 *কৃষি বন্ধু • ডিজিটাল ক্রপ পাসপোর্ট (Field Health Card)*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🆔 *পাসপোর্ট নং:* {passport_id}\n"
            f"📍 *এলাকা:* {district_name}\n"
            f"🌱 *ফসল:* {crop_type}\n\n"
            f"🔬 *শনাক্ত রোগ:* {disease_name}\n"
            f"📊 *ক্ষতির মাত্রা:* {severity_class} ({severity_percentage:.1f}%)\n\n"
            f"💊 *প্রেসক্রিপশন:* {chemical_name}\n"
            f"🧪 *মাত্রা:* {chemical_dosage}\n\n"
            f"{spray_warning}\n\n"
            f"{price_warning}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🌐 সম্পূর্ণ স্বাস্থ্য কার্ড ও অডিও বুলেটিন শুনুন: https://krishibondhu.gov.bd/passport/{passport_id}"
        )
        return msg
