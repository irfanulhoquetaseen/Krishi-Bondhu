import base64
import html
import io
import json
import os
import re
import wave
from typing import Optional, Dict, Any, Tuple
import httpx
from dotenv import load_dotenv

load_dotenv()


class AudioAdvisoryService:
    """
    Service responsible for generating spoken Bengali agronomic advisory text
    via Gemini API and converting it to natural, high-fidelity speech using
    Gemini's native Text-to-Speech model (e.g. gemini-2.5-flash-preview-tts)
    using the project's standard GEMINI_API_KEY.
    """

    @staticmethod
    def get_gemini_api_key() -> Optional[str]:
        """
        Retrieves the standard GEMINI_API_KEY (or GOOGLE_API_KEY) from environment.
        """
        key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
        if key and not key.startswith("your_") and len(key) > 10:
            return key
        return None

    @staticmethod
    def get_tts_model() -> str:
        """
        Retrieves the Gemini native TTS model identifier (default: gemini-2.5-flash-preview-tts).
        """
        return os.getenv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts").strip()

    @staticmethod
    def get_tts_voice() -> str:
        """
        Retrieves the preferred Gemini TTS voice preset (default: Kore).
        Options: Kore, Puck, Charon, Fenrir, Aoede.
        """
        return os.getenv("GEMINI_TTS_VOICE", "Kore").strip()

    @staticmethod
    def pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 24000, num_channels: int = 1, sample_width: int = 2) -> bytes:
        """
        Wraps raw 16-bit little-endian PCM audio data into a standard RIFF WAV container,
        making it immediately playable by HTML5 <audio> players without external codecs.
        """
        # If already starts with RIFF header, return as is
        if pcm_bytes.startswith(b"RIFF"):
            return pcm_bytes

        wav_io = io.BytesIO()
        with wave.open(wav_io, "wb") as wf:
            wf.setnchannels(num_channels)
            wf.setsampwidth(sample_width)  # 16-bit PCM = 2 bytes
            wf.setframerate(sample_rate)
            wf.writeframes(pcm_bytes)
        return wav_io.getvalue()

    @classmethod
    def clean_bengali_tts_text(cls, raw_text: str) -> str:
        """
        Sanitizes Bengali advisory text before TTS synthesis:
        - Strips markdown formatting (*, #, _, `, ~, etc.)
        - Normalizes English punctuation to Bengali dari (।)
        - Transliterates common English agricultural abbreviations and terms to Bengali script
        - Enforces proper sentence endings and removes duplicate whitespace/punctuation.
        """
        if not raw_text:
            return ""

        text = raw_text

        # 1. Strip markdown symbols and HTML tags
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"[\*#_`~>\[\]\(\)\{\}\^\+\=\|]", "", text)

        # 2. Transliterate common English metrics, crops, and chemical formulations
        phonetic_replacements = [
            (r"\bkg\b", "কেজি"),
            (r"\bgm\b", "গ্রাম"),
            (r"\bg\b", "গ্রাম"),
            (r"\bml\b", "মিলি"),
            (r"\bltr\b|\bl\b", "লিটার"),
            (r"\bbdt\b|\btk\b", "টাকা"),
            (r"%", " শতাংশ"),
            (r"\bwp\b", "ডব্লিউপি"),
            (r"\bec\b", "ইসি"),
            (r"\bphi\b", "প্রতীক্ষা সময়"),
            (r"\bacre\b", "একর"),
            (r"\bdecimal\b", "শতাংশ"),
            (r"\bwater\b", "পানি"),
            (r"\bapprox\b|\bapproximately\b", "প্রায়"),
            (r"\bsolution\b", "দ্রবণ"),
            (r"\bdhan\b", "ধান"),
            (r"\bmoderate\b", "মাঝারি"),
            (r"\bsevere\b", "তীব্র"),
            (r"\bmild\b", "মৃদু"),
            (r"\baman\s+rice\b", "আমন ধান"),
            (r"\bboro\s+rice\b", "বোরো ধান"),
            (r"\baus\s+rice\b", "আউশ ধান"),
            (r"\brice\b", "ধান"),
            (r"\bpotato\b", "আলু"),
            (r"\bwheat\b", "গম"),
            (r"\bmaize\b|\bcorn\b", "ভুট্টা"),
            (r"\bjute\b", "পাট"),
            (r"\btomato\b", "টমেটো"),
            (r"\bspray\b", "স্প্রে"),
            (r"\bformulation\b", "ফর্মুলেশন"),
            (r"\bblast\b", "ব্লাস্ট"),
            (r"\bblight\b", "ব্লাইট"),
            (r"\btricyclazole\b", "ট্রাইসাইক্লাজোল"),
            (r"\bmancozeb\b", "ম্যানকোজেব"),
            (r"\bcarbendazim\b", "কার্বেনডাজিম"),
            (r"\bhexaconazole\b", "হেক্সাকোনাজোল"),
            (r"\bchlorpyrifos\b", "ক্লোরপাইরিফস"),
            (r"\bbrri\b", "ব্রি"),
            (r"\bbari\b", "বারি"),
        ]
        for pattern, replacement in phonetic_replacements:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # 3. Clean any remaining Latin digits: convert to Bengali numerals
        en_to_bn_digits = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
        text = text.translate(en_to_bn_digits)

        # 4. Standardize punctuation to Bengali Dari (।)
        text = re.sub(r"\.(?=\s|$)", "।", text)
        text = re.sub(r"!+", "।", text)
        text = re.sub(r";+", "।", text)
        text = re.sub(r":+", " —", text)

        # 5. Clean whitespace & duplicate daris
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"\s*।\s*", "। ", text)
        text = re.sub(r"।+", "।", text).strip()

        # Ensure text ends with a Dari
        if text and not text.endswith("।") and not text.endswith("?"):
            text += "।"

        return text

    @classmethod
    def build_tts_prompt(cls, clean_text: str) -> str:
        """
        Constructs an instructional speech prompt for the Gemini TTS model,
        guiding clear enunciation, natural pacing, and warm advisory tone for rural farmers.
        """
        return (
            "Please read the following agricultural advisory in clear, calm, natural spoken Bengali "
            "with a warm, supportive instructional tone. Speak at a measured, slightly slow pace "
            "with clear enunciation and natural pauses at every sentence delimiter ('।') "
            "so that rural farmers can easily understand each step:\n\n"
            + clean_text
        )

    @classmethod
    def generate_bengali_summary(
        cls,
        crop_type: str,
        disease_name: Optional[str] = None,
        severity_class: Optional[str] = None,
        severity_percentage: Optional[float] = None,
        organic_steps: Optional[list] = None,
        chemical_name: Optional[str] = None,
        chemical_dosage: Optional[str] = None,
        rain_within_6h: bool = False,
        spray_schedule_advice: Optional[str] = None,
        is_predatory_price: bool = False,
        fair_price_per_kg: Optional[float] = None,
        offered_price_per_kg: Optional[float] = None,
        recommended_selling_window: Optional[str] = None,
    ) -> str:
        """
        Generates a concise, natural, and conversational Bengali spoken bulletin (3-5 sentences).
        Uses Gemini text reasoning API with strict colloquial Bengali guidance, then sanitizes the text.
        """
        gemini_key = cls.get_gemini_api_key()
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()

        if gemini_key:
            try:
                prompt_data = {
                    "crop": crop_type,
                    "disease": disease_name or "অজ্ঞাত রোগ",
                    "severity": f"{severity_class or 'Moderate'} ({severity_percentage or 30.0}%)",
                    "organic_step": organic_steps[0] if organic_steps else "জৈব বালাইনাশক ও ছাই ছিটান",
                    "chemical": f"{chemical_name or 'ট্রাইসাইক্লাজোল ৭৫ ডব্লিউপি'} (মাত্রা: {chemical_dosage or '০.৭৫ গ্রাম প্রতি লিটার পানি'})",
                    "rain_within_6h": rain_within_6h,
                    "spray_advice": spray_schedule_advice or "",
                    "is_predatory_price": is_predatory_price,
                    "fair_price_bdt": fair_price_per_kg or 34.0,
                    "offered_price_bdt": offered_price_per_kg or 24.5,
                    "selling_window": recommended_selling_window or "আসন্ন হাট",
                }

                system_prompt = (
                    "You are a friendly, compassionate Senior Agricultural Extension Officer (কৃষি কর্মকর্তা) "
                    "in Bangladesh speaking directly to a rural farmer via a spoken voice note. "
                    "Compose a clear, warm, conversational audio briefing in spoken colloquial Bengali (চলিত ভাষা). "
                    "STRICT LINGUISTIC & FORMATTING RULES:\n"
                    "1. PURE BENGALI SCRIPT ONLY: Strictly NO English words or Latin alphabet characters. Translate or phonetically transliterate "
                    "all crop names, disease names, chemical brands, metrics, and units into Bengali (e.g., write 'আমন ধান', 'ব্লাস্ট', 'ট্রাইসাইক্লাজোল', 'কেজি', 'লিটার').\n"
                    "2. PUNCTUATION: Every single sentence MUST end with the Bengali punctuation dari ('।'). Never use English full stops (.) or colons.\n"
                    "3. NO FORMATTING: Strictly plain spoken text. NO markdown asterisks (*), hashtags (#), brackets, or bullet points.\n"
                    "4. WARM GREETING: Begin with 'আসসালামু আলাইকুম কৃষক ভাই, কৃষি বন্ধু থেকে আপনার ফসলের স্বাস্থ্য বুলেটিন শুনুন।'\n"
                    "5. DIAGNOSIS: Clearly state the crop and detected disease in Bengali.\n"
                    "6. REMEDY: State the immediate practical remedy with dosage in Bengali.\n"
                    "7. CRITICAL WEATHER RULE: If rain_within_6h is true, you MUST clearly warn:\n"
                    "   'সাবধান! আগামী ৬ ঘণ্টার মধ্যে বৃষ্টির সম্ভাবনা আছে, তাই এখনই কোনো স্প্রে করবেন না। বৃষ্টি থেমে পাতা শুকালে তবেই স্প্রে করুন।'\n"
                    "   If no rain, recommend spraying in early morning or late afternoon.\n"
                    "8. MARKET TIP: If predatory price detected, advise holding for the recommended market window in Bengali.\n"
                    "9. LENGTH: Exactly 3 to 5 natural Bengali sentences."
                )

                gemini_url = (
                    f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
                )
                full_prompt = (
                    system_prompt
                    + "\n\nCrop Telemetry Data:\n"
                    + json.dumps(prompt_data, ensure_ascii=False)
                )

                payload = {
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {"temperature": 0.25},
                }

                with httpx.Client(timeout=25.0) as http_client:
                    res = http_client.post(gemini_url, json=payload)
                    res.raise_for_status()
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    cleaned = cls.clean_bengali_tts_text(text)
                    if len(cleaned) > 30:
                        return cleaned
            except Exception as e:
                print(f"[AudioAdvisoryService] Gemini text synthesis failed: {e}. Using Bengali agronomic synthesis.")

        # Fallback Bengali agronomic synthesis
        raw_fallback = cls._generate_fallback_bengali_text(
            crop_type=crop_type,
            disease_name=disease_name,
            severity_class=severity_class,
            organic_steps=organic_steps,
            chemical_name=chemical_name,
            chemical_dosage=chemical_dosage,
            rain_within_6h=rain_within_6h,
            is_predatory_price=is_predatory_price,
            fair_price_per_kg=fair_price_per_kg,
            offered_price_per_kg=offered_price_per_kg,
            recommended_selling_window=recommended_selling_window,
        )
        return cls.clean_bengali_tts_text(raw_fallback)

    @classmethod
    def _generate_fallback_bengali_text(
        cls,
        crop_type: str,
        disease_name: Optional[str],
        severity_class: Optional[str],
        organic_steps: Optional[list],
        chemical_name: Optional[str],
        chemical_dosage: Optional[str],
        rain_within_6h: bool,
        is_predatory_price: bool,
        fair_price_per_kg: Optional[float],
        offered_price_per_kg: Optional[float],
        recommended_selling_window: Optional[str],
    ) -> str:
        """
        Agronomic rule-based fallback generating clean, natural Bengali advisory text.
        """
        bengali_disease = "পাতার ব্লাস্ট বা দাগ রোগ"
        if disease_name:
            d_lower = disease_name.lower()
            if "blast" in d_lower:
                bengali_disease = "ধানের পাতা ব্লাস্ট রোগ"
            elif "blight" in d_lower:
                bengali_disease = "পাতা পোড়া বা লেট ব্লাইট রোগ"
            elif "hopper" in d_lower or "planthopper" in d_lower:
                bengali_disease = "বাদামি ঘাসফড়িং বা কারেন্ট পোকার আক্রমণ"
            elif "rot" in d_lower:
                bengali_disease = "পচন রোগ"

        chem = chemical_name or "ট্রাইসাইক্লাজোল ৭৫ ডব্লিউপি"
        dose = chemical_dosage or "প্রতি লিটার পানিতে ০.৭৫ গ্রাম"

        greeting = f"আসসালামু আলাইকুম কৃষক ভাই। কৃষি বন্ধু প্ল্যাটফর্ম থেকে আপনার {crop_type} ফসলের স্বাস্থ্য বুলেটিন শুনুন।"
        diagnosis = f"আপনার ফসলের পাতায় {bengali_disease} শনাক্ত হয়েছে এবং ক্ষতির মাত্রা {severity_class or 'মাঝারি'} পর্যায়ে রয়েছে।"

        if rain_within_6h:
            spray_part = (
                "বিশেষ সতর্কতা: আগামী ৬ ঘণ্টার মধ্যে আপনার এলাকায় বৃষ্টির সম্ভাবনা রয়েছে। "
                "তাই এখনই কোনো রাসায়নিক স্প্রে করবেন না; বৃষ্টি থেমে পাতা শুকালে তবেই স্প্রে করবেন।"
            )
        else:
            spray_part = (
                f"রোগ নিয়ন্ত্রণে অবিলম্বে {chem} {dose} হারে মিশিয়ে সকালের দিকে বা পড়ন্ত বিকেলে স্প্রে করুন। "
                "পাশাপাশি জমির অতিরিক্ত পানি সরিয়ে জমিকে রোদ পেতে দিন।"
            )

        if is_predatory_price and fair_price_per_kg and offered_price_per_kg:
            market_part = (
                f"বাজার সতর্কতা: ফড়িয়া বা মধ্যস্বত্বভোগী আপনাকে প্রতি কেজিতে মাত্র {offered_price_per_kg:.1f} টাকা প্রস্তাব করছে, "
                f"অথচ পাইকারি ন্যায্যমূল্য {fair_price_per_kg:.1f} টাকা। এখনই কম দামে বিক্রি না করে {recommended_selling_window or 'আসন্ন হাটের'} জন্য অপেক্ষা করুন।"
            )
        else:
            market_part = "বর্তমানে আপনার ফসলের বাজারদর স্থিতিশীল রয়েছে; উপযুক্ত হাটে ভালো দামে বিক্রি করতে পরামর্শ দেওয়া হচ্ছে।"

        closing = "যেকোনো প্রয়োজনে কৃষি বন্ধুর পরামর্শ মেনে চলুন। ধন্যবাদ।"

        return f"{greeting} {diagnosis} {spray_part} {market_part} {closing}"

    @classmethod
    def synthesize_speech(cls, text: str) -> Tuple[bytes, str, Optional[str]]:
        """
        Converts sanitized Bengali text to high-fidelity WAV audio using
        Gemini's native Text-to-Speech model (gemini-2.5-flash-preview-tts)
        with the project's existing GEMINI_API_KEY.

        Returns:
            Tuple of (audio_bytes, mime_type, error_message_if_any)
        """
        clean_text = cls.clean_bengali_tts_text(text)
        if not clean_text:
            return b"", "", "No text provided for audio synthesis."

        gemini_key = cls.get_gemini_api_key()
        if not gemini_key:
            err_msg = (
                "Gemini API key is not configured. "
                "Please set GEMINI_API_KEY in backend/.env to enable spoken audio."
            )
            print(f"[AudioAdvisoryService] Notice: {err_msg}")
            return b"", "audio/wav", err_msg

        model_name = cls.get_tts_model()
        voice_name = cls.get_tts_voice()
        prompt = cls.build_tts_prompt(clean_text)

        # Requirement 6: Print/log the exact Bengali text sent to the TTS API
        log_header = "\n" + "=" * 75 + "\n[AudioAdvisoryService] LIVE BENGALI TEXT FOR GEMINI NATIVE TTS SYNTHESIS:\n" + "-" * 75 + "\n"
        log_meta = (
            f"\n" + "-" * 75 + f"\nModel: {model_name} | Voice: {voice_name} | Key: Present ({gemini_key[:6]}...)\n"
            + "=" * 75 + "\n"
        )
        try:
            print(log_header + clean_text + log_meta)
        except UnicodeEncodeError:
            import sys
            sys.stdout.buffer.write((log_header + clean_text + log_meta).encode("utf-8", errors="replace"))
            sys.stdout.flush()

        # Gemini Native TTS Endpoint (uses standard GEMINI_API_KEY)
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": voice_name
                        }
                    }
                }
            }
        }

        try:
            with httpx.Client(timeout=35.0) as client:
                resp = client.post(endpoint, json=request_body)
                if resp.status_code != 200:
                    err_detail = ""
                    try:
                        err_json = resp.json()
                        err_detail = err_json.get("error", {}).get("message", resp.text)
                    except Exception:
                        err_detail = resp.text
                    err_msg = f"Gemini TTS API Error ({resp.status_code}): {err_detail}"
                    print(f"[AudioAdvisoryService] ERROR: {err_msg}")
                    return b"", "audio/wav", err_msg

                data = resp.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    err_msg = "Gemini TTS returned no candidates."
                    print(f"[AudioAdvisoryService] ERROR: {err_msg}")
                    return b"", "audio/wav", err_msg

                parts = candidates[0].get("content", {}).get("parts", [])
                raw_audio_b64 = None
                mime_type = "audio/wav"
                for part in parts:
                    if "inlineData" in part:
                        raw_audio_b64 = part["inlineData"].get("data")
                        mime_type = part["inlineData"].get("mimeType", "audio/wav")
                        break

                if not raw_audio_b64:
                    err_msg = "Gemini TTS response did not contain inline audio data."
                    print(f"[AudioAdvisoryService] ERROR: {err_msg}")
                    return b"", "audio/wav", err_msg

                raw_bytes = base64.b64decode(raw_audio_b64)
                # Convert raw PCM (16-bit 24kHz) to standard playable WAV container
                wav_bytes = cls.pcm_to_wav(raw_bytes, sample_rate=24000)
                return wav_bytes, "audio/wav", None

        except httpx.HTTPError as e:
            err_msg = f"Gemini TTS Network Error: {str(e)}"
            print(f"[AudioAdvisoryService] ERROR: {err_msg}")
            return b"", "audio/wav", err_msg
        except Exception as e:
            err_msg = f"Gemini TTS unexpected error: {str(e)}"
            print(f"[AudioAdvisoryService] ERROR: {err_msg}")
            return b"", "audio/wav", err_msg

    @classmethod
    def synthesize_speech_base64(cls, text: str) -> Tuple[str, Optional[str]]:
        """
        Synthesizes speech via Gemini native TTS and returns (base64_wav_audio, error_message).
        """
        audio_bytes, _, error_msg = cls.synthesize_speech(text)
        if audio_bytes:
            return base64.b64encode(audio_bytes).decode("utf-8"), None
        return "", error_msg
