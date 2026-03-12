# SmartClosetAI

AI-powered digital wardrobe management app. Upload clothing items, organize them in a virtual closet, create outfits, and receive intelligent outfit recommendations.

## What It Does

SmartClosetAI helps users digitize and manage their wardrobe. Upload photos of clothing, categorize them automatically with AI-detected metadata, build outfit combinations, and get personalized style suggestions — all from a clean, mobile-friendly interface.

## Features

- **Digital Closet** — Browse, filter, search, and organize clothing items in a visual card grid
- **Smart Upload** — Drag-and-drop image upload with simulated AI metadata detection (category, color, season, occasion)
- **Outfit Builder** — Compose outfits by selecting pieces from your closet into designated slots (top, bottom, outerwear, shoes, accessories)
- **AI Recommendations** — Select an anchor item and generate outfit suggestions with explanations and tags
- **Saved Outfits** — View, search, and manage all created/saved outfits
- **Authentication** — Login/signup flow with token-based auth, protected routes, and demo mode
- **Dashboard** — Overview stats, quick actions, recent uploads, and daily outfit suggestion
- **Profile & Settings** — Account management, style preferences, password change
- **About Page** — App overview, feature descriptions, upload/AI explanation, privacy note, and FAQ
- **Responsive Design** — Fully functional on desktop, tablet, and mobile with bottom navigation bar
- **PWA Support** — Installable as a native-like app on iOS and Android with offline caching

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| State / Data | TanStack React Query |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── BottomNav.tsx    # Mobile bottom navigation bar
│   ├── ClothingCard.tsx # Wardrobe item card
│   ├── OutfitCard.tsx   # Outfit preview card
│   ├── StatCard.tsx     # Dashboard metric card
│   ├── FilterBar.tsx    # Search + filter toolbar
│   ├── UploadDropzone.tsx # Drag-and-drop file upload
│   ├── EmptyState.tsx   # Empty content placeholder
│   ├── NavLink.tsx      # Active-aware navigation link
│   └── ProtectedRoute.tsx # Auth route guard
├── contexts/
│   └── AuthContext.tsx   # Authentication state provider
├── data/
│   └── mockData.ts      # Mock clothing items, outfits, recommendations
├── hooks/
│   ├── useAuth.ts       # Auth context hook
│   ├── useClothing.ts   # React Query hooks for clothing CRUD
│   ├── useOutfits.ts    # React Query hooks for outfit CRUD
│   ├── useRecommendations.ts # React Query hook for AI generation
│   ├── use-mobile.tsx   # Responsive breakpoint detection
│   └── use-toast.ts     # Toast notification hook
├── layouts/
│   ├── AppLayout.tsx    # Authenticated page shell (sidebar + navbar + bottom nav)
│   ├── AppNavbar.tsx    # Top navigation bar
│   └── AppSidebar.tsx   # Desktop sidebar navigation
├── lib/
│   └── utils.ts         # Compatibility re-export of cn helper
├── pages/
│   ├── Landing.tsx      # Public marketing page
│   ├── Auth.tsx         # Login / signup
│   ├── Dashboard.tsx    # Authenticated home
│   ├── Closet.tsx       # Wardrobe grid
│   ├── Upload.tsx       # Add clothing item
│   ├── OutfitBuilder.tsx # Create outfit
│   ├── Recommendations.tsx # AI suggestions
│   ├── SavedOutfits.tsx # Outfit collection
│   ├── Settings.tsx     # Account & preferences
│   ├── About.tsx        # App info, features, FAQ
│   ├── Install.tsx      # PWA install instructions
│   └── NotFound.tsx     # 404
├── services/
│   ├── apiClient.ts     # HTTP client with token auth
│   ├── authService.ts   # Auth API endpoints
│   ├── clothingService.ts # Clothing API endpoints
│   ├── outfitService.ts # Outfit API endpoints
│   └── recommendationService.ts # AI recommendation endpoints
├── types/
│   └── index.ts         # Shared TypeScript interfaces
├── utils/
│   ├── cn.ts            # Tailwind class merging utility
│   └── validations.ts   # Zod schemas for all forms
├── App.tsx              # Router + providers
├── main.tsx             # Entry point
└── index.css            # Global styles and design system tokens
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or Bun)

