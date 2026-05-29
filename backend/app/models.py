"""
SQLAlchemy database models for SmartCloset.

Each class in this file represents one database table. Each `Column(...)`
represents one column in that table. SQLAlchemy uses these classes so Python
code can work with database rows as normal Python objects.

Important idea:
- `models.py` describes how data is stored in PostgreSQL.
- `schemas.py` describes how data enters/leaves the API as JSON.

Those two files are related, but they solve different problems.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy import func
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class User(Base):
    """
    Represents one person using the app.

    A User owns many clothing items and many outfits. The app uses Supabase Auth
    for login, but still keeps a local `users` table so clothing/outfit rows can
    use a simple integer `user_id` foreign key.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Auth: Stores the Supabase Auth user id so backend rows can be linked to the signed-in user.
    supabase_user_id = Column(String, unique=True, nullable=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    clothes = relationship("Clothing", back_populates="user", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")


class Clothing(Base):
    """
    Represents one clothing item in a user's closet.

    This table stores both user-entered data and AI-generated metadata. The
    important separation is:

    - `notes`: personal notes written by the user.
    - `description`, `material_guess`, `recommendation_notes`, `style_tags`:
      AI-generated metadata that future outfit recommendations can use.
    """

    __tablename__ = "clothes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_url = Column(String, nullable=False)
    name = Column(String, nullable=True)
    category = Column(String, nullable=False)
    color = Column(String, nullable=True)
    season = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    description = Column(String, nullable=True)
    material_guess = Column(String, nullable=True)
    recommendation_notes = Column(String, nullable=True)
    # AI metadata stays separate from user notes so recommendations can use structured model output.
    style_tags = Column(JSON, nullable=True)
    notes = Column(String, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="clothes")
    outfit_items = relationship("OutfitItem", back_populates="clothing", cascade="all, delete-orphan")


class Outfit(Base):
    """
    Represents a saved outfit.

    An outfit is a named collection of clothing items. The actual clothing items
    are connected through the `OutfitItem` table instead of being stored directly
    on the outfit row.
    """

    __tablename__ = "outfits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    source = Column(String, nullable=False, default="manual")
    occasion = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit", cascade="all, delete-orphan")

class OutfitItem(Base):
    """
    Join table that connects outfits to clothing items.

    A single outfit can contain multiple clothes, and one clothing item can be
    used in multiple outfits. This "many-to-many" relationship is represented by
    rows in this table.
    """

    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    clothing_id = Column(Integer, ForeignKey("clothes.id"), nullable=False)
    slot = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    outfit = relationship("Outfit", back_populates="items")
    clothing = relationship("Clothing", back_populates="outfit_items")
