import { apiClient } from "./apiClient";
import type { Outfit } from "@/types";

export interface CreateOutfitRequest {
  name: string;
  items: string[]; // clothing item IDs
  occasion?: string;
}

export interface UpdateOutfitRequest {
  name?: string;
  items?: string[];
  occasion?: string;
}

export const outfitService = {
  getAll: (filters?: { search?: string; occasion?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== "all") params.append(key, val);
      });
    }
    const qs = params.toString();
    return apiClient.get<Outfit[]>(`/outfits${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) =>
    apiClient.get<Outfit>(`/outfits/${id}`),

  create: (data: CreateOutfitRequest) =>
    apiClient.post<Outfit>("/outfits", data),

  update: (id: string, data: UpdateOutfitRequest) =>
    apiClient.patch<Outfit>(`/outfits/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/outfits/${id}`),
};
