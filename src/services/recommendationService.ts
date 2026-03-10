import { apiClient } from "./apiClient";
import type { Recommendation } from "@/types";

export interface RecommendationRequest {
  anchor_item_id: string;
  occasion?: string;
  season?: string;
  style?: string;
}

export const recommendationService = {
  generate: (data: RecommendationRequest) =>
    apiClient.post<Recommendation[]>("/recommendations/generate", data),
};
