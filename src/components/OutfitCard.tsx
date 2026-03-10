import { Eye, Pencil, Trash2, Calendar } from "lucide-react";
import type { Outfit } from "@/types";
import { motion } from "framer-motion";

interface OutfitCardProps {
  outfit: Outfit;
  onView?: (outfit: Outfit) => void;
  onEdit?: (outfit: Outfit) => void;
  onDelete?: (outfit: Outfit) => void;
}

export function OutfitCard({ outfit, onView, onEdit, onDelete }: OutfitCardProps) {
  const date = new Date(outfit.created_at);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-2xl shadow-card bg-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 group"
    >
      {/* Overlapping image layout */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          {outfit.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex-1 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/40 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-heading font-semibold text-lg text-card-foreground leading-snug">{outfit.name}</h3>
        <div className="flex items-center gap-2.5 mt-2.5">
          {outfit.occasion && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full gradient-subtle text-muted-foreground">
              {outfit.occasion}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {dateStr}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {outfit.items.length} pieces
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-4">
          {outfit.items.map((item, i) => (
            <div key={i} className="h-8 w-8 rounded-lg overflow-hidden ring-2 ring-card shadow-xs">
              <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border">
          {onView && (
            <button onClick={() => onView(outfit)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(outfit)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(outfit)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-auto">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
