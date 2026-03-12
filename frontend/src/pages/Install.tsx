import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle2, Share, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Install SmartClosetAI
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Add SmartClosetAI to your home screen for the best mobile experience — fast, offline-ready, and always one tap away.
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="font-semibold text-foreground">SmartClosetAI is installed!</p>
              <p className="text-sm text-muted-foreground">Open it from your home screen.</p>
              <Link to="/dashboard">
                <Button className="mt-2">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full h-12 text-[15px] gap-2">
            <Download className="h-5 w-5" /> Install App
          </Button>
        ) : isIOS ? (
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-4 text-left">
              <p className="font-semibold text-foreground text-center">How to install on iPhone / iPad</p>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 text-primary mx-0.5" /> <strong className="text-foreground">Share</strong> button in Safari</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong className="text-foreground">"Add"</strong> to confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card shadow-[var(--shadow-card)]">
            <CardContent className="p-6 space-y-4 text-left">
              <p className="font-semibold text-foreground text-center">How to install on Android</p>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <MoreVertical className="inline h-4 w-4 text-primary mx-0.5" /> <strong className="text-foreground">menu</strong> in your browser</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <span>Tap <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <span>Confirm by tapping <strong className="text-foreground">"Install"</strong></span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to SmartClosetAI
        </Link>
      </div>
    </div>
  );
}
