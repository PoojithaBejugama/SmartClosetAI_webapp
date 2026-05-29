"""
Main FastAPI application for the SmartCloset backend.

This file is the backend entry point. When you run:

    uvicorn app.main:app --reload

Uvicorn imports this file, finds the `app` object, and starts serving the API.

The responsibilities in this file are:

- Create the FastAPI app.
- Configure CORS so the frontend can call the backend.
- Create/update database tables at startup.
- Upload clothing photos to Supabase Storage.
- Define all HTTP routes for clothes and outfits.
- Connect protected routes to the currently signed-in user.

Beginner mental model:
Each `@app.get`, `@app.post`, `@app.put`, or `@app.delete` decorator creates an
API endpoint. The function directly below the decorator is what runs when the
frontend calls that endpoint.
"""

import os
import json
import traceback
import uuid
from typing import List, Optional

from fastapi import FastAPI, Depends, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy import text
from sqlalchemy.orm import Session
from supabase import create_client

try:
    from .database import Base, engine, SessionLocal
    from . import schemas, models
    from .auth import get_current_user
    from .ai_metadata import analyze_clothing_image, read_image_upload
except ImportError:
    from database import Base, engine, SessionLocal
    import schemas, models
    from auth import get_current_user
    from ai_metadata import analyze_clothing_image, read_image_upload


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
    """
    Create missing database tables and add newer columns at server startup.

    `Base.metadata.create_all(bind=engine)` creates tables for the SQLAlchemy
    models if they do not already exist. It is helpful for local development.

    Important detail: `create_all` does not add new columns to tables that
    already exist. Because this app has evolved over time, the `ALTER TABLE`
    statements below add newer columns safely with `IF NOT EXISTS`.

    A larger production app would usually use Alembic migrations instead.
    """

    Base.metadata.create_all(bind=engine)
    # Auth: create_all does not add new columns to existing tables, so this keeps deployed DBs compatible.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id VARCHAR"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_supabase_user_id ON users (supabase_user_id)"))
        # AI metadata columns are added defensively so existing deployed databases keep working after this feature ships.
        connection.execute(text("ALTER TABLE clothes ADD COLUMN IF NOT EXISTS name VARCHAR"))
        connection.execute(text("ALTER TABLE clothes ADD COLUMN IF NOT EXISTS description VARCHAR"))
        connection.execute(text("ALTER TABLE clothes ADD COLUMN IF NOT EXISTS material_guess VARCHAR"))
        connection.execute(text("ALTER TABLE clothes ADD COLUMN IF NOT EXISTS recommendation_notes VARCHAR"))
        connection.execute(text("ALTER TABLE clothes ADD COLUMN IF NOT EXISTS style_tags JSONB"))

