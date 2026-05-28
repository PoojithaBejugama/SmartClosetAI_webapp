import { useNavigate } from "react-router-dom";
import { Shirt, ArrowUp, ArrowDown, BookmarkCheck, Upload, Wand2, Sparkles, Grid3X3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ClothingCard } from "@/components/ClothingCard";
import { AppLayout } from "@/layouts/AppLayout";
import { mockClothingItems, mockOutfits } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useClothingItems } from "@/hooks/useClothing";
import { useOutfits } from "@/hooks/useOutfits";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: clothingData } = useClothingItems();
  const { data: outfitsData } = useOutfits();

  const items = clothingData?.data || [];
  const outfits = outfitsData || mockOutfits;
  const topCount = items.filter((i) => i.category === "Top").length;
  const bottomCount = items.filter((i) => i.category === "Bottom").length;

  const quickActions = [
    { icon: Upload, label: "Upload Item", desc: "Add new pieces", onClick: () => navigate("/upload") },
    { icon: Wand2, label: "Build Outfit", desc: "Create a look", onClick: () => navigate("/outfit-builder") },
    { icon: Sparkles, label: "AI Suggestions", desc: "Get styled", onClick: () => navigate("/recommendations") },
    { icon: Grid3X3, label: "View Closet", desc: "Browse all", onClick: () => navigate("/closet") },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Good evening, {user?.name || "there"}
          </h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Here's your wardrobe at a glance</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Total Items" value={items.length} icon={Shirt} gradient trend="+2 this week" />
          <StatCard title="Tops" value={topCount} icon={ArrowUp} />
          <StatCard title="Bottoms" value={bottomCount} icon={ArrowDown} />
          <StatCard title="Saved Outfits" value={outfits.length} icon={BookmarkCheck} />
        </div>

        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-5 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex flex-row md:flex-col items-center md:items-start gap-2.5 md:gap-3 rounded-2xl bg-card p-3 md:p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 text-left group"
              >
                <div className="p-2 md:p-3 rounded-xl gradient-subtle group-hover:gradient-primary transition-all duration-300 shrink-0">
                  <a.icon className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <span className="font-medium text-xs md:text-sm text-card-foreground block">{a.label}</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground hidden md:inline">{a.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-xl font-semibold text-foreground tracking-tight">Recent Uploads</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/closet")} className="text-primary text-xs gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-card">
              <p className="font-medium text-foreground">No uploads yet</p>
              <p className="text-sm text-muted-foreground mt-1.5">Add your first clothing item to see it here.</p>
              <Button variant="hero" size="sm" className="mt-5" onClick={() => navigate("/upload")}>
                Upload Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {items.slice(0, 6).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <ClothingCard item={item} onView={() => navigate("/closet")} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-3xl gradient-accent p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Today's Suggestion</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Casual Friday</h2>
            <p className="text-muted-foreground text-sm mt-1.5 mb-6">A curated outfit based on your recent activity</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {mockOutfits[0].items.map((item) => (
                <div key={item.id} className="shrink-0 w-28 rounded-2xl overflow-hidden shadow-card bg-card group">
                  <img src={item.image_url} alt={item.category} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" />
                  <p className="text-xs font-medium p-2.5 text-center text-card-foreground">{item.category}</p>
                </div>
              ))}
            </div>
            <Button variant="hero" size="sm" className="mt-6" onClick={() => navigate("/recommendations")}>
              View Full Recommendation <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
