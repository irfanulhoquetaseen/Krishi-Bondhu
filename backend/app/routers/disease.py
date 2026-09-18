import io
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from PIL import Image

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

from ..models.disease import DiseaseDetectionResponse
from ..services.disease_service import DiseaseService, VisionAPIError

router = APIRouter(tags=["Visual Crop Disease Detection"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif",
    "application/octet-stream",  # Mobile webview fallback
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"}


@router.post(
    "/disease-detection",
    response_model=DiseaseDetectionResponse,
    summary="Diagnose crop foliar disease from leaf imagery",
    description=(
        "Accepts an uploaded crop image (JPEG, PNG, WEBP, AVIF, HEIC), converts unsupported formats "
        "to JPEG server-side, and analyzes foliar symptoms with Krishi Bondhu Vision AI acting as a senior plant "
        "pathologist. Returns structured JSON with identified disease, diagnostic reasoning, severity, and foliar distribution."
    ),
)
async def detect_crop_disease(
    file: UploadFile = File(..., description="Crop leaf/plant image file (JPEG, PNG, WEBP, AVIF, HEIC)"),
    expected_crop: Optional[str] = Form(None, description="Expected host crop name from voice query or manual selection"),
):
    """
    Analyzes uploaded crop imagery to detect plant pathology using Vision AI.
    Converts AVIF and HEIC formats to JPEG server-side.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided in request.",
        )

    # Validate filename extension
    filename = file.filename or "leaf_sample.jpg"
    ext = ("." + filename.split(".")[-1].lower()) if "." in filename else ""
    content_type = file.content_type or "image/jpeg"

    if content_type not in ALLOWED_IMAGE_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file format '{content_type}'. "
                "Please upload a valid crop foliage photo (JPEG, PNG, WEBP, AVIF, or HEIC)."
            ),
        )

    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) < 32:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image file is empty or corrupted. Please capture a clear leaf photo.",
            )

        # Max image size limit: 15MB
        if len(image_bytes) > 15 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file exceeds 15MB limit. Please compress or resize the photo.",
            )

        # Server-side format conversion for AVIF, HEIC, and HEIF to standard RGB JPEG
        needs_conversion = (
            content_type in ("image/avif", "image/heic", "image/heif")
            or ext in (".avif", ".heic", ".heif")
        )
        if needs_conversion:
            try:
                with Image.open(io.BytesIO(image_bytes)) as img:
                    if img.mode in ("RGBA", "P", "LA"):
                        img = img.convert("RGB")
                    elif img.mode != "RGB":
                        img = img.convert("RGB")

                    buffer = io.BytesIO()
                    img.save(buffer, format="JPEG", quality=92)
                    image_bytes = buffer.getvalue()
                    content_type = "image/jpeg"
                    filename = (filename.rsplit(".", 1)[0] if "." in filename else filename) + ".jpg"
            except Exception as conv_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to decode and convert image ({ext or content_type}): {str(conv_err)}. Please upload a valid JPEG, PNG, WEBP, AVIF, or HEIC photo.",
                )

        diagnosis = DiseaseService.analyze_crop_image(
            image_bytes=image_bytes,
            filename=filename,
            content_type=content_type,
            expected_crop=expected_crop,
        )
        return diagnosis

    except HTTPException:
        raise
    except VisionAPIError as ve:
        raise HTTPException(
            status_code=ve.status_code,
            detail=ve.message,
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Foliar pathology analysis failed: {str(exc)}",
        )
