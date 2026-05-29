import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clothingService, type ClothingFilters, type CreateClothingRequest } from "@/services/clothingService";
import { mockClothingItems } from "@/data/mockData";
import type { ClothingItem } from "@/types";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const clothingKeys = {
  all: ["clothing"] as const,
  lists: () => [...clothingKeys.all, "list"] as const,
  list: (filters?: ClothingFilters) => [...clothingKeys.lists(), filters] as const,
  details: () => [...clothingKeys.all, "detail"] as const,
  detail: (id: string) => [...clothingKeys.details(), id] as const,
};

export function useClothingItems(filters?: ClothingFilters) {
  return useQuery({
    queryKey: clothingKeys.list(filters),
    queryFn: async () => {
      if (isDemoMode) {
        let items = [...mockClothingItems];
        if (filters?.category && filters.category !== "all")
          items = items.filter((i) => i.category === filters.category);
        if (filters?.color && filters.color !== "all")
          items = items.filter((i) => i.color === filters.color);
        if (filters?.season && filters.season !== "all")
          items = items.filter((i) => i.season === filters.season);
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          items = items.filter((i) => `${i.category} ${i.color} ${i.season}`.toLowerCase().includes(q));
        }
        return { data: items, total: items.length, page: 1, limit: 50 };
      }
      return clothingService.getAll(filters);
    },
  });
}

export function useClothingItem(id: string) {
  return useQuery({
    queryKey: clothingKeys.detail(id),
    queryFn: () => {
      if (isDemoMode) {
        const item = mockClothingItems.find((i) => i.id === id);
        if (!item) throw new Error("Item not found");
        return item;
      }
      return clothingService.getById(id);
    },
    enabled: !!id,
  });
}

export function useUploadClothing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: CreateClothingRequest }) => {
      if (isDemoMode) {
        return Promise.resolve({
          id: `item-${Date.now()}`,
          image_url: URL.createObjectURL(file),
          ...metadata,
          name: metadata.name || metadata.category,
          description: metadata.description || "",
          material_guess: metadata.material_guess || "",
          recommendation_notes: metadata.recommendation_notes || "",
          style_tags: metadata.style_tags || [],
          notes: metadata.notes || "",
          ai_confidence: metadata.ai_confidence,
          created_at: new Date().toISOString(),
          favorite: false,
        } as ClothingItem);
      }
      return clothingService.upload(file, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clothingKeys.all });
    },
  });
}

export function useDeleteClothing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) return Promise.resolve();
      return clothingService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clothingKeys.all });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) {
        const item = mockClothingItems.find((i) => i.id === id);
        if (item) item.favorite = !item.favorite;
        return Promise.resolve(item as ClothingItem);
      }
      return clothingService.toggleFavorite(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clothingKeys.all });
    },
  });
}
