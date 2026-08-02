"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Solo registrar en producción HTTPS (o localhost en pruebas)
    const isLocal =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isSecure = window.isSecureContext;
    if (!isSecure && !isLocal) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silencioso: la app sigue funcionando sin SW
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", () => void register(), { once: true });
    }
  }, []);

  return null;
}
