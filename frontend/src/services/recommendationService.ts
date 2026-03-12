import { apiClient } from "./apiClient";
import type { Recommendation } from "@/types";

// =============================================================================
// recommendationService.ts — asks the backend to suggest outfit pairings
// =============================================================================
// This is the AI/styling feature. The user picks one clothing item (the "anchor")
// and optionally provides context like occasion or season. The backend (or an
// AI model it calls) then suggests other items from their wardrobe that would
// pair well with it, returning a list of Recommendation objects.
// =============================================================================

// The data we send to the server to generate recommendations.
// anchor_item_id — the clothing item the user wants suggestions around.
// occasion, season, style — optional hints to make suggestions more relevant
//   (e.g. "I need ideas for a formal summer event").
export interface RecommendationRequest {
  anchor_item_id: string;
  occasion?: string;
  season?: string;
  style?: string;
}

export const recommendationService = {
  // Sends the anchor item + context to the backend and gets back a list
  // of recommended outfit combinations. The backend handles all the AI logic;
  // from the frontend's perspective this is just a regular POST request.
  generate: (data: RecommendationRequest) =>
    apiClient.post<Recommendation[]>("/recommendations/generate", data),
};
