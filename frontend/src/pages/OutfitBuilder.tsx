import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/layouts/AppLayout";
import { ClothingCard } from "@/components/ClothingCard";
import { FilterBar } from "@/components/FilterBar";
import { mockClothingItems } from "@/data/mockData";
import type { ClothingItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Shirt } from "lucide-react";
import { motion } from "framer-motion";

const slots = ["Top", "Bottom", "Outerwear", "Shoes", "Accessories"] as const;

export default function OutfitBuilderPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [outfitName, setOutfitName] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, ClothingItem>>({});
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredItems = mockClothingItems.filter((item) => {
    const matchSearch = `${item.category} ${item.color}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  const addItem = (item: ClothingItem) => {
    const slot = item.category === "Top" || item.category === "Dress" ? "Top" : item.category === "Bottom" ? "Bottom" : item.category;
    setSelectedItems((prev) => ({ ...prev, [slot]: item }));
  };

  const removeItem = (slot: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const filledCount = Object.keys(selectedItems).length;

  const handleSave = () => {
    toast({ title: "Outfit saved!", description: `"${outfitName || "Untitled Outfit"}" has been saved.` });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Outfit Builder</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Select pieces from your closet to create a saved outfit</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                { label: "Category", value: "category", options: ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessories"] },
              ]}
              onFilterChange={(_, val) => setFilterCategory(val)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <ClothingCard
                    item={item}
                    selectable
                    selected={Object.values(selectedItems).some((s) => s.id === item.id)}
                    onSelect={addItem}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-card shadow-card p-7 sticky top-24 space-y-6">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Outfit Name</label>
                <Input
                  placeholder="e.g. Casual Friday..."
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="mt-2 font-heading text-lg border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 h-12"
                />
              </div>

              <div className="space-y-3">
                {slots.map((slot) => {
                  const item = selectedItems[slot];
                  return (
                    <motion.div key={slot} layout transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                      {item ? (
                        <div className="flex items-center gap-3 rounded-xl bg-secondary/70 p-2.5 group">
                          <img src={item.image_url} alt={item.category} className="w-12 h-14 rounded-lg object-cover shadow-xs" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.category}</p>
                            <p className="text-[11px] text-muted-foreground">{item.color} · {item.season}</p>
                          </div>
                          <button
                            onClick={() => removeItem(slot)}
                            className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border/70 p-4 text-center hover:border-primary/30 transition-colors">
                          <Shirt className="h-4 w-4 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground/60">{slot}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {filledCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {filledCount} of {slots.length} slots filled
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="hero" className="flex-1 h-11" onClick={handleSave} disabled={filledCount === 0}>
                  <Save className="h-4 w-4 mr-2" /> Save Outfit
                </Button>
                <Button variant="outline" onClick={() => setSelectedItems({})} className="rounded-xl">Clear</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
