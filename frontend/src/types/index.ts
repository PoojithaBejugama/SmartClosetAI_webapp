export interface ClothingItem {
  id: string;
  image_url: string;
  name: string;
  category: string;
  color: string;
  season: string;
  occasion: string;
  description: string;
  material_guess: string;
  recommendation_notes: string;
  style_tags: string[];
  notes: string;
  ai_confidence?: number;
  created_at: string;
  favorite?: boolean;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  created_at: string;
  occasion?: string;
}

export interface Recommendation {
  outfit_name: string;
  items: ClothingItem[];
  explanation: string;
  tags: string[];
}
