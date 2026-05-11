from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ClothingCreate(BaseModel):
    image_url: str
    category: str
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: bool = False


class ClothingUpdate(BaseModel):
    image_url: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: Optional[bool] = None


class ClothingResponse(BaseModel):
    id: int
    user_id: int
    image_url: str
    category: str
    color: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OutfitItemCreate(BaseModel):
    clothing_id: int
    slot: Optional[str] = None


class OutfitCreate(BaseModel):
    name: str
    source: str = "manual"
    occasion: Optional[str] = None
    notes: Optional[str] = None
    items: List[OutfitItemCreate]


class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    source: Optional[str] = None
    occasion: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[OutfitItemCreate]] = None


class OutfitItemResponse(BaseModel):
    id: int
    outfit_id: int
    clothing_id: int
    slot: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OutfitResponse(BaseModel):
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
        from_attributes = True