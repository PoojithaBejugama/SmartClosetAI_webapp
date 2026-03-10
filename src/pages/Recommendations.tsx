import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/layouts/AppLayout";
import { ClothingCard } from "@/components/ClothingCard";
import { EmptyState } from "@/components/EmptyState";
import { mockClothingItems, mockRecommendations } from "@/data/mockData";
import type { ClothingItem, Recommendation } from "@/types";
import { Sparkles, RefreshCw, BookmarkPlus, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function RecommendationsPage() {
  const { toast } = useToast();
  const [anchor, setAnchor] = useState<ClothingItem | null>(null);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(mockRecommendations);
      setLoading(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider">AI-Powered</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Outfit Recommendations</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Choose an item and let SmartCloset build outfit ideas from your wardrobe</p>
        </div>

        <div className="rounded-2xl bg-card shadow-card p-7">
          <h2 className="font-heading font-semibold text-foreground mb-5 tracking-tight">Select an anchor item</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {mockClothingItems.slice(0, 6).map((item) => (
              <ClothingCard key={item.id} item={item} selectable selected={anchor?.id === item.id} onSelect={(i) => setAnchor(i)} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="hero" onClick={handleGenerate} disabled={!anchor || loading} className="h-11">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Generate Recommendations
            </Button>
            {anchor && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full gradient-subtle text-sm">
                <img src={anchor.image_url} alt="" className="h-5 w-5 rounded object-cover" />
                <span className="text-muted-foreground text-xs font-medium">{anchor.category} · {anchor.color}</span>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card shadow-card overflow-hidden animate-pulse">
                <div className="grid grid-cols-3 gap-px">
                  {[1, 2, 3].map((j) => <div key={j} className="aspect-square bg-muted" />)}
                </div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded-lg w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-5 w-14 bg-muted rounded-full" />
                    <div className="h-5 w-14 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && generated && results.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {results.map((rec, i) => (
              <motion.div
                key={rec.outfit_name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="rounded-2xl bg-card shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="grid grid-cols-3 gap-px bg-muted">
                  {rec.items.map((item) => (
                    <div key={item.id} className="overflow-hidden">
                      <img src={item.image_url} alt={item.category} className="aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-lg text-card-foreground tracking-tight">{rec.outfit_name}</h3>
                  <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{rec.explanation}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {rec.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full gradient-subtle text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border">
                    {rec.items.map((item) => (
                      <div key={item.id} className="h-7 w-7 rounded-md overflow-hidden ring-2 ring-card">
                        <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-2">{rec.items.length} pieces</span>
                  </div>
                  <div className="flex gap-2.5 mt-5">
                    <Button variant="hero" size="sm" onClick={() => toast({ title: "Outfit saved!" })} className="text-xs">
                      <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" /> Save Outfit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} className="text-xs rounded-xl">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !generated && (
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            description="Select an anchor item above and click generate to get AI-powered outfit suggestions tailored to your wardrobe."
          />
        )}
      </div>
    </AppLayout>
  );
}
