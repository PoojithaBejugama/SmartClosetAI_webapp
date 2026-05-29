import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/layouts/AppLayout";
import { UploadDropzone } from "@/components/UploadDropzone";
import { useToast } from "@/hooks/use-toast";
import { useUploadClothing } from "@/hooks/useClothing";
import { clothingService } from "@/services/clothingService";
import { Loader2, Sparkles } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadClothingSchema, type UploadClothingFormData } from "@/utils/validations";

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiDetected, setAiDetected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const uploadMutation = useUploadClothing();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<UploadClothingFormData>({
    resolver: zodResolver(uploadClothingSchema),
    defaultValues: {
      name: "",
      category: "",
      color: "",
      season: "",
      occasion: "",
      description: "",
      material_guess: "",
      recommendation_notes: "",
      style_tags: [],
      notes: "",
    },
  });

  const handleFile = async (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAiDetected(false);
    setAnalyzing(true);

    try {
      // Photo selection triggers Gemini analysis before save, keeping all AI fields editable.
      const metadata = await clothingService.analyze(f);
      setValue("name", metadata.name);
      setValue("category", metadata.category);
      setValue("color", metadata.color);
      setValue("season", metadata.season);
      setValue("occasion", metadata.occasion);
      setValue("description", metadata.description);
      setValue("material_guess", metadata.material_guess);
      setValue("recommendation_notes", metadata.recommendation_notes);
      setValue("style_tags", metadata.style_tags);
      setValue("ai_confidence", metadata.ai_confidence);
      setAiDetected(true);
    } catch (err: any) {
      toast({
        title: "AI metadata failed",
        description: err.message || "You can still enter the item details manually.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const onSubmit = async (data: UploadClothingFormData) => {
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          name: data.name,
          category: data.category,
          color: data.color,
          season: data.season,
          occasion: data.occasion,
          description: data.description,
          material_guess: data.material_guess,
          recommendation_notes: data.recommendation_notes,
          style_tags: data.style_tags,
          ai_confidence: data.ai_confidence,
          // User notes stay separate from AI-generated description and recommendation notes.
          notes: data.notes,
        },
      });
      toast({ title: "Item saved!", description: "Your clothing item has been added to your closet." });
      navigate("/closet");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const clearUpload = () => {
    setFile(null);
    setPreview(null);
    setAiDetected(false);
    setAnalyzing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Upload Clothing Item</h1>
          <p className="text-muted-foreground mt-1">Add a new piece to your digital wardrobe</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <UploadDropzone
                onFileSelect={handleFile}
                preview={preview}
                onClear={clearUpload}
              />
            </div>

            <div className="rounded-2xl bg-card shadow-card p-6 space-y-5">
              {analyzing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-muted-foreground">Analyzing clothing metadata...</span>
                </div>
              )}
              {aiDetected && !analyzing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">AI detected metadata - you can edit before saving</span>
                </div>
              )}

              <div>
                <Label className="text-foreground">Item Name</Label>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input {...field} placeholder="AI will suggest a name" className="mt-1.5" />
                )} />
              </div>

              <div>
                <Label className="text-foreground">Category</Label>
                <Controller name="category" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessories"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <Label className="text-foreground">Color</Label>
                <Controller name="color" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select color" /></SelectTrigger>
                    <SelectContent>
                      {["Black", "White", "Navy", "Beige", "Red", "Blue", "Green", "Pink", "Gold", "Silver"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.color && <p className="text-xs text-destructive mt-1">{errors.color.message}</p>}
              </div>

              <div>
                <Label className="text-foreground">Season</Label>
                <Controller name="season" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select season" /></SelectTrigger>
                    <SelectContent>
                      {["Spring", "Summer", "Fall", "Winter", "All Season"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.season && <p className="text-xs text-destructive mt-1">{errors.season.message}</p>}
              </div>

              <div>
                <Label className="text-foreground">Occasion</Label>
                <Controller name="occasion" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select occasion" /></SelectTrigger>
                    <SelectContent>
                      {["Casual", "Formal", "Business", "Party", "Sport", "Date Night"].map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.occasion && <p className="text-xs text-destructive mt-1">{errors.occasion.message}</p>}
              </div>

              <div>
                <Label className="text-foreground">AI Description</Label>
                <Controller name="description" control={control} render={({ field }) => (
                  <Textarea {...field} placeholder="AI-generated item description..." className="mt-1.5 resize-none" rows={4} />
                )} />
              </div>

              <div>
                <Label className="text-foreground">Material Guess</Label>
                <Controller name="material_guess" control={control} render={({ field }) => (
                  <Input {...field} placeholder="e.g. cotton fleece" className="mt-1.5" />
                )} />
              </div>

              <div>
                <Label className="text-foreground">Recommendation Notes</Label>
                <Controller name="recommendation_notes" control={control} render={({ field }) => (
                  <Textarea {...field} placeholder="How this piece can be styled..." className="mt-1.5 resize-none" rows={3} />
                )} />
              </div>

              <div>
                <Label className="text-foreground">Style Tags</Label>
                <Controller name="style_tags" control={control} render={({ field }) => (
                  <Input
                    value={(field.value || []).join(", ")}
                    onChange={(event) => {
                      // Tags are edited as comma-separated text, then stored as a string array for recommendations.
                      field.onChange(event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean));
                    }}
                    placeholder="casual, layering-piece, cozy"
                    className="mt-1.5"
                  />
                )} />
              </div>

              <div>
                <Label className="text-foreground">Personal Notes</Label>
                <Controller name="notes" control={control} render={({ field }) => (
                  <Textarea {...field} placeholder="Add your own notes about this item..." className="mt-1.5 resize-none" rows={3} />
                )} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="hero" className="flex-1" disabled={!file || analyzing || uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Saving..." : analyzing ? "Analyzing..." : "Save Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/closet")}>Cancel</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