def get_db():
    """
    FastAPI dependency that gives one database session to a request.

    Routes declare `db: Session = Depends(get_db)`. FastAPI calls this function,
    passes the yielded `db` object into the route, and then closes the session
    after the request is complete.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_demo_user(db: Session):
    """
    Create or return the old demo user with id 1.

    This was useful before Supabase Auth was added. The app now uses real signed
    in users for clothing and outfits, but this helper is kept so the old
    `/seed-user` development route still works.
    """

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
    """
    Create a Supabase client for backend-owned Storage operations.

    Clothing images are uploaded from the backend, not directly from the
    browser. That keeps the Supabase service role key secret and lets the backend
    control where files are stored.
    """

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase storage is not configured on the backend"
        )

    # The service role key can bypass storage policies, so it must stay server-side only.
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def parse_style_tags(style_tags: Optional[str]) -> List[str]:
    """
    Convert style tags from multipart form text into a Python list.

    The frontend sends normal form fields because the clothing upload includes a
    file. Multipart forms do not have a real array type, so `style_tags` arrives
    as JSON text like:

        ["casual", "layering-piece"]

    This function parses that text, checks that it is actually a list, and
    normalizes each tag for consistent future recommendation logic.
    """

    # Multipart forms cannot send arrays directly, so the frontend sends style tags as JSON text.
    if not style_tags:
        return []

    try:
        parsed = json.loads(style_tags)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="style_tags must be a JSON array") from exc

    if not isinstance(parsed, list):
        raise HTTPException(status_code=400, detail="style_tags must be a JSON array")

    return [str(tag).strip().lower().replace(" ", "-") for tag in parsed if str(tag).strip()]


async def upload_clothing_image(image: UploadFile, current_user: models.User):
    """
    Validate and upload a clothing image to Supabase Storage.

    The database should not store raw image bytes. Instead, this function uploads
    the image file to Supabase Storage and returns the public URL. The clothing
    row then stores only that URL in `image_url`.

    The path includes the user's local id and a UUID so two users cannot
    accidentally overwrite each other's files.
    """

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    file_extension = os.path.splitext(image.filename or "")[1] or ".jpg"
    # A UUID makes every storage path unique and avoids overwriting another user's file.
    # Auth: include the authenticated user's local id in the path so storage stays organized per user.
    storage_path = f"user-{current_user.id}/{uuid.uuid4()}{file_extension}"

    supabase = get_supabase_client()

    try:
        supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            storage_path,
            image_bytes,
            file_options={
                # Supabase Storage needs the MIME type so the public URL renders as an image in the browser.
                "content-type": image.content_type,
                "upsert": "false",
            },
        )
        public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(storage_path)
    except Exception as exc:
        # Render logs this traceback, which makes storage/env/bucket failures visible during deployment debugging.
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Could not upload image to Supabase: {exc}") from exc

    if not public_url:
        raise HTTPException(status_code=500, detail="Supabase did not return a public image URL")

    return public_url

@app.get("/")
def read_root():
    """
    Basic welcome endpoint.

    This is mostly a quick sanity check that the API server is running. It does
    not require authentication and does not touch the database.
    """

    return {"message": "Welcome to SmartCloset AI API. SmartCloset backend running."}

@app.get("/health")
def health_check():
    """
    Health check endpoint for local debugging or deployment monitoring.

    A hosting provider can call this route to confirm the server process is
    responding. It intentionally returns a tiny JSON object.
    """

    return {"status": "healthy"}

@app.post("/seed-user")
def seed_user(db: Session = Depends(get_db)):
    """
    Development helper route that creates the old demo user.

    Most authenticated routes now use Supabase users through `get_current_user`.
    This endpoint remains useful for older manual tests that expect user id 1.
    """

    existing_user = db.query(models.User).filter(models.User.id == 1).first()
    if existing_user:
        return {"message": "User already exists"}

    user = ensure_demo_user(db)
    return {"message": "Demo user created", "user_id": user.id}


# -------------------------
# CLOTHES ROUTES
# -------------------------

@app.post("/clothes/analyze", response_model=schemas.ClothingAnalyzeResponse)
async def analyze_clothing_item(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """
    Analyze a clothing photo with Gemini before saving the item.

    The frontend calls this endpoint immediately after a user selects a photo.
    The route validates the image, sends it to Gemini, and returns editable AI
    metadata such as item name, description, material guess, and styling notes.

    No database row is created here. Saving happens later in `create_clothing_item`.
    """

    # The signed-in user must own the upload flow, but analysis does not create database rows.
    del current_user
    image_bytes = await read_image_upload(image)
    analysis = analyze_clothing_image(image_bytes, image.content_type or "image/jpeg")
    return analysis


#add new clothes
@app.post("/clothes", response_model=schemas.ClothingResponse)
async def create_clothing_item(
    # UploadFile receives the binary image; Form receives the text fields from the same multipart request.
    image: UploadFile = File(...),
    name: Optional[str] = Form(None),
    category: str = Form(...),
    color: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    occasion: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    material_guess: Optional[str] = Form(None),
    recommendation_notes: Optional[str] = Form(None),
    style_tags: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    ai_confidence: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Save a new clothing item for the signed-in user.

    This endpoint receives one multipart request containing:

    - the binary image file,
    - user-editable fields like category/color/notes,
    - AI metadata generated earlier by `/clothes/analyze`.

    The image is uploaded to Supabase Storage first. Then a database row is
    created with the public image URL and metadata. The route returns the saved
    clothing row as JSON.
    """

    # Auth: authenticated uploads use the signed-in user's local database id, not demo user id 1.
    image_url = await upload_clothing_image(image, current_user)

    new_item = models.Clothing(
        user_id=current_user.id,
        # Postgres stores only the public Supabase URL, not the image bytes/base64 payload.
        image_url=image_url,
        name=name,
        category=category,
        color=color,
        season=season,
        occasion=occasion,
        description=description,
        material_guess=material_guess,
        recommendation_notes=recommendation_notes,
        style_tags=parse_style_tags(style_tags),
        # User notes remain separate from AI description/recommendation fields.
        notes=notes,
        ai_confidence=ai_confidence,
        is_favorite=False
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

#gets all the clothes list from DB
@app.get("/clothes", response_model=List[schemas.ClothingResponse])
def get_clothing_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Return all clothing items owned by the signed-in user.

    The filter `models.Clothing.user_id == current_user.id` is important. It
    prevents one user from seeing another user's closet.
    """

    # Auth: users only see clothing rows that belong to their local user id.
    items = db.query(models.Clothing).filter(models.Clothing.user_id == current_user.id).all()
    return items

#you can update only the fields you want
@app.put("/clothes/{clothing_id}", response_model=schemas.ClothingResponse)
def update_clothing_item(
    clothing_id: int,
    clothing_update: schemas.ClothingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update selected fields on one clothing item.

    The request body uses `ClothingUpdate`, where every field is optional.
    `exclude_unset=True` means only fields actually sent by the frontend are
    applied. Fields omitted from the request stay unchanged.
    """

    # Auth: updates are scoped by item id and owner id so one user cannot edit another user's clothes.
    item = (
        db.query(models.Clothing)
        .filter(models.Clothing.id == clothing_id, models.Clothing.user_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")

    update_data = clothing_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@app.delete("/clothes/{clothing_id}")
def delete_clothing_item(
    clothing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete one clothing item owned by the signed-in user.

    Before deleting the clothing row, the route deletes any `OutfitItem` join
    rows that reference it. This prevents orphaned outfit links pointing to a
    clothing item that no longer exists.
    """

    # Auth: deletes are scoped by owner id for per-user data isolation.
    item = (
        db.query(models.Clothing)
        .filter(models.Clothing.id == clothing_id, models.Clothing.user_id == current_user.id)
        .first()
    )

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
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a saved outfit from existing clothing items.

    The route first creates the parent `Outfit` row. Then it loops through the
    requested clothing items and creates `OutfitItem` join rows. Each referenced
    clothing item is checked to make sure it belongs to the current user.
    """

    # Auth: outfits are saved under the authenticated user's local database id.
    new_outfit = models.Outfit(
        user_id=current_user.id,
        name=outfit.name,
        source=outfit.source,
        occasion=outfit.occasion,
        notes=outfit.notes
    )

    db.add(new_outfit)
    db.commit()
    db.refresh(new_outfit)

    for item in outfit.items:
        # Auth: an outfit can only reference clothing owned by the same authenticated user.
        clothing = (
            db.query(models.Clothing)
            .filter(models.Clothing.id == item.clothing_id, models.Clothing.user_id == current_user.id)
            .first()
        )
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
def get_outfits(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Return all saved outfits owned by the signed-in user.

    Like the clothing list route, the user filter is what keeps each user's data
    private.
    """

    # Auth: users only see their own saved outfits.
    outfits = db.query(models.Outfit).filter(models.Outfit.user_id == current_user.id).all()
    return outfits



@app.get("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def get_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Return one saved outfit by id.

    The query checks both `outfit_id` and `current_user.id`. That means even if
    a user guesses another outfit's id, they cannot read it unless they own it.
    """

    # Auth: fetch by outfit id and owner id to prevent cross-user reads.
    outfit = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id)
        .first()
    )

    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    return outfit


@app.put("/outfits/{outfit_id}", response_model=schemas.OutfitResponse)
def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update an outfit's details and optionally replace its item list.

    Basic fields like name, source, occasion, and notes are changed only if the
    frontend sent a non-null value. If `items` is provided, the route deletes the
    old outfit-item links and creates a new set.
    """

    # Auth: updates are scoped by outfit id and owner id.
    outfit = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id)
        .first()
    )

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
            # Auth: replacement outfit items must also belong to this authenticated user.
            clothing = (
                db.query(models.Clothing)
                .filter(models.Clothing.id == item.clothing_id, models.Clothing.user_id == current_user.id)
                .first()
            )
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
def delete_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete one saved outfit owned by the signed-in user.

    The route deletes related `OutfitItem` rows first, then deletes the parent
    `Outfit` row. This keeps the database from keeping unused join rows.
    """

    # Auth: deletes are scoped by owner id for per-user data isolation.
    outfit = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id)
        .first()
    )

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
