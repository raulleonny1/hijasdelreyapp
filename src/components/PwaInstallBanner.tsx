"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hdr_install_banner_dismissed";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || iosStandalone;
}

/**
 * Franja inferior para instalar la PWA.
 * En Chrome/Android usa beforeinstallprompt (instalación real).
 * En iOS muestra instrucción de “Añadir a pantalla de inicio”.
 */
export function PwaInstallBanner() {
  const { t } = useLocale();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    const iosDevice = isIos();
    setIos(iosDevice);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      sessionStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    if (iosDevice) {
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") {
      sessionStorage.setItem(DISMISS_KEY, "1");
      setVisible(false);
    }
  };

  if (!visible) return null;
  if (!ios && !deferred) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-gold/40 bg-navy text-white shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-label={t.pwa.aria}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0 text-sm leading-snug">
          <p className="font-semibold text-gold-light">{t.pwa.title}</p>
          <p className="mt-0.5 text-white/80">{ios ? t.pwa.ios : t.pwa.android}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!ios && deferred && (
            <button
              type="button"
              onClick={() => void install()}
              className="min-h-11 flex-1 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark touch-manipulation hover:bg-gold-light sm:flex-none"
            >
              {t.pwa.install}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 rounded-full border border-white/25 px-4 py-2.5 text-sm text-white/85 touch-manipulation hover:bg-white/10"
          >
            {t.pwa.later}
          </button>
        </div>
      </div>
    </div>
  );
}
