from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from ..models.voice import VoiceIntakeResponse, ManualTextIntakeRequest
from ..services.voice_service import VoiceService

router = APIRouter(tags=["Voice-Guided Intake"])

@router.post("/voice-intake", response_model=VoiceIntakeResponse)
async def handle_voice_intake(
    file: UploadFile = File(..., description="Audio recording file from MediaRecorder (webm, wav, mp3, m4a)"),
    farmer_id: Optional[str] = Form(default="demo-farmer"),
):
    """
    Accepts farmer voice recording, transcribes speech,
    and extracts structured agronomic parameters using Krishi Bondhu Voice AI.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file provided in request.",
        )

    try:
        audio_bytes = await file.read()
        if not audio_bytes or len(audio_bytes) < 256:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The recorded audio file is empty or too short. Please speak clearly into your microphone.",
            )

        filename = file.filename or "recording.webm"
        content_type = file.content_type or "audio/webm"

        result = VoiceService.process_voice_intake(
            audio_bytes=audio_bytes,
            filename=filename,
            content_type=content_type,
        )
        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice intake processing failed: {str(exc)}",
        )

@router.post("/text-intake", response_model=VoiceIntakeResponse)
async def handle_manual_text_intake(request: ManualTextIntakeRequest):
    """
    Fallback endpoint accepting typed/pasted query text in Bangla or English,
    extracting structured agronomic parameters via Krishi Bondhu Agro AI.
    """
    if not request.query_text or len(request.query_text.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query text must be at least 3 characters long.",
        )

    try:
        result = VoiceService.process_manual_text_intake(query_text=request.query_text)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Manual text intake processing failed: {str(exc)}",
        )
