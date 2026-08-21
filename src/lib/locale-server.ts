import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

export const LOCALE_COOKIE = "hdr_locale";

export async function getRequestLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    const value = jar.get(LOCALE_COOKIE)?.value;
    if (value === "en" || value === "es") return value;
  } catch {
    /* cookies() puede fallar fuera de request */
  }
  return "es";
}
