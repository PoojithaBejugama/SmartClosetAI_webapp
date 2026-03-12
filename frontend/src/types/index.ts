export interface ClothingItem {
  id: string;
  image_url: string;
  category: string;
  color: string;
  season: string;
  occasion: string;
  notes: string;
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
