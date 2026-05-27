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
  image_url?: string;
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

interface BackendClothingItem {
  id: number;
  user_id: number;
  image_url: string;
  category: string;
  color?: string | null;
  season?: string | null;
  occasion?: string | null;
  notes?: string | null;
  ai_confidence?: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image file"));
    };
    image.src = objectUrl;
  });

const fileToCompressedDataUrl = async (file: File) => {
  const image = await loadImage(file);
  const maxSize = 900;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process image file");

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.72);
};

const toClothingItem = (item: BackendClothingItem): ClothingItem => ({
  id: String(item.id),
  image_url: item.image_url,
  category: item.category,
  color: item.color || "",
  season: item.season || "",
  occasion: item.occasion || "",
  notes: item.notes || "",
  created_at: item.created_at,
  favorite: item.is_favorite,
});

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

    return apiClient.get<BackendClothingItem[]>("/clothes").then((items) => {
      let data = items.map(toClothingItem);

      if (filters) {
        if (filters.category && filters.category !== "all")
          data = data.filter((item) => item.category === filters.category);
        if (filters.color && filters.color !== "all")
          data = data.filter((item) => item.color === filters.color);
        if (filters.season && filters.season !== "all")
          data = data.filter((item) => item.season === filters.season);
        if (filters.occasion && filters.occasion !== "all")
          data = data.filter((item) => item.occasion === filters.occasion);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter((item) =>
            `${item.category} ${item.color} ${item.season} ${item.occasion}`.toLowerCase().includes(q)
          );
        }
      }

      return { data, total: data.length, page: 1, limit: data.length };
    });
  },

  // Fetches one specific clothing item using its unique ID.
  // Useful when the user clicks on an item to see its detail page.
  getById: (id: string) =>
    apiClient.get<BackendClothingItem[]>("/clothes").then((items) => {
      const item = items.find((candidate) => String(candidate.id) === id);
      if (!item) throw new Error("Item not found");
      return toClothingItem(item);
    }),

  upload: async (file: File, metadata: CreateClothingRequest) => {
    const imageUrl = metadata.image_url || await fileToCompressedDataUrl(file);

    return apiClient.post<BackendClothingItem>("/clothes", {
      image_url: imageUrl,
      category: metadata.category,
      color: metadata.color,
      season: metadata.season,
      occasion: metadata.occasion,
      notes: metadata.notes || "",
      is_favorite: false,
    }).then(toClothingItem);
  },

  // Updates specific fields of an existing clothing item.
  // "Partial<CreateClothingRequest>" means you only need to pass the fields
  // you want to change — all others stay the same on the server.
  update: (id: string, data: Partial<CreateClothingRequest>) =>
    apiClient.put<BackendClothingItem>(`/clothes/${id}`, data).then(toClothingItem),

  // Removes a clothing item from the wardrobe permanently.
  delete: (id: string) =>
    apiClient.delete<void>(`/clothes/${id}`),

  // Toggles the favorite/heart status of an item.
  // The server flips it (if it was favorited, it becomes unfavorited, and vice versa)
  // and returns the updated item so the UI can re-render immediately.
  toggleFavorite: (id: string) =>
    clothingService.getById(id).then((item) =>
      apiClient.put<BackendClothingItem>(`/clothes/${id}`, {
        is_favorite: !item.favorite,
      }).then(toClothingItem)
    ),
};
