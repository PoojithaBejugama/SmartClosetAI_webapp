import { apiClient } from "./apiClient";
import type { ClothingItem } from "@/types";

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
  getAll: (filters?: ClothingFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "all") params.append(key, val);
      });
    }
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<ClothingItem>>(`/clothing${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) =>
    apiClient.get<ClothingItem>(`/clothing/${id}`),

  upload: (file: File, metadata: CreateClothingRequest) => {
    const formData = new FormData();
    formData.append("image", file);
    Object.entries(metadata).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });
    return apiClient.upload<ClothingItem>("/clothing", formData);
  },

  update: (id: string, data: Partial<CreateClothingRequest>) =>
    apiClient.patch<ClothingItem>(`/clothing/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/clothing/${id}`),

  toggleFavorite: (id: string) =>
    apiClient.post<ClothingItem>(`/clothing/${id}/favorite`),
};
