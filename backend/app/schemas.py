"""
Pydantic schemas for API request and response data.

Schemas are different from database models:

- SQLAlchemy models in `models.py` describe database tables.
- Pydantic schemas in this file describe the shape of data the API accepts and
  returns.

FastAPI uses these schemas for validation and documentation. For example, when a
route says `response_model=ClothingResponse`, FastAPI knows exactly which fields
to include in the JSON response.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ClothingCreate(BaseModel):
    """
    Data needed to create a clothing item.

    This schema is mostly useful documentation now because the current create
    route receives `multipart/form-data` fields instead of a JSON body. It still
    describes the same data shape: user-editable fields plus AI metadata.
    """

    image_url: str
    name: Optional[str] = None
    category: str
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    description: Optional[str] = None
    material_guess: Optional[str] = None
    recommendation_notes: Optional[str] = None
    style_tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: bool = False


class ClothingUpdate(BaseModel):
    """
    Data allowed when editing a clothing item.

    Every field is optional because a user might update only one thing, such as
    their personal notes, without changing the AI description or image URL.
    """

    image_url: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    description: Optional[str] = None
    material_guess: Optional[str] = None
    recommendation_notes: Optional[str] = None
    style_tags: Optional[List[str]] = None
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: Optional[bool] = None


class ClothingAnalyzeResponse(BaseModel):
    """
    JSON returned by `/clothes/analyze`.

    This contains Gemini-generated metadata only. It does not include `notes`
    because notes are reserved for the user's personal thoughts.
    """

    name: str
    category: str
    color: str
    season: str
    occasion: str
    description: str
    material_guess: str
    recommendation_notes: str
    style_tags: List[str]
    ai_confidence: float


class ClothingResponse(BaseModel):
    """
    JSON returned when clothing items are fetched or saved.

    This includes database-owned fields such as `id`, `user_id`, `created_at`,
    and `updated_at`, plus the app fields users and AI can see.
    """

    id: int
    user_id: int
    image_url: str
    name: Optional[str] = None
    category: str
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    description: Optional[str] = None
    material_guess: Optional[str] = None
    recommendation_notes: Optional[str] = None
    style_tags: Optional[List[str]] = None
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """
        Tell Pydantic it can read data from SQLAlchemy model objects.

        Without `from_attributes = True`, Pydantic expects a plain dictionary.
        With it, FastAPI can pass a `models.Clothing` object and Pydantic will
        read fields like `item.category` and `item.image_url`.
        """

        from_attributes = True


class OutfitItemCreate(BaseModel):
    """
    Data needed to attach one clothing item to an outfit.

    `clothing_id` points to an existing clothing row. `slot` is optional and can
    describe how the item is used, such as "Top", "Shoes", or "Accessory".
    """

    clothing_id: int
    slot: Optional[str] = None


class OutfitCreate(BaseModel):
    """
    Data needed to create a saved outfit.

    The outfit has basic details like name/occasion, and an `items` list that
    tells the backend which clothing pieces belong in the outfit.
    """

    name: str
    source: str = "manual"
    occasion: Optional[str] = None
    notes: Optional[str] = None
    items: List[OutfitItemCreate]


class OutfitUpdate(BaseModel):
    """
    Data allowed when editing a saved outfit.

    All fields are optional so a route can update just the name, just the notes,
    or replace the outfit's item list.
    """

    name: Optional[str] = None
    source: Optional[str] = None
    occasion: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[OutfitItemCreate]] = None


class OutfitItemResponse(BaseModel):
    """
    JSON returned for one clothing item link inside an outfit.

    This represents the row in the join table, not the full clothing item image
    and metadata.
    """

    id: int
    outfit_id: int
    clothing_id: int
    slot: Optional[str] = None
    created_at: datetime

    class Config:
        """Allow this response schema to read values from SQLAlchemy objects."""

        from_attributes = True


class OutfitResponse(BaseModel):
    """
    JSON returned for a saved outfit.

    The `items` field contains the outfit-item join rows so the frontend knows
    which clothing IDs are part of the outfit.
    """

    id: int
    user_id: int
    name: str
    source: str
    occasion: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OutfitItemResponse]

    class Config:
        """Allow this response schema to read values from SQLAlchemy objects."""

        from_attributes = True
