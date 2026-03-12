import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  preview?: string | null;
  onClear?: () => void;
}

export function UploadDropzone({ onFileSelect, preview, onClear }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden shadow-card bg-card"
      >
        <img src={preview} alt="Preview" className="w-full aspect-[3/4] object-cover" />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-card/90 backdrop-blur-md hover:bg-card transition-all shadow-card hover:shadow-card-hover"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        )}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-md text-xs font-medium text-foreground shadow-xs">
          <Camera className="h-3 w-3 inline mr-1.5 text-primary" />
          Ready to save
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer group",
        dragOver
          ? "border-primary bg-secondary/80 scale-[1.01]"
          : "border-border hover:border-primary/40 hover:bg-secondary/30"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "p-5 rounded-2xl transition-all duration-300",
          dragOver ? "gradient-primary scale-110" : "gradient-subtle group-hover:scale-105"
        )}>
          {dragOver
            ? <ImageIcon className="h-8 w-8 text-primary-foreground" />
            : <Upload className="h-8 w-8 text-primary" />
          }
        </div>
        <div className="space-y-1.5">
          <p className="font-medium text-foreground text-[15px]">
            {dragOver ? "Drop to upload" : "Drop your image here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or <span className="text-primary font-medium">browse files</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">PNG, JPG, WEBP · Max 10MB</p>
        </div>
      </div>
    </div>
  );
}
