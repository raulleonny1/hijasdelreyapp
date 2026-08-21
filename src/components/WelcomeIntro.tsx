"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

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

/** iPhone / iPad (incluye iPadOS que se reporta como Mac). */
function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  // iPadOS 13+: Safari se identifica como Macintosh con pantalla táctil
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function WelcomeIntro() {
  const { t } = useLocale();
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
    const onApple = isAppleTouchDevice();

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

      if (audio.muted) audio.muted = false;
      audio.volume = vol;

      if (t >= END_SEC) {
        finish();
        return;
      }
      raf = requestAnimationFrame(updateVolume);
    };

    const showPlayingUi = () => {
      setBlocked(false);
      setPhase("enter");
      window.setTimeout(() => {
        if (!cancelled && !finished) setPhase("visible");
      }, 40);
      raf = requestAnimationFrame(updateVolume);
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = setTimeout(finish, (END_SEC - START_SEC) * 1000 + 900);
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
              reject(new Error("audio-load-failed"));
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
        /* ignore seek errors; play from wherever we can */
      }
    };

    const playClip = async () => {
      stopRaf();
      await seekToStart();

      // 1) Sonido real (PC e iPad cuando Safari lo permite)
      try {
        audio.muted = false;
        audio.volume = 0;
        await audio.play();
        if (cancelled) return;
        // Si Safari dejó muted a true, no hay audio → no fingir éxito
        if (audio.muted) {
          audio.pause();
          throw new Error("still-muted");
        }
        showPlayingUi();
        return;
      } catch {
        /* bloqueado sin gesto */
      }

      // 2) Android Chrome: muted primero, luego unmute + fade
      //    En iPad/iPhone NO usar esto: unmute sin gesto no suena y
      //    ocultaría el mensaje "Toque para escuchar".
      if (!onApple) {
        try {
          audio.muted = true;
          audio.volume = 0;
          await seekToStart();
          await audio.play();
          if (cancelled) return;
          audio.muted = false;
          if (audio.muted) {
            audio.pause();
            throw new Error("unmute-failed");
          }
          showPlayingUi();
          return;
        } catch {
          /* caer a tap */
        }
      }

      throw new Error("autoplay-blocked");
    };
    startPlaybackRef.current = playClip;

    let autoplayStarted = false;
    const tryAutoplay = async () => {
      if (autoplayStarted || cancelled || finished) return;
      autoplayStarted = true;
      try {
        await playClip();
      } catch {
        if (cancelled) return;
        setBlocked(true);
        setPhase("enter");
        window.setTimeout(() => {
          if (!cancelled && !finished) setPhase("visible");
        }, 40);
      }
    };

    const onReady = () => {
      void tryAutoplay();
    };

    if (audio.readyState >= 1) {
      void tryAutoplay();
    } else {
      audio.addEventListener("loadedmetadata", onReady, { once: true });
      // canplay ayuda en Safari cuando el seek a 30s necesita más buffer
      audio.addEventListener("canplay", onReady, { once: true });
      audio.load();
    }

    audio.addEventListener("ended", finish);

    return () => {
      cancelled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      stopRaf();
      audio.removeEventListener("ended", finish);
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("canplay", onReady);
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
      aria-label={t.welcome.aria}
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
            alt={t.brand}
            width={200}
            height={200}
            priority
            className="welcome-logo-img relative z-[2] h-36 w-36 rounded-full shadow-2xl ring-2 ring-gold/70 sm:h-44 sm:w-44"
          />
        </div>
        <p className="max-w-[16rem] text-center font-serif text-lg leading-snug text-gold-light drop-shadow sm:max-w-none sm:text-xl">
          {t.brand}
        </p>
        {blocked && (
          <p className="max-w-xs text-center text-sm text-white/80">{t.welcome.tap}</p>
        )}
      </div>
    </div>
  );
}
