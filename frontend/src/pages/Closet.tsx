import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/layouts/AppLayout";
import { ClothingCard } from "@/components/ClothingCard";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";
import { mockClothingItems } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ClothingItem } from "@/types";
import { motion } from "framer-motion";

export default function ClosetPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const items = mockClothingItems.filter((item) => {
    const matchSearch = `${item.category} ${item.color} ${item.season}`.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filters.category || filters.category === "all" || item.category === filters.category;
    const matchColor = !filters.color || filters.color === "all" || item.color === filters.color;
    const matchSeason = !filters.season || filters.season === "all" || item.season === filters.season;
    return matchSearch && matchCategory && matchColor && matchSeason;
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">My Closet</h1>
            <p className="text-muted-foreground mt-2 text-[15px]">{items.length} items in your wardrobe</p>
          </div>
          <Button variant="hero" onClick={() => navigate("/upload")} className="h-11">
            <Plus className="h-4 w-4 mr-1.5" /> Upload Item
          </Button>
        </div>

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            { label: "Category", value: "category", options: ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessories"] },
            { label: "Color", value: "color", options: ["Black", "White", "Navy", "Beige", "Red", "Blue", "Green", "Pink"] },
            { label: "Season", value: "season", options: ["Spring", "Summer", "Fall", "Winter", "All Season"] },
          ]}
          onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        />

        {items.length === 0 ? (
          <EmptyState
            title="Your closet is empty"
            description="Upload your first clothing item to start building your digital wardrobe."
            actionLabel="Upload Your First Item"
            onAction={() => navigate("/upload")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <ClothingCard
                  item={item}
                  onView={(i) => setSelectedItem(i)}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onAddToOutfit={() => navigate("/outfit-builder")}
                />
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">
            {selectedItem && (
              <div className="grid sm:grid-cols-2">
                <div className="aspect-[3/4] sm:aspect-auto bg-muted">
                  <img src={selectedItem.image_url} alt={selectedItem.category} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl tracking-tight">{selectedItem.category}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-6">
                      <Detail label="Color" value={selectedItem.color} />
                      <Detail label="Season" value={selectedItem.season} />
                      <Detail label="Occasion" value={selectedItem.occasion} />
                      <Detail label="Uploaded" value={new Date(selectedItem.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
                      {selectedItem.notes && <Detail label="Notes" value={selectedItem.notes} />}
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-8">
                    <Button variant="hero" size="sm" onClick={() => navigate("/outfit-builder")}>Add to Outfit</Button>
                    <Button variant="outline" size="sm" className="rounded-xl">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">{label}</span>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}
