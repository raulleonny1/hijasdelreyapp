"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAT_UNREAD_EVENT } from "@/lib/chat-constants";
import { useLocale } from "@/components/LocaleProvider";
import type { ChatMember, ChatMessage, ChatRoom } from "@/types/chat";

const EMOJIS = [
  "🙏", "✝️", "❤️", "🕊️", "✨", "🌸", "😊", "🥰", "😇", "🤗",
  "👍", "👏", "🎉", "💪", "🌹", "☀️", "🌙", "⭐", "💌", "🤝",
  "😢", "😌", "🤔", "🙌", "💐", "🎀", "☕", "📖", "🕯️", "💜",
];

type SessionUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
};

function formatTime(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(locale === "en" ? "en-GB" : "es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function MessageBubble({
  message,
  isOwn,
  locale,
  t,
}: {
  message: ChatMessage;
  isOwn: boolean;
  locale: "es" | "en";
  t: ReturnType<typeof useLocale>["t"];
}) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translating, setTranslating] = useState(false);
  const needsTranslation =
    message.type === "text" &&
    message.text &&
    message.sourceLocale !== locale &&
    !isOwn;

  useEffect(() => {
    if (!needsTranslation) {
      setTranslated(null);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    const q = new URLSearchParams({
      text: message.text,
      from: message.sourceLocale,
      to: locale,
    });
    fetch(`/api/chat/translate?${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        if (d.translated && d.translated !== message.text && !d.fallback) {
          setTranslated(d.translated);
        } else {
          setTranslated(null);
        }
      })
      .catch(() => {
        if (!cancelled) setTranslated(null);
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [needsTranslation, message.text, message.sourceLocale, locale]);

  const displayText =
    needsTranslation && translated && !showOriginal ? translated : message.text;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[70%] ${
          isOwn
            ? "rounded-br-md bg-navy text-white"
            : "rounded-bl-md border border-navy/10 bg-white text-navy"
        }`}
      >
        {!isOwn ? (
          <p className="mb-1 text-[11px] font-semibold tracking-wide text-gold">
            {message.senderName}
          </p>
        ) : null}

        {message.type === "audio" ? (
          <div className="space-y-1.5">
            <p className={`text-xs ${isOwn ? "text-white/70" : "text-navy/50"}`}>
              {t.chat.audioMessage}
              {message.audioDurationMs
                ? ` · ${formatDuration(message.audioDurationMs)}`
                : ""}
            </p>
            {message.audioUrl ? (
              <audio controls preload="metadata" className="max-w-full" src={message.audioUrl}>
                <track kind="captions" />
              </audio>
            ) : (
              <p className={`text-sm ${isOwn ? "text-white/80" : "text-navy/60"}`}>…</p>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-[15px]">
            {displayText}
          </p>
        )}

        <div
          className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] ${
            isOwn ? "text-white/55" : "text-navy/40"
          }`}
        >
          <span>{formatTime(message.createdAt, locale)}</span>
          {needsTranslation && translating ? <span>…</span> : null}
          {needsTranslation && translated ? (
            <>
              <span aria-hidden>·</span>
              <span>{t.chat.translated}</span>
              <button
                type="button"
                className={`underline-offset-2 hover:underline ${
                  isOwn ? "text-gold-light" : "text-navy/60"
                }`}
                onClick={() => setShowOriginal((v) => !v)}
              >
                {showOriginal ? t.chat.showTranslation : t.chat.showOriginal}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ChatApp({ user }: { user: SessionUser }) {
  const { locale, t } = useLocale();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [mobileThread, setMobileThread] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartedRef = useRef(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCreatedAtRef = useRef<string | null>(null);
  const threadReadyRef = useRef(false);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeId) ?? null,
    [rooms, activeId],
  );

  const loadRooms = useCallback(async () => {
    const res = await fetch("/api/chat/rooms");
    if (!res.ok) throw new Error("rooms");
    const data = await res.json();
    setRooms(data.rooms ?? []);
    return data.rooms as ChatRoom[];
  }, []);

  const refreshUnreadByRoom = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/unread");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadByRoom(data.byRoom ?? {});
      window.dispatchEvent(new Event(CHAT_UNREAD_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  const markRead = useCallback(
    async (roomId: string, at?: string) => {
      try {
        await fetch("/api/chat/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, at }),
        });
        setUnreadByRoom((prev) => {
          if (!prev[roomId]) return prev;
          const next = { ...prev };
          delete next[roomId];
          return next;
        });
        window.dispatchEvent(new Event(CHAT_UNREAD_EVENT));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const loadMessages = useCallback(async (roomId: string, after?: string | null) => {
    const q = after ? `?after=${encodeURIComponent(after)}` : "";
    const res = await fetch(`/api/chat/rooms/${encodeURIComponent(roomId)}/messages${q}`);
    if (!res.ok) throw new Error("messages");
    const data = await res.json();
    return (data.messages ?? []) as ChatMessage[];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await loadRooms();
        if (cancelled) return;
        const first = list.find((r) => r.type === "community") ?? list[0] ?? null;
        if (first) {
          setActiveId(first.id);
        }
        if (!cancelled) await refreshUnreadByRoom();
      } catch {
        if (!cancelled) setError(t.chat.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRooms, refreshUnreadByRoom, t.chat.loadError]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    lastCreatedAtRef.current = null;
    threadReadyRef.current = false;
    (async () => {
      try {
        const list = await loadMessages(activeId);
        if (cancelled) return;
        setMessages(list);
        lastCreatedAtRef.current = list[list.length - 1]?.createdAt ?? null;
        threadReadyRef.current = true;
        await markRead(activeId, lastCreatedAtRef.current ?? undefined);
        if (!cancelled) await refreshUnreadByRoom();
      } catch {
        if (!cancelled) setError(t.chat.loadError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId, loadMessages, markRead, refreshUnreadByRoom, t.chat.loadError]);

  // Poll for new messages
  useEffect(() => {
    if (!activeId) return;
    const tick = async () => {
      if (!threadReadyRef.current) return;
      try {
        const after = lastCreatedAtRef.current;
        if (after) {
          const newer = await loadMessages(activeId, after);
          if (newer.length) {
            setMessages((prev) => {
              const ids = new Set(prev.map((m) => m.id));
              const merged = [...prev];
              for (const m of newer) {
                if (!ids.has(m.id)) merged.push(m);
              }
              return merged;
            });
            lastCreatedAtRef.current = newer[newer.length - 1]?.createdAt ?? after;
            await markRead(activeId, lastCreatedAtRef.current ?? undefined);
          }
        } else {
          const list = await loadMessages(activeId);
          if (list.length) {
            setMessages(list);
            lastCreatedAtRef.current = list[list.length - 1]?.createdAt ?? null;
            await markRead(activeId, lastCreatedAtRef.current ?? undefined);
          }
        }
        await loadRooms().catch(() => undefined);
        await refreshUnreadByRoom();
      } catch {
        /* ignore poll errors */
      }
    };
    const id = setInterval(tick, 2800);
    return () => clearInterval(id);
  }, [activeId, loadMessages, loadRooms, markRead, refreshUnreadByRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  const openRoom = (room: ChatRoom) => {
    setActiveId(room.id);
    setMobileThread(true);
    setShowEmoji(false);
    setError(null);
  };

  const sendText = async () => {
    if (!activeId || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    const payload = text.trim();
    setText("");
    setShowEmoji(false);
    try {
      const res = await fetch(`/api/chat/rooms/${encodeURIComponent(activeId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload, sourceLocale: locale }),
      });
      if (!res.ok) throw new Error("send");
      const data = await res.json();
      const message = data.message as ChatMessage;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      lastCreatedAtRef.current = message.createdAt;
      await loadRooms();
    } catch {
      setText(payload);
      setError(t.chat.sendError);
    } finally {
      setSending(false);
    }
  };

  const openMembers = async () => {
    setShowMembers(true);
    setMemberQuery("");
    try {
      const res = await fetch("/api/chat/members");
      if (!res.ok) throw new Error("members");
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch {
      setMembers([]);
    }
  };

  const startDm = async (member: ChatMember) => {
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: member.id }),
      });
      if (!res.ok) throw new Error("dm");
      const data = await res.json();
      const room = data.room as ChatRoom;
      await loadRooms();
      setShowMembers(false);
      openRoom(room);
      setActiveId(room.id);
    } catch {
      setError(t.chat.loadError);
    }
  };

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setRecording(false);
  }, []);

  const startRecording = async () => {
    if (!activeId || recording || sending) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recordStartedRef.current = Date.now();
      setRecordMs(0);
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        const durationMs = Date.now() - recordStartedRef.current;
        if (blob.size < 200) return;
        setSending(true);
        try {
          const form = new FormData();
          form.append("roomId", activeId);
          form.append("durationMs", String(durationMs));
          form.append("sourceLocale", locale);
          form.append("file", blob, mime.includes("mp4") ? "audio.m4a" : "audio.webm");
          const res = await fetch("/api/chat/upload", { method: "POST", body: form });
          if (!res.ok) throw new Error("audio");
          const data = await res.json();
          const message = data.message as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message],
          );
          lastCreatedAtRef.current = message.createdAt;
          await loadRooms();
        } catch {
          setError(t.chat.audioError);
        } finally {
          setSending(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      recordTimerRef.current = setInterval(() => {
        setRecordMs(Date.now() - recordStartedRef.current);
      }, 200);
    } catch {
      setError(t.chat.micDenied);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const filteredMembers = members.filter((m) => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return true;
    return `${m.nombre} ${m.apellido}`.toLowerCase().includes(q);
  });

  const roomTitle = (room: ChatRoom) => {
    if (room.type === "community") return t.chat.community;
    return room.displayName || t.chat.privateChat;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-navy/60">
        {t.chat.loading}
      </div>
    );
  }

  return (
    <div className="page-container py-4 sm:py-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t.brandShort}
          </p>
          <h1 className="font-serif text-2xl text-navy sm:text-3xl">{t.chat.title}</h1>
        </div>
        <button
          type="button"
          onClick={openMembers}
          className="rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-gold hover:bg-gold/10 sm:text-sm"
        >
          {t.chat.newPrivate}
        </button>
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex h-[min(72vh,720px)] overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        {/* Room list */}
        <aside
          className={`w-full shrink-0 border-navy/10 bg-cream/40 sm:w-72 sm:border-r lg:w-80 ${
            mobileThread ? "hidden sm:flex sm:flex-col" : "flex flex-col"
          }`}
        >
          <div className="border-b border-navy/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">
              {t.chat.title}
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {rooms.map((room) => {
              const active = room.id === activeId;
              const roomUnread = unreadByRoom[room.id] ?? 0;
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => openRoom(room)}
                    className={`flex w-full flex-col gap-0.5 border-b border-navy/5 px-4 py-3 text-left transition ${
                      active ? "bg-navy/5" : "hover:bg-navy/[0.03]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          room.type === "community"
                            ? "bg-gold/20 text-navy"
                            : "bg-navy/10 text-navy/70"
                        }`}
                      >
                        {room.type === "community" ? t.chat.community : t.chat.privateChat}
                      </span>
                      {roomUnread > 0 ? (
                        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                          {roomUnread > 99 ? "99+" : roomUnread}
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate font-medium text-navy">{roomTitle(room)}</span>
                    {room.lastMessagePreview ? (
                      <span className="truncate text-xs text-navy/45">
                        {room.lastMessagePreview}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Thread */}
        <section
          className={`min-w-0 flex-1 flex-col ${
            mobileThread ? "flex" : "hidden sm:flex"
          }`}
        >
          {activeRoom ? (
            <>
              <header className="flex items-center gap-2 border-b border-navy/10 px-3 py-3 sm:px-5">
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-sm text-navy/60 hover:bg-navy/5 sm:hidden"
                  onClick={() => setMobileThread(false)}
                >
                  ← {t.chat.back}
                </button>
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-lg text-navy">
                    {roomTitle(activeRoom)}
                  </h2>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-cream/80 to-white px-3 py-4 sm:px-5">
                {messages.length === 0 ? (
                  <p className="py-12 text-center text-sm text-navy/45">{t.chat.emptyThread}</p>
                ) : (
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isOwn={m.senderId === user.id}
                      locale={locale}
                      t={t}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <footer className="relative border-t border-navy/10 bg-white px-3 py-3 sm:px-4">
                {showEmoji ? (
                  <div className="absolute bottom-full left-3 right-3 mb-2 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-navy/10 bg-white p-2 shadow-lg sm:left-4 sm:right-auto sm:w-72">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="rounded-lg p-1.5 text-xl hover:bg-cream"
                        onClick={() => {
                          setText((prev) => prev + e);
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                ) : null}

                {recording ? (
                  <div className="mb-2 flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
                    <span>
                      {t.chat.recording} {formatDuration(recordMs)}
                    </span>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-full bg-red-700 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {t.chat.stopRecord}
                    </button>
                  </div>
                ) : null}

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    aria-label={t.chat.emoji}
                    onClick={() => setShowEmoji((v) => !v)}
                    className="shrink-0 rounded-full border border-navy/10 px-2.5 py-2 text-lg hover:bg-cream"
                  >
                    😊
                  </button>
                  <button
                    type="button"
                    aria-label={t.chat.record}
                    disabled={sending || recording}
                    onClick={startRecording}
                    className="shrink-0 rounded-full border border-navy/10 px-2.5 py-2 text-sm text-navy/70 hover:bg-cream disabled:opacity-40"
                  >
                    🎤
                  </button>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendText();
                      }
                    }}
                    rows={1}
                    placeholder={t.chat.placeholder}
                    className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-navy/15 bg-cream/50 px-3 py-2.5 text-sm text-navy outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                  />
                  <button
                    type="button"
                    disabled={sending || !text.trim()}
                    onClick={() => void sendText()}
                    className="shrink-0 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-40"
                  >
                    {t.chat.send}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-navy/45">
              {t.chat.selectConversation}
            </div>
          )}
        </section>
      </div>

      {showMembers ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 p-4 sm:items-center"
          role="dialog"
          aria-modal
        >
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
              <h3 className="font-serif text-lg text-navy">{t.chat.membersTitle}</h3>
              <button
                type="button"
                className="text-sm text-navy/50 hover:text-navy"
                onClick={() => setShowMembers(false)}
              >
                {t.chat.cancel}
              </button>
            </div>
            <div className="px-4 py-3">
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder={t.chat.searchMembers}
                className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm outline-none focus:border-gold/50"
              />
            </div>
            <ul className="max-h-72 overflow-y-auto pb-3">
              {filteredMembers.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-navy/45">{t.chat.noMembers}</li>
              ) : (
                filteredMembers.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => void startDm(m)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-cream"
                    >
                      <span className="font-medium text-navy">
                        {m.nombre} {m.apellido}
                      </span>
                      <span className="text-xs text-gold">{t.chat.startChat}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
