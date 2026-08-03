"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Props = {
  compact?: boolean;
  /** onDark = header/hero navy; onLight = fondos cream */
  tone?: "onDark" | "onLight";
};

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

export function PwaInstallButton({ compact = false, tone = "onDark" }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !visible) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setVisible(false);
      }
      setDeferred(null);
      return;
    }
    setShowHelp((v) => !v);
  };

  const btnClass =
    tone === "onLight"
      ? compact
        ? "rounded-full border border-navy/25 bg-navy px-3 py-1.5 text-xs font-semibold text-white touch-manipulation hover:bg-navy-light"
        : "w-full rounded-full bg-navy px-8 py-3.5 text-sm font-semibold text-white touch-manipulation hover:bg-navy-light sm:w-auto sm:min-w-[200px] sm:px-10 sm:py-4 sm:text-base"
      : compact
        ? "rounded-full border border-gold/50 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-light touch-manipulation hover:bg-gold/25"
        : "w-full rounded-full border border-gold/60 bg-gold/20 px-8 py-3.5 text-sm font-semibold text-gold-light touch-manipulation hover:bg-gold/30 sm:w-auto sm:min-w-[200px] sm:px-10 sm:py-4 sm:text-base";

  return (
    <div className={compact ? "relative" : "w-full max-w-sm sm:max-w-none"}>
      <button type="button" onClick={() => void handleClick()} className={btnClass}>
        Instalar aplicación
      </button>

      {showHelp && (
        <div
          className={`z-50 mt-2 rounded-xl border p-3 text-left text-xs leading-relaxed shadow-xl ${
            compact ? "absolute right-0 top-full w-64" : "mx-auto max-w-sm"
          } ${
            tone === "onLight"
              ? "border-navy/15 bg-white text-navy/85"
              : "border-white/20 bg-navy-dark/95 text-white/90"
          }`}
        >
          {isIos() ? (
            <p>
              En iPhone/iPad: toque <strong>Compartir</strong> y luego{" "}
              <strong>Añadir a pantalla de inicio</strong>.
            </p>
          ) : deferred ? (
            <p>Siga las instrucciones del navegador para instalar.</p>
          ) : (
            <p>
              En Chrome/Android: menú <strong>⋮</strong> → <strong>Instalar aplicación</strong> o{" "}
              <strong>Añadir a la pantalla de inicio</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
