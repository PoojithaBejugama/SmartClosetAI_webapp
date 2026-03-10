import { useState } from "react";
import { Heart, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ClothingItem } from "@/types";
import { motion } from "framer-motion";

interface ClothingCardProps {
  item: ClothingItem;
  onView?: (item: ClothingItem) => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
  onAddToOutfit?: (item: ClothingItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (item: ClothingItem) => void;
}

export function ClothingCard({ item, onView, onEdit, onDelete, onAddToOutfit, selectable, selected, onSelect }: ClothingCardProps) {
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(item.favorite);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden shadow-card cursor-pointer bg-card transition-shadow duration-300",
        hovered && "shadow-card-hover",
        selectable && selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectable ? onSelect?.(item) : onView?.(item)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={item.image_url}
          alt={`${item.color} ${item.category}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />
      </div>

      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent flex items-end justify-center pb-16 gap-2.5 transition-opacity duration-300",
        hovered && !selectable ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {!selectable && (
          <>
            {onView && <ActionBtn icon={Eye} label="View" onClick={() => onView(item)} />}
            {onEdit && <ActionBtn icon={Pencil} label="Edit" onClick={() => onEdit(item)} />}
            {onDelete && <ActionBtn icon={Trash2} label="Delete" onClick={() => onDelete(item)} />}
            {onAddToOutfit && <ActionBtn icon={Plus} label="Add" onClick={() => onAddToOutfit(item)} />}
          </>
        )}
      </div>

      {/* Favorite button */}
      <button
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200",
          fav
            ? "bg-primary/15 backdrop-blur-md"
            : "bg-card/70 backdrop-blur-md opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
      >
        <Heart className={cn(
          "h-3.5 w-3.5 transition-colors",
          fav ? "fill-primary text-primary" : "text-foreground/70"
        )} />
      </button>

      {/* Selected check */}
      {selectable && selected && (
        <div className="absolute top-3 left-3 z-10 p-1.5 rounded-full gradient-primary">
          <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Info footer */}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-card-foreground tracking-tight">{item.category}</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.color}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 tracking-wide">
          {item.season} · {item.occasion}
        </p>
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      className="p-2.5 rounded-xl bg-card/95 backdrop-blur-sm hover:bg-card text-card-foreground transition-all hover:scale-105 shadow-xs"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
