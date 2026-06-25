# SmartClosetAI Backend

FastAPI backend for SmartClosetAI.

The backend handles authenticated clothing uploads, Gemini-powered AI metadata generation, Supabase Storage image uploads, and PostgreSQL persistence.

## Current backend responsibilities

- Verify Supabase Auth bearer tokens.
- Create/find the matching local user row.
- Receive clothing images from the frontend.
- Send image bytes to Gemini for clothing metadata.
- Return AI-generated metadata to the frontend before saving.
- Upload saved clothing images to Supabase Storage.
- Store clothing metadata in PostgreSQL.
- Provide basic clothing and outfit API routes.

## Tech stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn
- Supabase Python client
- Gemini via `google-genai`

## Important files

```text
backend/app/main.py
  FastAPI app setup, CORS, startup database setup, and API routes.

backend/app/ai_metadata.py
  Gemini clothing analysis logic, prompt, response schema, and response cleanup.

backend/app/auth.py
  Supabase token verification and local user mapping.

backend/app/database.py
  SQLAlchemy engine, session setup, and database URL handling.

backend/app/models.py
  SQLAlchemy models for users, clothes, outfits, and outfit items.

backend/app/schemas.py
  Pydantic request/response schemas.

backend/requirements.txt
  Python dependencies.
```

## AI description endpoint

```text
POST /clothes/analyze
```

Receives:

- multipart form field `image`
- Supabase bearer token in the `Authorization` header

Flow:

```text
1. Frontend sends image as multipart/form-data.
2. Backend verifies the Supabase user.
3. FastAPI receives the file as `UploadFile`.
4. `read_image_upload` validates the file and reads bytes.
5. `analyze_clothing_image` sends the bytes to Gemini.
6. Gemini returns JSON metadata.
7. Backend validates/normalizes the metadata.
8. Backend returns metadata to the frontend.
```

Response shape:

```json
{
  "name": "Navy cropped hoodie",
  "category": "Top",
  "color": "Navy",
  "season": "Fall",
  "occasion": "Casual",
  "description": "Detailed visual description of the item.",
  "material_guess": "cotton fleece",
  "recommendation_notes": "Styling advice and common pairings.",
  "style_tags": ["casual", "cozy", "layering-piece"],
  "ai_confidence": 0.86
}
```

This endpoint does not save anything. It only analyzes the image.

## Save clothing endpoint

```text
POST /clothes
```

Receives:

- multipart form field `image`
- final user-editable metadata fields
- Supabase bearer token

Flow:

```text
1. Backend verifies the user.
2. Backend uploads the image to Supabase Storage.
3. Supabase returns a public image URL.
4. Backend creates a `clothes` row in PostgreSQL.
5. Backend returns the saved clothing item.
```

The database stores the image URL, not raw image bytes.

## Environment variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartclosetdb
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=clothing-images
GEMINI_API_KEY=your-gemini-api-key
GEMINI_METADATA_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=http://localhost:8080
```

Do not expose these backend secrets in the frontend:

- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `DATABASE_URL`

## Local setup

From the backend folder:

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create your local PostgreSQL database:

```sql
CREATE DATABASE smartclosetdb;
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Database notes

Tables are created at startup with:

```py
Base.metadata.create_all(bind=engine)
```

The app also runs some defensive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements in `main.py` so older deployed databases can receive new AI metadata columns.

For a production-grade migration system, add Alembic later.

## Main API routes

### General

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | Welcome/sanity route |
| `GET` | `/health` | Health check |
| `POST` | `/seed-user` | Legacy development helper |

### Clothes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/clothes/analyze` | Analyze clothing image with Gemini |
| `POST` | `/clothes` | Save clothing image and metadata |
| `GET` | `/clothes` | List current user's clothing items |
| `PUT` | `/clothes/{clothing_id}` | Update one clothing item |
| `DELETE` | `/clothes/{clothing_id}` | Delete one clothing item |

### Outfits

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/outfits` | Create outfit |
| `GET` | `/outfits` | List current user's outfits |
| `GET` | `/outfits/{outfit_id}` | Get one outfit |
| `PUT` | `/outfits/{outfit_id}` | Update one outfit |
| `DELETE` | `/outfits/{outfit_id}` | Delete one outfit |

## Gemini logging

`app/ai_metadata.py` logs:

- Gemini model
- image MIME type
- image size in bytes
- prompt
- requested response schema
- raw Gemini response text

It does not log:

- Gemini API key
- Supabase keys
- raw image bytes

View these logs in your local Uvicorn terminal or Render service logs.

## Roadmap

- [x] Supabase-authenticated backend routes
- [x] Gemini clothing image analysis
- [x] Supabase Storage upload for clothing images
- [x] PostgreSQL persistence for clothing metadata
- [ ] Add file size limits
- [ ] Add stronger image validation
- [ ] Add Alembic migrations
- [ ] Add automated backend tests
- [ ] Add real AI outfit recommendation endpoint
- [ ] Improve production error handling/log formatting
- [ ] Add private storage policies instead of public image URLs

