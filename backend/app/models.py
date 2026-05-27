#here we define how the tables look like using Declarative mapping

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy import func
from sqlalchemy.orm import relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    clothes = relationship("Clothing", back_populates="user", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")


class Clothing(Base):
    __tablename__ = "clothes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_url = Column(String, nullable=False)
    category = Column(String, nullable=False)
    color = Column(String, nullable=True)
    season = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="clothes")
    outfit_items = relationship("OutfitItem", back_populates="clothing", cascade="all, delete-orphan")


class Outfit(Base):
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
    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    clothing_id = Column(Integer, ForeignKey("clothes.id"), nullable=False)
    slot = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    outfit = relationship("Outfit", back_populates="items")
    clothing = relationship("Clothing", back_populates="outfit_items")
