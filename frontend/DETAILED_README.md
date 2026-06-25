# SmartClosetAI Frontend Details

This folder contains the React/Vite frontend for SmartClosetAI.

The app currently focuses on the clothing upload and AI description workflow. The user uploads an image, the frontend sends it to the backend, Gemini generates metadata, and the frontend lets the user review/edit the result before saving.

## Current frontend responsibilities

- Show public pages like landing, about, install, and auth.
- Manage Supabase login/signup session state.
- Protect authenticated app routes.
- Let users upload clothing images.
- Send selected images to the backend for Gemini analysis.
- Show AI-generated fields in an editable form.
- Save the final clothing item through the backend.
- Display saved closet items.

The frontend does not call Gemini directly. Gemini API keys stay on the backend.

## Important files

```text
src/pages/Auth.tsx
  Login/signup UI.

src/hooks/useAuth.ts
  Reads and updates Supabase auth session state.

src/contexts/AuthContext.tsx
  Provides auth state to the rest of the app.

src/lib/supabaseClient.ts
  Creates the browser-safe Supabase client using public anon key values.

src/services/apiClient.ts
  Shared HTTP client. Adds the Supabase bearer token to backend requests.

src/pages/Upload.tsx
  Main AI upload page. Sends selected image for analysis and fills the form.

src/services/clothingService.ts
  Clothing API calls: analyze image, upload item, fetch closet, update, delete.

src/hooks/useClothing.ts
  React Query hooks around clothingService.

src/components/UploadDropzone.tsx
  Drag-and-drop/file-picker UI for selecting clothing photos.

src/pages/Closet.tsx
  Displays saved clothing items.

src/types/index.ts
  Shared app-level clothing/outfit TypeScript types.

src/types/auth.ts
  Shared auth TypeScript types.

src/utils/validations.ts
  Zod validation schemas for forms.
```

## AI description flow in the frontend

The most important file is:

```text
src/pages/Upload.tsx
```

When the user chooses a file, `handleFile` runs:

```ts
const handleFile = async (f: File) => {
  setFile(f);
  setPreview(URL.createObjectURL(f));
  setAiDetected(false);
  setAnalyzing(true);

  try {
    const metadata = await clothingService.analyze(f);

    setValue("name", metadata.name);
    setValue("category", metadata.category);
    setValue("color", metadata.color);
    setValue("season", metadata.season);
    setValue("occasion", metadata.occasion);
    setValue("description", metadata.description);
    setValue("material_guess", metadata.material_guess);
    setValue("recommendation_notes", metadata.recommendation_notes);
    setValue("style_tags", metadata.style_tags);
    setValue("ai_confidence", metadata.ai_confidence);

    setAiDetected(true);
  } finally {
    setAnalyzing(false);
  }
};
```

This means:

1. Store the selected file in React state.
2. Create a local preview URL for the image.
3. Show an analyzing state.
4. Send the image to the backend.
5. Receive AI metadata.
6. Fill the form fields.
7. Let the user edit anything before saving.

## Analyze request

The frontend service lives in:

```text
src/services/clothingService.ts
```

Analyze only sends the image. It does not save the item:

```ts
analyze: (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return apiClient.upload<ClothingAnalysisResponse>("/clothes/analyze", formData);
},
```

The field name `"image"` matters. It matches the backend route:

```py
image: UploadFile = File(...)
```

## Save request

After analysis, the user clicks Save. `Upload.tsx` calls the upload mutation from:

```text
src/hooks/useClothing.ts
```

That eventually calls:

```ts
clothingService.upload(file, metadata)
```

The save request sends one multipart form containing:

- the image file
- final item name
- category
- color
- season
- occasion
- AI description
- material guess
- recommendation notes
- style tags
- user notes
- AI confidence

This goes to:

```text
POST /clothes
```

The backend then uploads the image to Supabase Storage and saves the database row.

## Auth flow

Auth is managed through Supabase.

Frontend files:

```text
src/pages/Auth.tsx
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
src/lib/supabaseClient.ts
src/services/apiClient.ts
```

The simple version:

1. User logs in or signs up with Supabase.
2. Supabase stores the browser session.
3. `useAuth.ts` mirrors the Supabase user in React state.
4. `apiClient.ts` reads the current Supabase access token.
5. Every backend request gets:

```text
Authorization: Bearer <supabase-access-token>
```

6. The backend verifies the token and finds/creates the local user row.

Passwords are not stored in the frontend or your PostgreSQL database. Supabase Auth owns password storage.

## Environment variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=/api
VITE_DEMO_MODE=false
VITE_AUTH_DEMO_MODE=false
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Notes:

- `VITE_SUPABASE_ANON_KEY` is safe for the frontend.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend.
- Never put `GEMINI_API_KEY` in the frontend.
- In local development, `/api` is proxied by Vite to `http://127.0.0.1:8000`.

## Local development

From the frontend folder:

```bash
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:8080
```

The Vite proxy in `vite.config.ts` forwards API requests:

```text
/api/clothes/analyze -> http://127.0.0.1:8000/clothes/analyze
```

So locally the backend should also be running:

```bash
cd ../backend
uvicorn app.main:app --reload
```

## Current app pages

| Page | Purpose | Status |
|---|---|---|
| `Landing.tsx` | Public landing page | Present |
| `Auth.tsx` | Login/signup | Working with Supabase |
| `Dashboard.tsx` | App overview | Present |
| `Upload.tsx` | Upload and AI metadata form | Main completed feature |
| `Closet.tsx` | Saved clothing grid/details | Working/basic |
| `OutfitBuilder.tsx` | Manual outfit creation | Partial |
| `SavedOutfits.tsx` | Saved outfit list | Partial |
| `Recommendations.tsx` | AI recommendation UI | Roadmap/backend logic not complete |
| `Settings.tsx` | Profile/settings UI | Partial |
| `Install.tsx` | PWA install help | Present |
| `About.tsx` | App explanation | Present |

## Roadmap

- [x] Supabase auth integration
- [x] Protected route structure
- [x] Upload page
- [x] Send image from frontend to backend
- [x] Display Gemini-generated item metadata
- [x] Let user edit AI metadata before saving
- [x] Save clothing item through backend
- [ ] Improve upload form error states
- [ ] Add client-side file size/type validation before backend call
- [ ] Add a "re-analyze image" button
- [ ] Show AI confidence in a useful way
- [ ] Improve closet item editing UI
- [ ] Finish outfit builder UX
- [ ] Replace placeholder recommendation logic with real AI recommendations
- [ ] Persist all settings/profile fields
- [ ] Add dark mode polish
- [ ] Add tests for upload and auth flows

