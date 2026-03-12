import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { OutfitCard } from "@/components/OutfitCard";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";
import { mockOutfits } from "@/data/mockData";
import { BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SavedOutfitsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockOutfits.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Saved Outfits</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">{filtered.length} outfits in your collection</p>
        </div>

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            { label: "Occasion", value: "occasion", options: ["Casual", "Formal", "Business", "Party", "Sport", "Date Night"] },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={BookmarkCheck}
            title="You haven't saved any outfits yet"
            description="Build your first outfit from your closet pieces or save one from AI recommendations."
            actionLabel="Build Your First Outfit"
            onAction={() => navigate("/outfit-builder")}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((outfit, i) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <OutfitCard outfit={outfit} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
