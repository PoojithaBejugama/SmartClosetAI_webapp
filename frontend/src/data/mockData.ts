import type { ClothingItem, Outfit, Recommendation } from "@/types";

// Higher quality, category-specific Unsplash images
const clothingImages: Record<string, string> = {
  "top-1": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=480&h=600&fit=crop&q=80",
  "top-2": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=480&h=600&fit=crop&q=80",
  "bottom-1": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=480&h=600&fit=crop&q=80",
  "bottom-2": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=480&h=600&fit=crop&q=80",
  "dress-1": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=480&h=600&fit=crop&q=80",
  "dress-2": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=480&h=600&fit=crop&q=80",
  "outerwear-1": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=480&h=600&fit=crop&q=80",
  "outerwear-2": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=480&h=600&fit=crop&q=80",
  "shoes-1": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=480&h=600&fit=crop&q=80",
  "shoes-2": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=480&h=600&fit=crop&q=80",
  "accessories-1": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=480&h=600&fit=crop&q=80",
  "accessories-2": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=480&h=600&fit=crop&q=80",
};

const itemDefs = [
  { category: "Top", color: "White", season: "Spring", occasion: "Casual", img: "top-1" },
  { category: "Bottom", color: "Navy", season: "All Season", occasion: "Business", img: "bottom-1" },
  { category: "Dress", color: "Black", season: "Summer", occasion: "Date Night", img: "dress-1" },
  { category: "Outerwear", color: "Beige", season: "Fall", occasion: "Casual", img: "outerwear-1" },
  { category: "Shoes", color: "Black", season: "All Season", occasion: "Formal", img: "shoes-1" },
  { category: "Accessories", color: "Gold", season: "All Season", occasion: "Party", img: "accessories-1" },
  { category: "Top", color: "Blue", season: "Summer", occasion: "Casual", img: "top-2" },
  { category: "Outerwear", color: "Black", season: "Winter", occasion: "Business", img: "outerwear-2" },
  { category: "Dress", color: "Red", season: "Fall", occasion: "Party", img: "dress-2" },
  { category: "Bottom", color: "Beige", season: "Spring", occasion: "Casual", img: "bottom-2" },
  { category: "Shoes", color: "White", season: "Summer", occasion: "Sport", img: "shoes-2" },
  { category: "Accessories", color: "Silver", season: "Winter", occasion: "Formal", img: "accessories-2" },
];

export const mockClothingItems: ClothingItem[] = itemDefs.map((def, i) => ({
  id: `item-${i + 1}`,
  image_url: clothingImages[def.img],
  name: `${def.color} ${def.category}`,
  category: def.category,
  color: def.color,
  season: def.season,
  occasion: def.occasion,
  description: `${def.color} ${def.category.toLowerCase()} suitable for ${def.occasion.toLowerCase()} outfits.`,
  material_guess: "",
  recommendation_notes: "",
  style_tags: [def.occasion.toLowerCase().replace(" ", "-"), def.season.toLowerCase().replace(" ", "-")],
  notes: "",
  ai_confidence: undefined,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  favorite: i % 3 === 0,
}));

export const mockOutfits: Outfit[] = [
  {
    id: "outfit-1",
    name: "Casual Friday",
    items: [mockClothingItems[0], mockClothingItems[1], mockClothingItems[4]],
    created_at: new Date().toISOString(),
    occasion: "Casual",
  },
  {
    id: "outfit-2",
    name: "Business Meeting",
    items: [mockClothingItems[6], mockClothingItems[7], mockClothingItems[4]],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    occasion: "Business",
  },
  {
    id: "outfit-3",
    name: "Weekend Brunch",
    items: [mockClothingItems[2], mockClothingItems[5], mockClothingItems[10]],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    occasion: "Casual",
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    outfit_name: "Effortless Chic",
    items: [mockClothingItems[0], mockClothingItems[1], mockClothingItems[4]],
    explanation: "A balanced combination of casual and polished pieces perfect for a relaxed yet put-together look.",
    tags: ["Casual", "Spring", "Day Out"],
  },
  {
    outfit_name: "Power Ensemble",
    items: [mockClothingItems[6], mockClothingItems[7], mockClothingItems[4]],
    explanation: "Sharp and professional — ideal for making a strong impression at work or networking events.",
    tags: ["Business", "All Season", "Professional"],
  },
  {
    outfit_name: "Evening Elegance",
    items: [mockClothingItems[2], mockClothingItems[5], mockClothingItems[10]],
    explanation: "A sophisticated pairing that transitions beautifully from dinner to evening events.",
    tags: ["Date Night", "Fall", "Evening"],
  },
];
