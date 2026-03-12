import { Shirt, Upload, Sparkles, Shield, HelpCircle, Wand2, Camera, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppLayout } from "@/layouts/AppLayout";

const features = [
  {
    icon: Shirt,
    title: "Digital Wardrobe",
    description: "Catalog every piece you own in one organized, searchable space. Filter by category, color, season, or brand.",
  },
  {
    icon: Wand2,
    title: "Outfit Builder",
    description: "Mix and match items from your closet to create complete outfits. Save your favorites for quick access later.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get personalized outfit suggestions powered by AI that learns your style, the weather, and the occasion.",
  },
  {
    icon: Camera,
    title: "Easy Upload",
    description: "Snap a photo or drag-and-drop images. SmartClosetAI automatically detects the clothing type and color.",
  },
];

const faqItems = [
  {
    question: "Is SmartClosetAI free to use?",
    answer: "SmartClosetAI offers a free tier with core wardrobe management features. Premium AI recommendations and unlimited storage are available with a subscription.",
  },
  {
    question: "What image formats are supported?",
    answer: "We accept JPEG, PNG, and WebP images. For best results, use well-lit photos with a neutral background.",
  },
  {
    question: "How accurate are the AI recommendations?",
    answer: "Our AI improves over time as it learns your preferences. The more outfits you save and rate, the better the suggestions become.",
  },
  {
    question: "Can I share outfits with friends?",
    answer: "Outfit sharing is on our roadmap. Soon you'll be able to share looks and get feedback from friends directly in the app.",
  },
  {
    question: "How do I delete my data?",
    answer: "You can delete individual items from your closet at any time. To delete your entire account and all associated data, visit Settings.",
  },
];

const About = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-16 pb-12">
        {/* Hero */}
        <section className="text-center space-y-4 pt-4">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            About SmartClosetAI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SmartClosetAI is your AI-powered digital wardrobe assistant. Organize your clothing,
            build outfits effortlessly, and receive personalized style recommendations — all in one place.
          </p>
        </section>

        {/* Core Features */}
        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground text-center">
            Core Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How Upload Works */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <Upload className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">How Uploading Works</h2>
          </div>
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Adding clothes to your digital closet is simple. Navigate to the <strong className="text-foreground">Upload</strong> page,
                then either drag-and-drop an image or click to browse your files.
              </p>
              <p>
                Fill in a few details — like category, color, and season — and hit save.
                Your item is instantly added to your closet and available for outfit building and recommendations.
              </p>
              <p>
                For best results, photograph items on a flat surface or hanger with good lighting.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How AI Works */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">How AI Recommendations Work</h2>
          </div>
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                SmartClosetAI uses machine learning to analyze your wardrobe — considering colors, categories, seasonal
                suitability, and style patterns from outfits you've saved.
              </p>
              <p>
                The recommendation engine suggests complete outfits based on the occasion, current weather,
                and your personal preferences. It improves over time as you interact with suggestions.
              </p>
              <p>
                All processing happens on our secure backend. Your clothing data is never shared with third parties
                or used for advertising.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Privacy Note */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Your Privacy Matters</h2>
          </div>
          <Card className="border-border bg-accent/30 shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-2 text-muted-foreground leading-relaxed">
              <p>
                Images you upload are stored securely and used solely to power your wardrobe experience.
                We do not sell, share, or use your photos for any purpose beyond providing SmartClosetAI features.
              </p>
              <p>
                You retain full ownership of your content and can delete any item or your entire account at any time
                from the Settings page.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border border-border rounded-lg px-4 bg-card shadow-[var(--shadow-xs)]">
                <AccordionTrigger className="text-foreground font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;
