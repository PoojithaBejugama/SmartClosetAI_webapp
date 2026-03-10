# Project Structure

This document explains the folder organization of the SmartClosetAI frontend codebase.

## Overview

```
src/
├── assets/          Static assets (images, illustrations)
├── components/      Reusable UI components
│   └── ui/          shadcn/ui primitives (auto-generated, do not edit)
├── contexts/        React context providers
├── data/            Mock data for development and demo mode
├── hooks/           Custom React hooks (auth, data fetching, utilities)
├── layouts/         Page layout shells (navbar, sidebar, bottom nav, page wrapper)
├── lib/             Compatibility re-exports for shadcn/ui
├── pages/           Route-level page components
├── services/        API service layer (HTTP clients, endpoint definitions)
├── types/           Shared TypeScript interfaces and type definitions
├── utils/           Helper functions, validation schemas, utilities
├── App.tsx          Root component with routing and providers
├── main.tsx         Application entry point
└── index.css        Global styles and design system tokens
```

## Folder Details

### `components/`
Reusable, composable UI components used across multiple pages. Each component is self-contained with its own props interface. Examples: `ClothingCard`, `OutfitCard`, `FilterBar`, `EmptyState`, `UploadDropzone`, `StatCard`, `BottomNav`, `NavLink`.

The `ui/` subdirectory contains shadcn/ui primitives (Button, Input, Dialog, etc.) which are auto-generated and should only be modified through the shadcn CLI or design system updates.

**Why separate from pages?** Components are shared building blocks. Pages are route-specific compositions of these components.

### `pages/`
One file per route. Each page is the top-level component rendered by React Router. Pages compose layouts, components, and hooks together. They are default-exported for clean lazy-loading support.

Current pages: `Landing`, `Auth`, `Dashboard`, `Closet`, `Upload`, `OutfitBuilder`, `Recommendations`, `SavedOutfits`, `Settings`, `About`, `Install`, `NotFound`.

### `layouts/`
Structural components that define the page shell — navigation bar, sidebar, bottom navigation, and the overall authenticated page wrapper (`AppLayout`). These are distinct from regular components because they define the application's frame rather than content.

- `AppLayout.tsx` — Main authenticated shell wrapping sidebar, navbar, content area, and mobile bottom nav
- `AppNavbar.tsx` — Top navigation bar with search, quick links, and user menu
- `AppSidebar.tsx` — Desktop sidebar with full navigation links

**Why not in components?** Layouts wrap entire pages and manage navigation state. Keeping them separate makes it clear which components are structural vs. content-oriented.

### `hooks/`
Custom React hooks for data fetching, authentication, and UI utilities:
- `useAuth.ts` — Authentication state and context hook
- `useClothing.ts` — React Query hooks for clothing CRUD operations
- `useOutfits.ts` — React Query hooks for outfit CRUD operations
- `useRecommendations.ts` — React Query hook for AI recommendations
- `use-mobile.tsx` — Responsive breakpoint detection
- `use-toast.ts` — Toast notification hook (shadcn/ui)

### `services/`
API service layer containing typed HTTP client and endpoint definitions. Each service maps to a backend resource:
- `apiClient.ts` — Base HTTP client with token auth, error handling, 401 redirect
- `authService.ts` — Login, signup, profile management endpoints
- `clothingService.ts` — Clothing item CRUD endpoints
- `outfitService.ts` — Outfit CRUD endpoints
- `recommendationService.ts` — AI recommendation generation endpoint

**Why separate from hooks?** Services are pure API abstractions with no React dependency. Hooks consume services and add React Query caching, demo mode fallbacks, and cache invalidation.

### `types/`
Shared TypeScript interfaces used across the entire application:
- `ClothingItem` — A single wardrobe piece
- `Outfit` — A named collection of clothing items
- `Recommendation` — An AI-generated outfit suggestion

**Why centralized?** Types are imported by services, hooks, components, and pages. A single source of truth prevents circular imports and duplication.

### `utils/`
Pure utility functions and validation schemas:
- `cn.ts` — Tailwind CSS class merging utility (`clsx` + `tailwind-merge`)
- `validations.ts` — Zod schemas for all forms (login, signup, upload, profile, password)

### `data/`
Mock data used for development and demo mode. When no `VITE_API_BASE_URL` is configured, hooks return this data instead of making real API calls.

### `contexts/`
React context providers. Currently contains `AuthProvider` which wraps the app and provides authentication state to all components via the `useAuth` hook.

### `lib/`
Compatibility layer. Contains a re-export of `cn()` from `utils/cn.ts` so that all shadcn/ui components (which import from `@/lib/utils`) continue to work without modification.

### `assets/`
Static files imported directly into components (hero illustrations, icons, etc.).

## Import Conventions

All imports use the `@/` path alias which maps to `src/`:

```typescript
import type { ClothingItem } from "@/types";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { ClothingCard } from "@/components/ClothingCard";
import { BottomNav } from "@/components/BottomNav";
import { clothingService } from "@/services/clothingService";
import { mockClothingItems } from "@/data/mockData";
```

## Adding New Features

1. **New page** → Create in `pages/`, add route in `App.tsx`, add to `AppSidebar.tsx` if needed
2. **New reusable component** → Create in `components/`
3. **New API endpoint** → Add to relevant service in `services/`, create hook in `hooks/`
4. **New shared type** → Add to `types/index.ts`
5. **New form** → Add Zod schema to `utils/validations.ts`
6. **New shadcn/ui component** → Auto-generated in `components/ui/`
