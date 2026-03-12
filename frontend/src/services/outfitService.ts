import { apiClient } from "./apiClient";
import type { Outfit } from "@/types";

// =============================================================================
// outfitService.ts — manages saved outfits (combinations of clothing items)
// =============================================================================
// An "outfit" is a named collection of clothing item IDs the user has grouped
// together (e.g. a summer look, a work outfit). This service handles
// listing, creating, editing, and deleting those outfit records.
// =============================================================================

// What you need to provide when creating a new outfit.
// "items" is an array of clothing item ID strings — the server looks them up.
export interface CreateOutfitRequest {
  name: string;
  items: string[]; // IDs of the clothing items that make up this outfit
  occasion?: string;
}

// Same as CreateOutfitRequest but every field is optional,
// because when updating you only send the fields you want to change.
export interface UpdateOutfitRequest {
  name?: string;
  items?: string[];
  occasion?: string;
}

export const outfitService = {
  // Loads all of the user's saved outfits.
  // You can optionally search by name, filter by occasion, or change the sort order.
  getAll: (filters?: { search?: string; occasion?: string; sort?: string }) => {
    const params = new URLSearchParams();

    // Only add filters that actually have a value (skip empty and "all").
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "all") params.append(key, val);
      });
    }

    const qs = params.toString();
    return apiClient.get<Outfit[]>(`/outfits${qs ? `?${qs}` : ""}`);
  },

  // Fetches one specific outfit by its ID.
  // Used when opening an outfit detail or edit screen.
  getById: (id: string) =>
    apiClient.get<Outfit>(`/outfits/${id}`),

  // Saves a brand new outfit to the server.
  // The user picks a name, selects clothing items, and optionally sets an occasion.
  create: (data: CreateOutfitRequest) =>
    apiClient.post<Outfit>("/outfits", data),

  // Updates an existing outfit — only the fields you pass get changed.
  update: (id: string, data: UpdateOutfitRequest) =>
    apiClient.patch<Outfit>(`/outfits/${id}`, data),

  // Permanently deletes a saved outfit.
  delete: (id: string) =>
    apiClient.delete<void>(`/outfits/${id}`),
};
