from fastapi import APIRouter, HTTPException, Response, status
from typing import Optional

from ..models.report import ReportGenerationRequest, ReportGenerationResponse
from ..services.report_service import ReportService

router = APIRouter(tags=["Digital Crop Passport & Bengali Audio Advisory"])


@router.post(
    "/generate-report",
    response_model=ReportGenerationResponse,
    summary="Generate Bengali Audio Advisory & Digital Crop Passport (Field Health Card)",
    description=(
        "Fuses multimodal intelligence across Voice Intake (Task 1), Foliar Pathology Vision (Task 2), "
        "Multimodal Agronomic Treatment Plan (Task 3), and Market Price Anomaly Analysis (Task 4). "
        "Generates: (1) Natural conversational Bengali audio briefing via Krishi Bondhu AI, "
        "(2) High-quality Bengali speech audio stream via TTS (base64 MP3), "
        "(3) Downloadable vector PDF 'Field Health Card' styled to the Krishi Bondhu design system, "
        "and (4) Pre-formatted WhatsApp share text."
    ),
)
async def generate_crop_passport_report(request: ReportGenerationRequest):
    """
    Synthesizes farmer voice query, foliar vision diagnosis, weather spray rules,
    and market pricing into an authoritative Field Health Card with Bengali audio.
    """
    try:
        response = ReportService.generate_report(request)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Field Health Card report generation failed: {str(exc)}",
        )


@router.get(
    "/download-report-pdf/{passport_id}",
    summary="Download Field Health Card PDF by Passport ID",
    description="Returns raw application/pdf binary stream for direct browser download.",
)
async def download_report_pdf(passport_id: str):
    """
    Downloads the printable PDF Field Health Card from cache.
    """
    cached = ReportService.get_cached_pdf(passport_id)
    if not cached:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Passport ID '{passport_id}' not found or expired. Please re-generate the report.",
        )

    pdf_bytes, filename = cached
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


@router.post(
    "/download-report-pdf",
    summary="Generate and directly download Field Health Card PDF",
    description="Accepts full report payload and immediately streams back the generated PDF binary.",
)
async def generate_and_download_pdf(request: ReportGenerationRequest):
    """
    Directly streams back the generated PDF file from the given report request.
    """
    try:
        report = ReportService.generate_report(request)
        cached = ReportService.get_cached_pdf(report.passport_id)
        if cached:
            pdf_bytes, filename = cached
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Cache-Control": "no-cache",
                },
            )
        import base64
        return Response(
            content=base64.b64decode(report.pdf_base64),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{report.pdf_filename}"',
                "Cache-Control": "no-cache",
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF download: {str(exc)}",
        )
