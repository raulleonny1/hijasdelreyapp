"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/sound/alzad-la-cruz.m4a";
const START_SEC = 30;
const END_SEC = 36; // 6 segundos de música + logo
const FADE_IN_SEC = 1.1;
const FADE_OUT_SEC = 1.2;
const SESSION_KEY = "hdr_welcome_intro_played";

type Phase = "hidden" | "enter" | "visible" | "exit";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function WelcomeIntro() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishRef = useRef<(() => void) | null>(null);
  const startPlaybackRef = useRef<(() => Promise<void>) | null>(null);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    let cancelled = false;
    let finished = false;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;

    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.volume = 0;
    // iOS / Safari: evita fullscreen y mejora reproducción en móvil
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audioRef.current = audio;

    const stopRaf = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      if (safetyTimer) clearTimeout(safetyTimer);
      stopRaf();
      setPhase("exit");
      window.setTimeout(() => {
        if (!cancelled) setPhase("hidden");
      }, 800);
      try {
        audio.muted = true;
        audio.volume = 0;
        audio.pause();
      } catch {
        /* ignore */
      }
    };
    finishRef.current = finish;

    const updateVolume = () => {
      if (finished || cancelled) return;
      const t = audio.currentTime;
      const elapsed = t - START_SEC;
      const remaining = END_SEC - t;

      let vol = 1;
      if (elapsed < FADE_IN_SEC) {
        vol = clamp(elapsed / FADE_IN_SEC, 0, 1);
      } else if (remaining < FADE_OUT_SEC) {
        vol = clamp(remaining / FADE_OUT_SEC, 0, 1);
      }

      // Asegurar sonido (Chrome Android exige muted=false además de volume)
      if (audio.muted) audio.muted = false;
      audio.volume = vol;

      if (t >= END_SEC) {
        finish();
        return;
      }
      raf = requestAnimationFrame(updateVolume);
    };

    const seekToStart = async () => {
      try {
        if (audio.readyState < 1) {
          await new Promise<void>((resolve, reject) => {
            const onOk = () => {
              cleanup();
              resolve();
            };
            const onErr = () => {
              cleanup();
              reject(new Error("audio error"));
            };
            const cleanup = () => {
              audio.removeEventListener("loadedmetadata", onOk);
              audio.removeEventListener("error", onErr);
            };
            audio.addEventListener("loadedmetadata", onOk, { once: true });
            audio.addEventListener("error", onErr, { once: true });
            audio.load();
          });
        }
        audio.currentTime = START_SEC;
      } catch {
        /* ignore seek errors */
      }
    };

    const playClip = async () => {
      stopRaf();
      await seekToStart();

      // Chrome Android bloquea autoplay CON sonido.
      // Arrancar muted (permitido) y luego subir volumen = suena sin toque.
      audio.muted = true;
      audio.volume = 0;
      await audio.play();

      if (cancelled) return;

      // Ya está reproduciendo: quitar mute y hacer fade-in
      audio.muted = false;
      setBlocked(false);
      setPhase("enter");
      window.setTimeout(() => {
        if (!cancelled && !finished) setPhase("visible");
      }, 40);
      raf = requestAnimationFrame(updateVolume);
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = setTimeout(finish, (END_SEC - START_SEC) * 1000 + 900);
    };
    startPlaybackRef.current = playClip;

    const tryAutoplay = async () => {
      try {
        await playClip();
      } catch {
        if (cancelled) return;
        // Solo si el navegador bloquea incluso muted: pedir un toque
        setBlocked(true);
        setPhase("enter");
        window.setTimeout(() => {
          if (!cancelled && !finished) setPhase("visible");
        }, 40);
      }
    };

    const onMeta = () => {
      void tryAutoplay();
    };

    if (audio.readyState >= 1) {
      void tryAutoplay();
    } else {
      audio.addEventListener("loadedmetadata", onMeta, { once: true });
      audio.load();
    }

    audio.addEventListener("ended", finish);

    return () => {
      cancelled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      stopRaf();
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("loadedmetadata", onMeta);
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
      finishRef.current = null;
      startPlaybackRef.current = null;
    };
  }, []);

  const handleTap = async () => {
    if (!blocked) return;
    try {
      await startPlaybackRef.current?.();
    } catch {
      finishRef.current?.();
    }
  };

  if (phase === "hidden") return null;

  const show = phase === "enter" || phase === "visible";
  const exiting = phase === "exit";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 backdrop-blur-[2px] transition-opacity duration-700 touch-manipulation pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Bienvenida — La Orden de las Hijas del Rey"
      onClick={() => void handleTap()}
    >
      <div
        className={`flex flex-col items-center gap-4 px-6 transition-all duration-700 ease-out ${
          show && !exiting
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-90 opacity-0"
        }`}
      >
        <div className="welcome-logo-stage">
          <div className="welcome-rays" aria-hidden />
          <div className="welcome-glow" aria-hidden />
          <div className="welcome-ring welcome-ring-a" aria-hidden />
          <div className="welcome-ring welcome-ring-b" aria-hidden />
          <span className="welcome-spark" style={{ top: "8%", left: "52%" }} aria-hidden />
          <span
            className="welcome-spark"
            style={{ top: "42%", right: "4%", animationDelay: "0.4s" }}
            aria-hidden
          />
          <span
            className="welcome-spark"
            style={{ bottom: "12%", left: "18%", animationDelay: "0.9s" }}
            aria-hidden
          />
          <span
            className="welcome-spark"
            style={{ top: "22%", left: "10%", animationDelay: "1.2s" }}
            aria-hidden
          />
          <Image
            src="/logo.jpeg"
            alt="La Orden de las Hijas del Rey"
            width={200}
            height={200}
            priority
            className="welcome-logo-img relative z-[2] h-36 w-36 rounded-full shadow-2xl ring-2 ring-gold/70 sm:h-44 sm:w-44"
          />
        </div>
        <p className="max-w-[16rem] text-center font-serif text-lg leading-snug text-gold-light drop-shadow sm:max-w-none sm:text-xl">
          La Orden de las Hijas del Rey
        </p>
        {blocked && (
          <p className="max-w-xs text-center text-sm text-white/80">
            Toque para escuchar el himno
          </p>
        )}
      </div>
    </div>
  );
}
