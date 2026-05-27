import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { outfitService, type CreateOutfitRequest } from "@/services/outfitService";
import { mockOutfits } from "@/data/mockData";
import type { Outfit } from "@/types";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const outfitKeys = {
  all: ["outfits"] as const,
  lists: () => [...outfitKeys.all, "list"] as const,
  list: (filters?: Record<string, string>) => [...outfitKeys.lists(), filters] as const,
  detail: (id: string) => [...outfitKeys.all, "detail", id] as const,
};

export function useOutfits(filters?: { search?: string; occasion?: string }) {
  return useQuery({
    queryKey: outfitKeys.list(filters),
    queryFn: () => {
      if (isDemoMode) {
        let items = [...mockOutfits];
        if (filters?.search)
          items = items.filter((o) => o.name.toLowerCase().includes(filters.search!.toLowerCase()));
        if (filters?.occasion && filters.occasion !== "all")
          items = items.filter((o) => o.occasion === filters.occasion);
        return items;
      }
      return outfitService.getAll(filters);
    },
  });
}

export function useCreateOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOutfitRequest) => {
      if (isDemoMode) {
        return Promise.resolve({
          id: `outfit-${Date.now()}`,
          name: data.name,
          items: [],
          created_at: new Date().toISOString(),
          occasion: data.occasion,
        } as Outfit);
      }
      return outfitService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outfitKeys.all });
    },
  });
}

export function useDeleteOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) return Promise.resolve();
      return outfitService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outfitKeys.all });
    },
  });
}
