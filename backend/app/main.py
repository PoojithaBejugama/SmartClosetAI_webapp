from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import User, Clothing, Outfit, OutfitItem
import schemas, models


app = FastAPI(title="SmartCloset AI API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#this lets the routes talk to the DB
Base.metadata.create_all(bind=engine)

#Db session dependency - can only start if a db session is active
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

    user = models.User(
        id=1,
        email="demo@smartcloset.com",
        name="Demo User"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Demo user created", "user_id": user.id}


# -------------------------
# CLOTHES ROUTES
# -------------------------

@app.post("/clothes", response_model=schemas.ClothingResponse)
def create_clothing_item(
    clothing: schemas.ClothingCreate,
    db: Session = Depends(get_db)
):
    new_item = models.Clothing(
        user_id=1,
        image_url=clothing.image_url,
        category=clothing.category,
        color=clothing.color,
        season=clothing.season,
        occasion=clothing.occasion,
        notes=clothing.notes,
        ai_confidence=clothing.ai_confidence,
        is_favorite=clothing.is_favorite
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