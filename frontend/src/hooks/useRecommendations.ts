import { useMutation } from "@tanstack/react-query";
import { recommendationService, type RecommendationRequest } from "@/services/recommendationService";
import { mockRecommendations } from "@/data/mockData";

const isDemoMode = !import.meta.env.VITE_API_BASE_URL;

export function useGenerateRecommendations() {
  return useMutation({
    mutationFn: async (data: RecommendationRequest) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 1500));
        return mockRecommendations;
      }
      return recommendationService.generate(data);
    },
  });
}
