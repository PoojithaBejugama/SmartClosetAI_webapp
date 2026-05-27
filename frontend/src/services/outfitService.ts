import { apiClient } from "./apiClient";
import { clothingService } from "./clothingService";
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

interface BackendOutfitItem {
  id: number;
  outfit_id: number;
  clothing_id: number;
  slot?: string | null;
  created_at: string;
}

interface BackendOutfit {
  id: number;
  user_id: number;
  name: string;
  source: string;
  occasion?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items: BackendOutfitItem[];
}

const toBackendItems = (items: string[]) =>
  items.map((id) => ({ clothing_id: Number(id), slot: null }));

const toOutfit = async (outfit: BackendOutfit): Promise<Outfit> => {
  const clothes = await clothingService.getAll();
  const clothingById = new Map(clothes.data.map((item) => [item.id, item]));

  return {
    id: String(outfit.id),
    name: outfit.name,
    created_at: outfit.created_at,
    occasion: outfit.occasion || undefined,
    items: outfit.items
      .map((item) => clothingById.get(String(item.clothing_id)))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  };
};

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

    return apiClient.get<BackendOutfit[]>("/outfits").then(async (outfits) => {
      let data = await Promise.all(outfits.map(toOutfit));

      if (filters?.search) {
        data = data.filter((outfit) =>
          outfit.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      if (filters?.occasion && filters.occasion !== "all") {
        data = data.filter((outfit) => outfit.occasion === filters.occasion);
      }

      return data;
    });
  },

  // Fetches one specific outfit by its ID.
  // Used when opening an outfit detail or edit screen.
  getById: (id: string) =>
    apiClient.get<BackendOutfit>(`/outfits/${id}`).then(toOutfit),

  // Saves a brand new outfit to the server.
  // The user picks a name, selects clothing items, and optionally sets an occasion.
  create: (data: CreateOutfitRequest) =>
    apiClient.post<BackendOutfit>("/outfits", {
      name: data.name,
      source: "manual",
      occasion: data.occasion,
      notes: "",
      items: toBackendItems(data.items),
    }).then(toOutfit),

  // Updates an existing outfit — only the fields you pass get changed.
  update: (id: string, data: UpdateOutfitRequest) =>
    apiClient.put<BackendOutfit>(`/outfits/${id}`, {
      ...data,
      items: data.items ? toBackendItems(data.items) : undefined,
    }).then(toOutfit),

  // Permanently deletes a saved outfit.
  delete: (id: string) =>
    apiClient.delete<void>(`/outfits/${id}`),
};
