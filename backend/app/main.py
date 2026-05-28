import os
import uuid
from typing import List, Optional

from fastapi import FastAPI, Depends, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.orm import Session
from supabase import create_client

try:
    from .database import Base, engine, SessionLocal
    from . import schemas, models
except ImportError:
    from database import Base, engine, SessionLocal
    import schemas, models


app = FastAPI(title="SmartCloset AI API", version="1.0.0")

# Supabase Storage is owned by the backend so the service role key never gets exposed to browser code.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "clothing-images")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS CONFIG LOADED")


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)

#Db session dependency - can only start if a db session is active
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_demo_user(db: Session):
    existing_user = db.query(models.User).filter(models.User.id == 1).first()
    if existing_user:
        return existing_user

    user = models.User(
        id=1,
        email="demo@smartcloset.com",
        name="Demo User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_supabase_client():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase storage is not configured on the backend"
        )

    # The service role key can bypass storage policies, so it must stay server-side only.
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


async def upload_clothing_image(image: UploadFile):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    file_extension = os.path.splitext(image.filename or "")[1] or ".jpg"
    # A UUID makes every storage path unique and avoids overwriting another user's file.
    storage_path = f"user-1/{uuid.uuid4()}{file_extension}"

    supabase = get_supabase_client()

    try:
        supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            storage_path,
            image_bytes,
            file_options={
                "content-type": image.content_type,
                "upsert": "false",
            },
        )
        public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(storage_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not upload image to Supabase: {exc}") from exc

    return public_url

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartCloset AI API. SmartCloset backend running."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/seed-user")
def seed_user(db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.id == 1).first()
    if existing_user:
        return {"message": "User already exists"}

    user = ensure_demo_user(db)
    return {"message": "Demo user created", "user_id": user.id}


# -------------------------
# CLOTHES ROUTES
# -------------------------

#add new clothes
@app.post("/clothes", response_model=schemas.ClothingResponse)
async def create_clothing_item(
    # UploadFile receives the binary image; Form receives the text fields from the same multipart request.
    image: UploadFile = File(...),
    category: str = Form(...),
    color: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    occasion: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    ensure_demo_user(db)
    image_url = await upload_clothing_image(image)

    new_item = models.Clothing(
        user_id=1,
        # Postgres stores only the public Supabase URL, not the image bytes/base64 payload.
        image_url=image_url,
        category=category,
        color=color,
        season=season,
        occasion=occasion,
        notes=notes,
        ai_confidence=None,
        is_favorite=False
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

#gets all the clothes list from DB
@app.get("/clothes", response_model=List[schemas.ClothingResponse])
def get_clothing_items(db: Session = Depends(get_db)):
    items = db.query(models.Clothing).all()
    return items

#you can update only the fields you want
@app.put("/clothes/{clothing_id}", response_model=schemas.ClothingResponse)
def update_clothing_item(
    clothing_id: int,
    clothing_update: schemas.ClothingUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(models.Clothing).filter(models.Clothing.id == clothing_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")

    update_data = clothing_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@app.delete("/clothes/{clothing_id}")
def delete_clothing_item(clothing_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Clothing).filter(models.Clothing.id == clothing_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")

    # Optional safety check:
    # if clothing item is used in outfits, delete those links first
    #Future upgrade: change this so you block dleetion if a outfit item exisst
    outfit_links = db.query(models.OutfitItem).filter(models.OutfitItem.clothing_id == clothing_id).all()
    for link in outfit_links:
        db.delete(link)

    db.delete(item)
    db.commit()

    return {"message": f"Clothing item {clothing_id} deleted successfully"}


# -------------------------
# OUTFIT ROUTES
# -------------------------

@app.post("/outfits", response_model=schemas.OutfitResponse)
def create_outfit(
    outfit: schemas.OutfitCreate,
    db: Session = Depends(get_db)
):
    ensure_demo_user(db)
    new_outfit = models.Outfit(
        user_id=1,
        name=outfit.name,
        source=outfit.source,
        occasion=outfit.occasion,
        notes=outfit.notes
    )

    db.add(new_outfit)
    db.commit()
    db.refresh(new_outfit)

    for item in outfit.items:
        clothing = db.query(models.Clothing).filter(models.Clothing.id == item.clothing_id).first()
        if not clothing:
            raise HTTPException(status_code=404, detail=f"Clothing item {item.clothing_id} not found")

        outfit_item = models.OutfitItem(
            outfit_id=new_outfit.id,
            clothing_id=item.clothing_id,
            slot=item.slot
        )
        db.add(outfit_item)

    db.commit()
    
    outfit_with_items = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == new_outfit.id)
        .first()
    )

    return outfit_with_items

 

@app.get("/outfits", response_model=List[schemas.OutfitResponse])
def get_outfits(db: Session = Depends(get_db)):
    outfits = db.query(models.Outfit).all()
    return outfits



@app.get("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id).first()

    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    return outfit


@app.put("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitUpdate,
    db: Session = Depends(get_db)
):
    outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id).first()

    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    # Update basic outfit fields
    if outfit_update.name is not None:
        outfit.name = outfit_update.name

    if outfit_update.source is not None:
        outfit.source = outfit_update.source

    if outfit_update.occasion is not None:
        outfit.occasion = outfit_update.occasion

    if outfit_update.notes is not None:
        outfit.notes = outfit_update.notes

    # If items are included, replace existing outfit items
    if outfit_update.items is not None:
        existing_items = db.query(models.OutfitItem).filter(models.OutfitItem.outfit_id == outfit_id).all()

        for existing_item in existing_items:
            db.delete(existing_item)

        db.commit()

        for item in outfit_update.items:
            clothing = db.query(models.Clothing).filter(models.Clothing.id == item.clothing_id).first()
            if not clothing:
                raise HTTPException(status_code=404, detail=f"Clothing item {item.clothing_id} not found")

            new_outfit_item = models.OutfitItem(
                outfit_id=outfit.id,
                clothing_id=item.clothing_id,
                slot=item.slot
            )
            db.add(new_outfit_item)

    db.commit()
    db.refresh(outfit)

    return outfit


@app.delete("/outfits/{outfit_id}")
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(models.Outfit).filter(models.Outfit.id == outfit_id).first()

    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    # Delete related outfit items first
    outfit_items = db.query(models.OutfitItem).filter(models.OutfitItem.outfit_id == outfit_id).all()
    for item in outfit_items:
        db.delete(item)

    db.delete(outfit)
    db.commit()

    return {"message": f"Outfit {outfit_id} deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
