# SmartClosetAI

SmartClosetAI is a full-stack wardrobe app for uploading clothing photos, saving them in a digital closet, and using AI to generate useful item metadata.

Current status: the core AI clothing description flow is implemented. Outfit recommendations and deeper styling intelligence are still roadmap work.

## What the app does today

- Users sign up and log in with Supabase Auth.
- Users upload a clothing photo from the React frontend.
- The frontend sends the image to the FastAPI backend.
- The backend sends the image bytes to Gemini.
- Gemini returns structured metadata:
  - item name
  - category
  - color
  - season
  - occasion
  - AI description
  - material guess
  - recommendation notes
  - style tags
  - AI confidence
- The frontend fills the upload form with the AI result.
- The user can edit the AI fields before saving.
- When saved, the backend uploads the image to Supabase Storage and stores the item metadata in PostgreSQL.

## Current feature status

| Area | Status | Notes |
|---|---:|---|
| Supabase authentication | Done | Email/password and Google auth are wired through Supabase. |
| Protected frontend routes | Done | App pages require a signed-in user. |
| Clothing image upload | Done | Frontend sends multipart image uploads to FastAPI. |
| Gemini AI item description | Done | Backend analyzes image bytes and returns structured metadata. |
| Closet storage | Done | Clothing rows are saved in PostgreSQL with Supabase Storage image URLs. |
| Closet browsing | Mostly done | Users can view saved clothing items. |
| Saved outfits | Partially done | Basic outfit routes/UI exist, but this is not the main completed feature yet. |
| AI outfit recommendations | Roadmap | Recommendation UI exists, but true AI recommendation logic is still future work. |
| Profile/settings persistence | Roadmap | Some UI exists, but not all settings are persisted. |

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod
- Supabase JS client

### Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Supabase Auth verification
- Supabase Storage
- Gemini via `google-genai`

## High-level architecture

```text
React frontend
  |
  | Supabase session token
  | multipart image upload
  v
FastAPI backend
  |
  | verifies user with Supabase Auth
  | sends image bytes to Gemini
  | uploads final image to Supabase Storage
  v
PostgreSQL database
```

## AI description flow

```text
1. User selects a clothing image in the upload page.
2. `Upload.tsx` calls `clothingService.analyze(file)`.
3. `clothingService.ts` creates `FormData` and calls `/clothes/analyze`.
4. `apiClient.ts` attaches the Supabase bearer token.
5. `backend/app/main.py` receives the image as `UploadFile`.
6. `backend/app/ai_metadata.py` reads the image bytes and calls Gemini.
7. Gemini returns JSON metadata.
8. The frontend fills the upload form.
9. User edits fields if needed.
10. User saves the item.
11. Backend uploads image to Supabase Storage and saves metadata in PostgreSQL.
```

## Important files

```text
frontend/src/pages/Upload.tsx
  Upload form. Triggers AI analysis when a file is selected.

frontend/src/services/clothingService.ts
  Frontend service for clothing analyze/upload/fetch/update/delete calls.

frontend/src/services/apiClient.ts
  Shared API client. Adds Supabase auth token to backend requests.

frontend/src/hooks/useClothing.ts
  React Query hooks for clothing data and upload mutations.

backend/app/main.py
  FastAPI routes, including `/clothes/analyze` and `/clothes`.

backend/app/ai_metadata.py
  Gemini prompt, response schema, image-byte handling, and response cleanup.

backend/app/auth.py
  Verifies Supabase users and maps them to local database users.

backend/app/models.py
  SQLAlchemy database tables.

backend/app/schemas.py
  Pydantic API request/response shapes.
```

## Local setup

### Backend

```bash
cd smartcloset-ai/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd smartcloset-ai/frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:8080
```

In development, Vite proxies `/api` to `http://127.0.0.1:8000`.

## Environment variables

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=/api
VITE_DEMO_MODE=false
VITE_AUTH_DEMO_MODE=false
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartclosetdb
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=clothing-images
GEMINI_API_KEY=your-gemini-api-key
GEMINI_METADATA_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=http://localhost:8080
```

Do not put the Supabase service role key or Gemini API key in the frontend.

## Roadmap

- [x] Supabase authentication
- [x] Protected app routes
- [x] Clothing image upload from frontend to backend
- [x] Gemini-powered clothing description and metadata
- [x] Save clothing image to Supabase Storage
- [x] Save clothing metadata to PostgreSQL
- [ ] Improve AI prompt quality with more consistent fashion language
- [ ] Add manual re-analyze button for an existing clothing item
- [ ] Add stronger image validation and file-size limits
- [ ] Finish outfit builder polish
- [ ] Build real AI outfit recommendation logic
- [ ] Persist profile/settings changes
- [ ] Add wardrobe analytics
- [ ] Add dark mode
- [ ] Improve deployment docs for Vercel and Render

## Deployment notes

- Frontend can be deployed on Vercel as a Vite app.
- Backend can be deployed on Render as a FastAPI service.
- Each deployed service needs its own environment variables.
- To test a feature branch, create a separate Render service or preview deployment pointed at that branch.

