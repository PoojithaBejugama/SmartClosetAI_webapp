from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="SmartCloset AI API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to SmartCloset AI API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/items")
def get_items():
    return {"items": []}


@app.post("/api/items")
def create_item(item: dict):
    return {"created": item}


@app.get("/api/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id, "name": "Sample Item"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)