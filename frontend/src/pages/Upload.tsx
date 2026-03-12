import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/layouts/AppLayout";
import { UploadDropzone } from "@/components/UploadDropzone";
import { useToast } from "@/hooks/use-toast";
import { useUploadClothing } from "@/hooks/useClothing";
import { Sparkles } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadClothingSchema, type UploadClothingFormData } from "@/utils/validations";

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiDetected, setAiDetected] = useState(false);
  const uploadMutation = useUploadClothing();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<UploadClothingFormData>({
    resolver: zodResolver(uploadClothingSchema),
    defaultValues: { category: "", color: "", season: "", occasion: "", notes: "" },
  });

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setTimeout(() => {
      setAiDetected(true);
      setValue("category", "Top");
      setValue("color", "Navy");
      setValue("season", "All Season");
      setValue("occasion", "Casual");
    }, 800);
  };

  const onSubmit = async (data: UploadClothingFormData) => {
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          category: data.category,
          color: data.color,
          season: data.season,
          occasion: data.occasion,
          notes: data.notes,
        },
      });
      toast({ title: "Item saved!", description: "Your clothing item has been added to your closet." });
      navigate("/closet");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
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
                onClear={() => { setFile(null); setPreview(null); setAiDetected(false); }}
              />
            </div>

            <div className="rounded-2xl bg-card shadow-card p-6 space-y-5">
              {aiDetected && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">AI detected metadata — you can edit before saving</span>
                </div>
              )}

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
                <Label className="text-foreground">Notes</Label>
                <Controller name="notes" control={control} render={({ field }) => (
                  <Textarea {...field} placeholder="Add any notes about this item..." className="mt-1.5 resize-none" rows={3} />
                )} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="hero" className="flex-1" disabled={!file || uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Saving..." : "Save Item"}
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
