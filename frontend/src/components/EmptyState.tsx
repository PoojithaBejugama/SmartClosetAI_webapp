import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Package, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-xl scale-150" />
        <div className="relative p-5 rounded-2xl gradient-subtle shadow-card">
          <Icon className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h3 className="font-heading text-2xl font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 text-[15px] leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="hero" size="lg">{actionLabel}</Button>
      )}
    </motion.div>
  );
}
