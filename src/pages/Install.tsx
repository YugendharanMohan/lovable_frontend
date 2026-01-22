import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Factory, Download, Smartphone, CheckCircle, Share, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card p-8 rounded-2xl shadow-elevated border text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-brand">
              <Factory className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight uppercase">
              ASM Billing System
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Install for quick access
            </p>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">App Installed!</span>
              </div>
              <p className="text-muted-foreground text-sm">
                You can now access ASM Billing from your home screen.
              </p>
              <Button asChild className="w-full" size="lg">
                <a href="/">Open App</a>
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <p className="font-medium text-foreground">To install on iPhone/iPad:</p>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Scroll down and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Tap "Add" to confirm</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
              <p className="text-muted-foreground text-xs">
                No app store needed. Works offline.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                <p className="font-medium text-foreground">To install on Android:</p>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> menu in Chrome</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Select "Add to Home screen" or "Install app"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Tap "Install" to confirm</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Smartphone className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Works offline</p>
              </div>
              <div>
                <Download className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">No download</p>
              </div>
              <div>
                <CheckCircle className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Auto updates</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/" className="hover:text-primary">← Back to login</a>
        </p>
      </div>
    </div>
  );
}
