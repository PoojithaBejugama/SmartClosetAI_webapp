# SmartClosetAI Frontend

React/Vite frontend for SmartClosetAI.

The current completed frontend flow is the AI clothing description upload:

1. User selects a clothing image.
2. Frontend sends the image to the FastAPI backend.
3. Backend analyzes the image with Gemini.
4. Frontend receives AI metadata.
5. User reviews/edits the fields.
6. User saves the clothing item.

For the full frontend explanation, file map, auth flow, upload flow, environment variables, and roadmap, see:

[DETAILED_README.md](./DETAILED_README.md)

## Run locally

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:8080
```

Backend API requests are sent through `/api`, which Vite proxies to:

```text
http://127.0.0.1:8000
```

## Environment variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=/api
VITE_DEMO_MODE=false
VITE_AUTH_DEMO_MODE=false
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not put backend secrets in the frontend.

