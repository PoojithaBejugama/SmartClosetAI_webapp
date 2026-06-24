"""
Gemini-powered clothing metadata generation.

This file contains the AI-specific logic for understanding an uploaded clothing
photo. The rest of the backend calls these helpers instead of talking to Gemini
directly.

The upload flow is:

1. The frontend sends an image to `/clothes/analyze`.
2. `read_image_upload` validates and reads the image bytes.
3. `analyze_clothing_image` sends those bytes to Gemini.
4. Gemini returns JSON metadata.
5. `_normalize_analysis` validates and cleans that JSON.
6. The route sends the cleaned metadata back to the frontend for editing.
"""

import json
import logging
import os
from typing import Any, Dict, List

from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field, ValidationError

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover - only hit when dependencies have not been installed yet.
    genai = None
    types = None


# Uvicorn's logger is visible in local terminal output and Render logs.
logger = logging.getLogger("uvicorn.error")


class ClothingAIAnalysis(BaseModel):
    """
    Internal Python shape for Gemini's clothing analysis result.

    This is similar to `schemas.ClothingAnalyzeResponse`, but it lives here so
    the AI helper can validate Gemini output before the route returns anything.
    Default empty strings make validation more forgiving if optional-looking data
    is missing, but the prompt still asks Gemini to provide every field.
    """

    name: str = ""
    category: str = ""
    color: str = ""
    season: str = ""
    occasion: str = ""
    description: str = ""
    material_guess: str = ""
    recommendation_notes: str = ""
    style_tags: List[str] = Field(default_factory=list)
    ai_confidence: float = 0.0


GEMINI_METADATA_MODEL = os.getenv("GEMINI_METADATA_MODEL", "gemini-2.0-flash")

METADATA_SCHEMA: Dict[str, Any] = {
    "type": "OBJECT",
    "required": [
        "name",
        "category",
        "color",
        "season",
        "occasion",
        "description",
        "material_guess",
        "recommendation_notes",
        "style_tags",
        "ai_confidence",
    ],
    "properties": {
        "name": {"type": "STRING"},
        "category": {"type": "STRING"},
        "color": {"type": "STRING"},
        "season": {"type": "STRING"},
        "occasion": {"type": "STRING"},
        "description": {"type": "STRING"},
        "material_guess": {"type": "STRING"},
        "recommendation_notes": {"type": "STRING"},
        "style_tags": {"type": "ARRAY", "items": {"type": "STRING"}},
        "ai_confidence": {"type": "NUMBER"},
    },
}

METADATA_PROMPT = """
Analyze this clothing item image for a digital closet app.

Return only JSON with:
- name: short item name, e.g. "Navy cropped hoodie"
- category: one of Top, Bottom, Dress, Outerwear, Shoes, Accessories
- color: primary visible color
- season: one of Spring, Summer, Fall, Winter, All Season
- occasion: one of Casual, Formal, Business, Party, Sport, Date Night
- description: comprehensive visual description covering garment type, silhouette, fit, details, pattern, color, and style identity
- material_guess: likely material from the image, phrased as a guess, e.g. "cotton fleece"
- recommendation_notes: general styling advice and common pairings with other clothing
- style_tags: 3 to 8 lowercase hyphenated tags useful for outfit recommendations
- ai_confidence: number from 0 to 1 for the overall metadata confidence

If a field is uncertain, make the best useful guess and lower ai_confidence.
"""


async def read_image_upload(image: UploadFile) -> bytes:
    """
    Validate an uploaded image and return its raw bytes.

    `UploadFile` is FastAPI's object for files sent in multipart forms. Gemini
    needs the actual image bytes, so this function:

    - checks that the browser labeled the file as an image,
    - reads the bytes from the upload stream,
    - rejects empty files before calling Gemini.
    """

    # The analysis endpoint validates the same image constraints as the save endpoint before calling Gemini.
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    return image_bytes


def _normalize_analysis(data: Dict[str, Any]) -> ClothingAIAnalysis:
    """
    Convert raw Gemini JSON into safe app metadata.

    AI responses can be messy, so this function does cleanup before the rest of
    the app uses the metadata:

    - Pydantic verifies the expected fields and types.
    - `ai_confidence` is forced into the 0-to-1 range.
    - tags are lowercased, spaces become hyphens, empty tags are removed, and
      the list is limited to eight tags.
    """

    # Gemini returns JSON text, then Pydantic gives the app a predictable metadata shape.
    try:
        analysis = ClothingAIAnalysis.model_validate(data)
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Gemini returned invalid clothing metadata") from exc

    analysis.ai_confidence = max(0.0, min(1.0, analysis.ai_confidence))
    analysis.style_tags = [
        tag.strip().lower().replace(" ", "-")
        for tag in analysis.style_tags
        if isinstance(tag, str) and tag.strip()
    ][:8]
    return analysis


def analyze_clothing_image(image_bytes: bytes, mime_type: str) -> ClothingAIAnalysis:
    """
    Send one clothing image to Gemini and return structured metadata.

    This function keeps all Gemini-specific details in one place: reading the API
    key, choosing the model, building the prompt, requesting JSON output, parsing
    the response, and converting Gemini errors into HTTP errors the frontend can
    understand.
    """

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the backend")
    if genai is None or types is None:
        raise HTTPException(status_code=500, detail="Gemini SDK is not installed on the backend")

    client = genai.Client(api_key=api_key)

    # Log only safe request details. Do not log the API key or raw image bytes.
    logger.info(
        "Sending clothing metadata request to Gemini: %s",
        json.dumps(
            {
            "gemini_model": GEMINI_METADATA_MODEL,
            "mime_type": mime_type,
            "image_size_bytes": len(image_bytes),
            "prompt": METADATA_PROMPT.strip(),
            "response_schema": METADATA_SCHEMA,
            },
            default=str,
        ),
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_METADATA_MODEL,
            contents=[
                METADATA_PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                # Request JSON so the upload form can map Gemini output directly into separate fields.
                response_mime_type="application/json",
                response_schema=METADATA_SCHEMA,
            ),
        )
    except Exception as exc:
        logger.exception("Gemini metadata generation failed")
        raise HTTPException(status_code=502, detail=f"Gemini metadata generation failed: {exc}") from exc

    logger.info(
        "Received clothing metadata response from Gemini: %s",
        json.dumps(
            {
            "gemini_model": GEMINI_METADATA_MODEL,
            "raw_response_text": response.text,
            },
            default=str,
        ),
    )

    try:
        parsed = json.loads(response.text or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="Gemini returned unreadable clothing metadata") from exc

    return _normalize_analysis(parsed)