### Install

```bash
git clone <YOUR_GIT_URL>
cd smartcloset
npm install
```

### Run Locally

```bash
npm run dev
```

The app starts at `http://localhost:8080`. Without a backend configured, it runs in **demo mode** using mock data — any credentials work on the login screen.

### Build for Production

```bash
npm run build
```

Output is in `dist/` — static files ready for any hosting provider.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | REST API base URL (e.g. `https://api.example.com/v1`). When unset, the app uses mock data and demo auth. |

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## API Integration

The frontend is designed to connect to a **FastAPI** (or any REST) backend. All API calls go through `src/services/apiClient.ts`, which:

- Prepends `VITE_API_BASE_URL` to all requests
- Attaches `Authorization: Bearer <token>` from localStorage
- Handles 401 responses by clearing auth and redirecting to `/auth`
- Supports JSON and multipart/form-data (file uploads)

### Expected API Endpoints

| Method | Endpoint | Service |
|---|---|---|
| POST | `/auth/login` | `authService` |
| POST | `/auth/signup` | `authService` |
| POST | `/auth/logout` | `authService` |
| GET | `/auth/profile` | `authService` |
| PATCH | `/auth/profile` | `authService` |
| POST | `/auth/change-password` | `authService` |
| GET | `/clothing` | `clothingService` |
| GET | `/clothing/:id` | `clothingService` |
| POST | `/clothing` (multipart) | `clothingService` |
| PATCH | `/clothing/:id` | `clothingService` |
| DELETE | `/clothing/:id` | `clothingService` |
| POST | `/clothing/:id/favorite` | `clothingService` |
| GET | `/outfits` | `outfitService` |
| POST | `/outfits` | `outfitService` |
| PATCH | `/outfits/:id` | `outfitService` |
| DELETE | `/outfits/:id` | `outfitService` |
| POST | `/recommendations/generate` | `recommendationService` |

### Auth Flow

1. User submits credentials → backend returns `{ token, user }`
2. Token is stored in `localStorage` and sent as `Bearer` header
3. `ProtectedRoute` component redirects unauthenticated users to `/auth`

## Mock Data

Mock data lives in `src/data/mockData.ts` and is used when `VITE_API_BASE_URL` is not set. The following are mocked:

- **Clothing items** — 12 sample items with Unsplash images
- **Outfits** — 3 pre-built outfit combinations
- **Recommendations** — 3 AI-style suggestion cards
- **Auth** — Any email/password combination is accepted

### Replacing Mock Data with Real API

Each React Query hook in `src/hooks/` contains an `isDemoMode` check:

```typescript
const isDemoMode = !import.meta.env.VITE_API_BASE_URL;
```

When `VITE_API_BASE_URL` is set, the hooks call the real service layer instead of returning mock data. No other code changes are needed — just set the environment variable and ensure your backend implements the expected endpoints.

## Mobile Experience

- **Bottom Navigation Bar** — Fixed bottom nav on mobile with quick access to Closet, Upload, Outfits, and AI pages
- **Responsive Cards** — Stat cards and quick action cards use compact sizing on small screens
- **Collapsible Sidebar** — Desktop sidebar collapses to an overlay sheet on mobile
- **PWA Install** — Visit `/install` for platform-specific instructions to add the app to your home screen
- **Safe Area Support** — Proper padding for devices with notches/home indicators

## Deployment

The build output (`dist/`) is a static SPA. Deploy to any static host:

- **Lovable** — Click Share → Publish
- **Vercel** — Connect repo, framework preset: Vite
- **Netlify** — Build command: `npm run build`, publish directory: `dist`
- **AWS S3 + CloudFront** — Upload `dist/` to S3 bucket with SPA redirect rules

For SPA routing, configure your host to serve `index.html` for all paths (React Router handles client-side routing).

## Future Improvements

- Connect to a real FastAPI backend with PostgreSQL
- Real AI-powered clothing detection via image classification API
- Drag-and-drop outfit builder with visual preview
- Social sharing of outfit combinations
- Seasonal wardrobe analytics and usage tracking
- Dark mode toggle
- Image optimization and CDN integration
