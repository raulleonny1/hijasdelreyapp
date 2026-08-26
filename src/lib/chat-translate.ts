import type { ChatLocale } from "@/types/chat";

type CacheEntry = { text: string; expires: number };

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 6;

function cacheKey(text: string, from: ChatLocale, to: ChatLocale): string {
  return `${from}|${to}|${text}`;
}

export async function translateText(
  text: string,
  from: ChatLocale,
  to: ChatLocale,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || from === to) return trimmed;

  const key = cacheKey(trimmed, from, to);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.text;
  }

  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", trimmed.slice(0, 500));
    url.searchParams.set("langpair", `${from}|${to}`);

    const res = await fetch(url.toString(), {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated || data.responseStatus !== 200) return null;

    // MyMemory sometimes echoes "MYMEMORY WARNING..." for quota
    if (/MYMEMORY WARNING/i.test(translated)) return null;

    cache.set(key, { text: translated, expires: Date.now() + TTL_MS });
    return translated;
  } catch (e) {
    console.error("[translate]", e);
    return null;
  }
}
