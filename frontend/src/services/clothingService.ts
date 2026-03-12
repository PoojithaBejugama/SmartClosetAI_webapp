import { apiClient } from "./apiClient";
import type { ClothingItem } from "@/types";

// =============================================================================
// clothingService.ts — manages all clothing items in the user's wardrobe
// =============================================================================
// CRUD = Create, Read, Update, Delete — the four basic operations on data.
// This service handles all of them for clothing items, plus extras like
// filtering the wardrobe list and toggling favorites.
//
// The interfaces below define the exact shape of data for each operation.
// =============================================================================

export interface CreateClothingRequest {
  category: string;
  color: string;
  season: string;
  occasion: string;
  notes?: string;
}

export interface ClothingFilters {
  category?: string;
  color?: string;
  season?: string;
  occasion?: string;
  search?: string;
  sort?: "newest" | "oldest" | "category" | "color";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const clothingService = {
  // Loads the user's wardrobe list. You can pass optional filters like
  // { category: "tops", color: "blue", sort: "newest" } to narrow results.
  getAll: (filters?: ClothingFilters) => {
    // URLSearchParams is a handy browser built-in for building query strings.
    // e.g. { category: "tops", color: "blue" } → "category=tops&color=blue"
    const params = new URLSearchParams();

    if (filters) {
      // Loop over each filter key/value pair.
      // We skip empty strings and "all" because those mean "no filter applied".
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "all") params.append(key, val);
      });
    }

    // Build the final URL. If there are filters, it becomes e.g. "/clothing?category=tops".
    // If no filters were passed, it's just "/clothing".
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<ClothingItem>>(`/clothing${qs ? `?${qs}` : ""}`);
  },

  // Fetches one specific clothing item using its unique ID.
  // Useful when the user clicks on an item to see its detail page.
  getById: (id: string) =>
    apiClient.get<ClothingItem>(`/clothing/${id}`),

  // Adds a new clothing item to the wardrobe.
  // Because we're sending an image file (not just text), we use FormData
  // instead of JSON. FormData can bundle both the image and the text fields together.
  upload: (file: File, metadata: CreateClothingRequest) => {
    const formData = new FormData();
    formData.append("image", file); // The actual photo file

    // Add each metadata field (category, color, etc.) to the same FormData bundle.
    // We skip falsy values so we don't send empty strings to the server.
    Object.entries(metadata).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    return apiClient.upload<ClothingItem>("/clothing", formData);
  },

  // Updates specific fields of an existing clothing item.
  // "Partial<CreateClothingRequest>" means you only need to pass the fields
  // you want to change — all others stay the same on the server.
  update: (id: string, data: Partial<CreateClothingRequest>) =>
    apiClient.patch<ClothingItem>(`/clothing/${id}`, data),

  // Removes a clothing item from the wardrobe permanently.
  delete: (id: string) =>
    apiClient.delete<void>(`/clothing/${id}`),

  // Toggles the favorite/heart status of an item.
  // The server flips it (if it was favorited, it becomes unfavorited, and vice versa)
  // and returns the updated item so the UI can re-render immediately.
  toggleFavorite: (id: string) =>
    apiClient.post<ClothingItem>(`/clothing/${id}/favorite`),
};
